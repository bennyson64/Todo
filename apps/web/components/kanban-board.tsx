"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { WorkItem, WorkItemStatus } from "@workspace/types";
import { Card, CardContent } from "@workspace/ui/components/card";
import { format } from "date-fns";
import {
  getTimeRemainingColor,
  getCardBackgroundClass,
} from "@/lib/time-utils";
import { cn } from "@workspace/ui/lib/utils";

const COLUMNS: { id: WorkItemStatus; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
  { id: "archive", title: "Archive" },
];

interface KanbanBoardProps {
  workItems: WorkItem[];
  onStatusChange: (id: string, status: WorkItemStatus) => Promise<void>;
  isUpdating: boolean;
}

interface SortableItemProps {
  id: string;
  item: WorkItem;
  isUpdating?: boolean;
}

interface DroppableColumnProps {
  column: { id: WorkItemStatus; title: string };
  children: React.ReactNode;
  count: number;
}

function DroppableColumn({ column, children, count }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="shrink-0 w-72">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {count}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-50 rounded-lg border-2 border-dashed p-2 transition-colors ${
          isOver ? "border-primary bg-primary/5" : "border-muted bg-muted/50"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SortableItem({ id, item, isUpdating }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const color = getTimeRemainingColor(item.endAt);
  const bgClass = getCardBackgroundClass(color);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("mb-2", isDragging && "opacity-50")}
    >
      <Card
        className={cn(
          "border shadow-md transition-all hover:shadow-lg cursor-grab active:cursor-grabbing",
          bgClass,
          isUpdating && "opacity-70",
        )}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3">
          <h4 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900">
            {item.title}
          </h4>
          <div className="text-xs space-y-1">
            <p className="text-gray-700">
              Start: {format(new Date(item.startAt), "MMM d, h:mm a")}
            </p>
            <p className="text-gray-700">
              End: {format(new Date(item.endAt), "MMM d, h:mm a")}
            </p>
          </div>
          {isUpdating && (
            <p className="text-xs text-blue-600 font-medium mt-2">
              Updating...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function KanbanBoard({
  workItems,
  onStatusChange,
  isUpdating,
}: KanbanBoardProps) {
  const [localItems, setLocalItems] = useState<WorkItem[]>(workItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Create a stable key from work items
  const workItemsKey = workItems
    .map((item) => `${item.id}-${item.status}`)
    .join("|");

  // Sync local state when props change, but not during updates
  useEffect(() => {
    if (!updatingId) {
      setLocalItems(workItems);
    }
  }, [workItemsKey, updatingId]);

  const getItemsByStatus = useCallback(
    (status: WorkItemStatus) => {
      return localItems.filter((item) => item.status === status);
    },
    [localItems],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active item
    const activeItem = localItems.find((item) => item.id === activeId);
    if (!activeItem) {
      setActiveId(null);
      return;
    }

    // Check if we're dropping on a column (status change)
    const column = COLUMNS.find((col) => col.id === overId);
    if (column && activeItem.status !== column.id) {
      // Status change
      const newStatus = column.id;
      const previousItems = [...localItems];
      setUpdatingId(activeId);

      // Optimistic update
      setLocalItems((prev) =>
        prev.map((i) => (i.id === activeId ? { ...i, status: newStatus } : i)),
      );

      try {
        await onStatusChange(activeId, newStatus);
      } catch (error) {
        // Rollback on failure
        setLocalItems(previousItems);
        console.error("Failed to update status:", error);
      } finally {
        setUpdatingId(null);
      }
    }

    setActiveId(null);
  };

  const activeItem = localItems.find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnItems = getItemsByStatus(column.id);

          return (
            <DroppableColumn
              key={column.id}
              column={column}
              count={columnItems.length}
            >
              <SortableContext
                id={column.id}
                items={columnItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnItems.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    isUpdating={updatingId === item.id}
                  />
                ))}
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-6">
            <SortableItem
              id={activeItem.id}
              item={activeItem}
              isUpdating={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
