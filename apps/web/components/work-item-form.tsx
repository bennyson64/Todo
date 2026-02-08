"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import type { CreateWorkItemInput } from "@workspace/types";
import { createWorkItemSchema } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

interface WorkItemFormProps {
  onSubmit: (data: CreateWorkItemInput) => Promise<void>;
  isSubmitting?: boolean;
  trigger?: React.ReactNode;
}

export function WorkItemForm({ onSubmit, isSubmitting, trigger }: WorkItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateWorkItemInput>({
    resolver: zodResolver(createWorkItemSchema),
    defaultValues: {
      title: "",
      description: "",
      startAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endAt: format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      status: "todo",
    },
  });

  const handleFormSubmit = async (data: CreateWorkItemInput) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button>Add Work Item</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Work Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter work item title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter work item description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start Date & Time</Label>
              <Input
                id="startAt"
                type="datetime-local"
                {...register("startAt")}
              />
              {errors.startAt && (
                <p className="text-sm text-red-500">{errors.startAt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endAt">End Date & Time</Label>
              <Input
                id="endAt"
                type="datetime-local"
                {...register("endAt")}
              />
              {errors.endAt && (
                <p className="text-sm text-red-500">{errors.endAt.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Work Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
