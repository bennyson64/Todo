"use client";

import { useState } from "react";
import { useWorkItems, useDashboardData } from "@/hooks/use-work-items";
import { WorkItemForm } from "@/components/work-item-form";
import { KanbanBoard } from "@/components/kanban-board";
import { Dashboard } from "@/components/dashboard";
import { Button } from "@workspace/ui/components/button";
import { Plus, LayoutDashboard, Kanban } from "lucide-react";
import type { CreateWorkItemInput } from "@workspace/types";

type ViewMode = "kanban" | "dashboard";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const {
    workItems,
    isLoading,
    createWorkItem,
    updateStatus,
    isCreating,
    isUpdating,
  } = useWorkItems();

  const { metrics, byStatus, overTime } = useDashboardData();

  const handleCreateWorkItem = async (data: CreateWorkItemInput) => {
    await createWorkItem(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Kanban Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="gap-2"
                >
                  <Kanban className="h-4 w-4" />
                  Kanban
                </Button>
                <Button
                  variant={viewMode === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("dashboard")}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </div>
              <WorkItemForm
                onSubmit={handleCreateWorkItem}
                isSubmitting={isCreating}
                trigger={
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {viewMode === "kanban" ? (
          <KanbanBoard
            workItems={workItems}
            onStatusChange={updateStatus}
            isUpdating={isUpdating}
          />
        ) : (
          <Dashboard
            metrics={metrics}
            byStatus={byStatus}
            overTime={overTime}
          />
        )}
      </div>
    </main>
  );
}
