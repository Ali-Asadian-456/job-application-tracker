"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

export default function ImageTabs() {
  const [activeTab, setActiveTab] = useState("organize"); //organize, hired, boards
  // console.log(activeTab)
  return (
    <section className="border-t py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Button onClick={() => setActiveTab("organize")}>
            Organize Applications
          </Button>
          <Button onClick={() => setActiveTab("hired")}>Get Hired</Button>
          <Button onClick={() => setActiveTab("boards")}>Manage Boards</Button>
        </div>
        <div className="mt-8 flex justify-center max-w-2xl mx-auto overflow-hidden">
          {activeTab === "organize" && (
            <div className="overflow-hidden rounded">
              <Image
                src="/hero-images/hero1.png"
                width={1200}
                height={800}
                alt="oraganize applications"
              />
            </div>
          )}
          {activeTab === "hired" && (
            <div className="overflow-hidden rounded">
              <Image
                src="/hero-images/hero2.png"
                width={1200}
                height={800}
                alt="Get applications"
              />
            </div>
          )}
          {activeTab === "boards" && (
            <div className="overflow-hidden rounded">
              <Image
                src="/hero-images/hero3.png"
                width={1200}
                height={800}
                alt="Manage Boards"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
