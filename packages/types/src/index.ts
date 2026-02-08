import { z } from "zod";

export const WorkItemStatus = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
  ARCHIVE: "archive",
} as const;

export type WorkItemStatus =
  (typeof WorkItemStatus)[keyof typeof WorkItemStatus];

export const workItemStatusSchema = z.enum([
  "todo",
  "in_progress",
  "review",
  "done",
  "archive",
]);

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const datetimeISORegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

const datetimeLocalSchema = z
  .string()
  .refine((val) => datetimeLocalRegex.test(val) || datetimeISORegex.test(val), {
    message:
      "Invalid datetime format. Expected: YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SSZ",
  })
  .transform((val) => {
    // If it's datetime-local format, convert to ISO
    if (datetimeLocalRegex.test(val)) {
      return `${val}:00Z`;
    }
    // Already in ISO format, ensure it has Z if missing
    if (!val.endsWith("Z")) {
      return `${val}Z`;
    }
    return val;
  });

export const workItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  startAt: datetimeLocalSchema,
  endAt: datetimeLocalSchema,
  status: workItemStatusSchema,
  createdAt: z.string().datetime(),
});

export const createWorkItemSchema = workItemSchema.omit({
  id: true,
  createdAt: true,
});

export const updateWorkItemSchema = workItemSchema.partial().required({
  id: true,
});

export type WorkItem = z.infer<typeof workItemSchema>;
export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>;

export interface DashboardMetrics {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface TasksByStatus {
  status: WorkItemStatus;
  count: number;
}

export interface TasksOverTime {
  date: string;
  count: number;
}
