import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import { isChart } from "@/lib/storage";
import type { Chart } from "@/lib/types";

function asDateString(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  return value.slice(0, 10);
}

function asStringRecord(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  const record: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") record[key] = entry;
  }
  return record;
}

export function normalizeChart(value: unknown): Chart | null {
  if (!isChart(value)) return null;
  return {
    ...value,
    why: value.why || undefined,
    deadline: asDateString(value.deadline),
    createdAt: asDateString(value.createdAt) ?? value.createdAt,
    weekNotes: asStringRecord(value.weekNotes),
    logs: value.logs.map((log) => ({
      ...log,
      date: asDateString(log.date) ?? log.date,
    })),
  };
}

export function toChartPayload(chart: Chart): Json {
  return {
    id: chart.id,
    goal: chart.goal,
    why: chart.why ?? "",
    deadline: chart.deadline ?? "",
    createdAt: chart.createdAt,
    themes: chart.themes,
    actions: chart.actions,
    logs: chart.logs,
    weekNotes: chart.weekNotes,
  };
}

export async function loadRemoteChart(
  client: SupabaseClient<Database>,
): Promise<Chart | null> {
  const { data, error } = await client.rpc("load_chart");
  if (error) throw error;
  return normalizeChart(data);
}

export async function saveRemoteChart(
  client: SupabaseClient<Database>,
  chart: Chart,
): Promise<void> {
  const { error } = await client.rpc("save_chart", {
    payload: toChartPayload(chart),
  });
  if (error) throw error;
}

export async function deleteRemoteChart(
  client: SupabaseClient<Database>,
): Promise<void> {
  const { error } = await client.rpc("delete_chart");
  if (error) throw error;
}
