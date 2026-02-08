"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type {
  WorkItem,
  CreateWorkItemInput,
  UpdateWorkItemInput,
  WorkItemStatus,
} from "@workspace/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchWorkItems(): Promise<WorkItem[]> {
  const res = await fetch(`${API_URL}/work-items`);
  if (!res.ok) throw new Error("Failed to fetch work items");
  return res.json();
}

async function createWorkItem(data: CreateWorkItemInput): Promise<WorkItem> {
  const res = await fetch(`${API_URL}/work-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create work item");
  return res.json();
}

async function updateWorkItem(data: UpdateWorkItemInput): Promise<WorkItem> {
  const res = await fetch(`${API_URL}/work-items/${data.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update work item");
  return res.json();
}

async function deleteWorkItem(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/work-items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete work item");
}

export function useWorkItems() {
  const queryClient = useQueryClient();

  const {
    data: workItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workItems"],
    queryFn: fetchWorkItems,
  });

  const createMutation = useMutation({
    mutationFn: createWorkItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateStatus = async (id: string, status: WorkItemStatus) => {
    await updateMutation.mutateAsync({ id, status });
  };

  return {
    workItems,
    isLoading,
    error,
    createWorkItem: createMutation.mutateAsync,
    updateWorkItem: updateMutation.mutateAsync,
    deleteWorkItem: deleteMutation.mutateAsync,
    updateStatus,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useDashboardData() {
  const { data: metrics } = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/dashboard/metrics`);
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    },
  });

  const { data: byStatus } = useQuery({
    queryKey: ["dashboard", "byStatus"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/dashboard/by-status`);
      if (!res.ok) throw new Error("Failed to fetch status data");
      return res.json();
    },
  });

  const { data: overTime } = useQuery({
    queryKey: ["dashboard", "overTime"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/dashboard/over-time`);
      if (!res.ok) throw new Error("Failed to fetch timeline data");
      return res.json();
    },
  });

  return { metrics, byStatus, overTime };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export { QueryClientProvider };
