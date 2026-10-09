"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board, Column, JobApplication } from "@/lib/models";

export interface CreateJobApplicationInput {
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  tags?: string[];
  description?: string;
  columnId: string;
  boardId: string;
}

function cleanOptionalText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

export async function createJobApplication(input: CreateJobApplicationInput) {
  if (!input || typeof input !== "object") {
    return { error: "Invalid job application details." };
  }

  const session = await getSession();
  if (!session?.user) {
    return { error: "Please sign in before adding a job application." };
  }

  const company = cleanOptionalText(input?.company, 200);
  const position = cleanOptionalText(input?.position, 200);
  if (!company || !position) {
    return { error: "Company and position are required." };
  }

  if (
    !mongoose.Types.ObjectId.isValid(input.boardId) ||
    !mongoose.Types.ObjectId.isValid(input.columnId)
  ) {
    return { error: "The selected board or column is invalid." };
  }

  const location = cleanOptionalText(input.location, 200);
  const notes = cleanOptionalText(input.notes, 5000);
  const salary = cleanOptionalText(input.salary, 200);
  const description = cleanOptionalText(input.description, 10000);
  const jobUrl = cleanOptionalText(input.jobUrl, 2048);

  if (jobUrl) {
    try {
      const parsedUrl = new URL(jobUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return { error: "Job URL must use HTTP or HTTPS." };
      }
    } catch {
      return { error: "Enter a valid job URL." };
    }
  }

  const tags = Array.isArray(input.tags)
    ? input.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().slice(0, 50))
        .filter(Boolean)
        .slice(0, 30)
    : [];

  await connectDB();

  const board = await Board.findOne({
    _id: input.boardId,
    userId: session.user.id,
  }).select("_id");
  if (!board) {
    return { error: "The selected board was not found." };
  }

  const column = await Column.findOne({
    _id: input.columnId,
    boardId: board._id,
  }).select("name");
  if (!column) {
    return { error: "The selected column was not found on this board." };
  }

  const lastJob = await JobApplication.findOne({
    boardId: board._id,
    columnId: column._id,
    userId: session.user.id,
  })
    .sort({ order: -1 })
    .select("order")
  .lean<{ order: number }>();

  const application = await JobApplication.create({
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    tags,
    description,
    status: column.name.toLowerCase(),
    columnId: column._id,
    boardId: board._id,
    userId: session.user.id,
    order: (lastJob?.order ?? -1) + 1,
  });

  const columnUpdate = await Column.updateOne(
    { _id: column._id, boardId: board._id },
    { $push: { jobApplications: application._id } },
  );

  if (columnUpdate.matchedCount !== 1) {
    await JobApplication.deleteOne({ _id: application._id });
    return { error: "The selected column is no longer available." };
  }

  revalidatePath("/dashboard");

  return {
    error: null,
    jobApplication: {
      _id: application._id.toString(),
    },
  };
}

export async function moveJobApplication(input: {
  jobApplicationId: string;
  targetColumnId: string;
  orderedJobIds: string[];
}) {
  if (
    !input ||
    !mongoose.Types.ObjectId.isValid(input.jobApplicationId) ||
    !mongoose.Types.ObjectId.isValid(input.targetColumnId) ||
    !Array.isArray(input.orderedJobIds) ||
    input.orderedJobIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
  ) {
    return { error: "Invalid job move details." };
  }

  const requestedIds = input.orderedJobIds.map(String);
  if (new Set(requestedIds).size !== requestedIds.length) {
    return { error: "The job order contains duplicate applications." };
  }

  const session = await getSession();
  if (!session?.user) {
    return { error: "Please sign in before moving a job application." };
  }

  await connectDB();

  const application = await JobApplication.findOne({
    _id: input.jobApplicationId,
    userId: session.user.id,
  }).select("boardId columnId");
  if (!application) {
    return { error: "The job application was not found." };
  }

  const board = await Board.findOne({
    _id: application.boardId,
    userId: session.user.id,
  }).select("_id");
  const targetColumn = await Column.findOne({
    _id: input.targetColumnId,
    boardId: application.boardId,
  }).select("_id name");
  if (!board || !targetColumn) {
    return { error: "The destination column was not found on this board." };
  }

  const targetJobs = await JobApplication.find({
    boardId: board._id,
    columnId: targetColumn._id,
    userId: session.user.id,
  })
    .select("_id")
    .lean();
  const expectedIds = new Set(targetJobs.map((job) => String(job._id)));
  expectedIds.add(String(application._id));

  if (
    expectedIds.size !== requestedIds.length ||
    requestedIds.some((id) => !expectedIds.has(id))
  ) {
    return { error: "The board changed while moving this application. Please retry." };
  }

  await JobApplication.bulkWrite(
    requestedIds.map((id, order) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(id),
          boardId: board._id,
          userId: session.user.id,
        },
        update: {
          $set: {
            columnId: targetColumn._id,
            status: targetColumn.name.toLowerCase(),
            order,
          },
        },
      },
    })),
  );

  const sourceColumnId = String(application.columnId);
  const destinationIds = requestedIds.map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  if (sourceColumnId === String(targetColumn._id)) {
    await Column.updateOne(
      { _id: targetColumn._id, boardId: board._id },
      { $set: { jobApplications: destinationIds } },
    );
  } else {
    await Column.updateOne(
      { _id: application.columnId, boardId: board._id },
      { $pull: { jobApplications: application._id } },
    );
    await Column.updateOne(
      { _id: targetColumn._id, boardId: board._id },
      { $set: { jobApplications: destinationIds } },
    );
  }

  revalidatePath("/dashboard");
  return { error: null };
}
