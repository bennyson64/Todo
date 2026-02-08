"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { DashboardMetrics, TasksByStatus, TasksOverTime } from "@workspace/types";

interface DashboardProps {
  metrics?: DashboardMetrics;
  byStatus?: TasksByStatus[];
  overTime?: TasksOverTime[];
}

export function Dashboard({ metrics, byStatus, overTime }: DashboardProps) {
  const safeMetrics = metrics || {
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  };

  const statusData = byStatus || [];
  const timelineData = overTime || [];

  const statusColors: Record<string, string> = {
    todo: "#94a3b8",
    in_progress: "#3b82f6",
    review: "#f59e0b",
    done: "#22c55e",
    archive: "#6b7280",
  };

  const formattedStatusData = statusData.map((item) => ({
    name: item.status.replace("_", " ").toUpperCase(),
    count: item.count,
    fill: statusColors[item.status] || "#94a3b8",
  }));

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tasks"
          value={safeMetrics.totalTasks}
          description="All work items in the system"
        />
        <MetricCard
          title="Active Tasks"
          value={safeMetrics.activeTasks}
          description="Todo, In Progress, Review"
        />
        <MetricCard
          title="Completed"
          value={safeMetrics.completedTasks}
          description="Tasks marked as done"
        />
        <MetricCard
          title="Overdue"
          value={safeMetrics.overdueTasks}
          description="Past deadline & not done"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
