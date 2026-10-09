"use client";

import { useState } from "react";
import { Board, Column, JobApplication } from "@/lib/models/models.types";
import {
  Calendar,
  CheckCircle2,
  Mic,
  Award,
  XCircle,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import CreateJobApplicationDialog from "./create-job-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { moveJobApplication } from "@/lib/actions/job-applications";

interface KanbanBoardProps {
  board: Board;
}

interface ColConfig {
  color: string;
  icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
  { color: "bg-cyan-500", icon: <Calendar className="h-4 w-4" /> },
  { color: "bg-purple-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  { color: "bg-green-500", icon: <Mic className="h-4 w-4" /> },
  { color: "bg-yellow-500", icon: <Award className="h-4 w-4" /> },
  { color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
];

function SortableJobCard({
  job,
  columnId,
}: {
  job: JobApplication;
  columnId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: job._id,
      data: {
        type: "job",
        jobId: job._id,
        columnId,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{job.company}</p>
          <p className="text-sm text-slate-600">{job.position}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
          {job.status || "Applied"}
        </span>
      </div>
      {job.location ? (
        <p className="mt-2 text-xs text-slate-500">{job.location}</p>
      ) : null}
    </div>
  );
}

function DroppableColumn({
  column,
  config,
  boardId,
}: {
  column: Column;
  config: ColConfig;
  boardId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: {
      type: "column",
      columnId: column._id,
    },
  });

  const sortedJobs = [...(column.jobApplications ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <Card className="min-w-[300px] flex-shrink-0 shadow-md p-0">
      <CardHeader className={`${config.color} text-white rounded-t-lg pb-3 pt-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-white text-base font-semibold">
              {column.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className={`space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg ${
          isOver ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <SortableContext
          items={sortedJobs.map((job) => job._id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedJobs.map((job) => (
            <SortableJobCard
              key={job._id}
              job={{ ...job, columnId: job.columnId || column._id }}
              columnId={column._id}
            />
          ))}
        </SortableContext>

        <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
      </CardContent>
    </Card>
  );
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
  const [columns, setColumns] = useState(() =>
    [...(board?.columns ?? [])].sort((a, b) => a.order - b.order),
  );
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const selectedJob = columns
      .flatMap((column) => column.jobApplications ?? [])
      .find((job) => job._id === String(event.active.id));

    setActiveJob(selectedJob ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over || String(active.id) === String(over.id)) {
      return;
    }

    const activeId = String(active.id);
    const sourceColumnIndex = columns.findIndex((column) =>
      column.jobApplications?.some((job) => job._id === activeId),
    );
    if (sourceColumnIndex === -1) {
      return;
    }

    const overColumnId = over.data.current?.columnId;
    const targetColumnId =
      (typeof overColumnId === "string" ? overColumnId : undefined) ??
      (columns.some((column) => column._id === String(over.id))
        ? String(over.id)
        : undefined);
    const targetColumnIndex = columns.findIndex(
      (column) => column._id === targetColumnId,
    );
    if (targetColumnIndex === -1) {
      return;
    }

    const previousColumns = columns;
    const sourceJobs = [...(columns[sourceColumnIndex].jobApplications ?? [])];
    const targetJobs =
      sourceColumnIndex === targetColumnIndex
        ? sourceJobs
        : [...(columns[targetColumnIndex].jobApplications ?? [])];
    const activeIndex = sourceJobs.findIndex((job) => job._id === activeId);
    const overIndex = targetJobs.findIndex(
      (job) => job._id === String(over.id),
    );
    const movedJob = sourceJobs[activeIndex];
    if (!movedJob || activeIndex === -1) {
      return;
    }

    let nextSourceJobs = sourceJobs;
    let nextTargetJobs = targetJobs;

    if (sourceColumnIndex === targetColumnIndex) {
      if (overIndex === -1) {
        return;
      }
      nextSourceJobs = arrayMove(sourceJobs, activeIndex, overIndex);
      nextTargetJobs = nextSourceJobs;
    } else {
      nextSourceJobs = sourceJobs.filter((job) => job._id !== activeId);
      const insertionIndex = overIndex === -1 ? targetJobs.length : overIndex;
      nextTargetJobs = [
        ...targetJobs.slice(0, insertionIndex),
        movedJob,
        ...targetJobs.slice(insertionIndex),
      ];
    }

    const updatedColumns = columns.map((column, index) => {
      if (index === sourceColumnIndex) {
        return {
          ...column,
          jobApplications: nextSourceJobs.map((job, order) => ({
            ...job,
            order,
          })),
        };
      }
      if (index === targetColumnIndex) {
        return {
          ...column,
          jobApplications: nextTargetJobs.map((job, order) => ({
            ...job,
            columnId: column._id,
            order,
          })),
        };
      }
      return column;
    });

    setDragError(null);
    setColumns(updatedColumns);

    try {
      const result = await moveJobApplication({
        jobApplicationId: activeId,
        targetColumnId: columns[targetColumnIndex]._id,
        orderedJobIds: nextTargetJobs.map((job) => job._id),
      });
      if (result.error) {
        setColumns(previousColumns);
        setDragError(result.error);
      }
    } catch {
      setColumns(previousColumns);
      setDragError("Could not move the application. Please try again.");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {dragError ? (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {dragError}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <div className="flex gap-4">
          {columns.map((col, key) => {
            const config = COLUMN_CONFIG[key] || {
              color: "bg-gray-500",
              icon: <Calendar className="h-4 w-4" />,
            };

            return (
              <DroppableColumn
                key={col._id || key}
                column={col}
                config={config}
                boardId={board._id}
              />
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeJob ? (
          <div className="w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <p className="font-semibold text-slate-900">{activeJob.company}</p>
            <p className="text-sm text-slate-600">{activeJob.position}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
