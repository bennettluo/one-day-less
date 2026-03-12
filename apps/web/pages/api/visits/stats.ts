import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type UserVisitRecord = {
  daily: Record<string, number>;
  hourly?: Record<string, Record<string, number>>;
  totalCount: number;
  totalDays: number;
};

type VisitStore = Record<string, UserVisitRecord>;

type StatsResponse = {
  todayCount: number;
  avgPerDay: number;
  totalDays: number;
  todayHourlyCounts: number[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const VISITS_FILE = path.join(DATA_DIR, "visits.json");
const USER_COOKIE_KEY = "one-day-less-user-id";

function readStore(): VisitStore {
  try {
    if (!fs.existsSync(VISITS_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(VISITS_FILE, "utf8");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as VisitStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const userId = req.cookies[USER_COOKIE_KEY];
  if (!userId) {
    return res.status(200).json({
      todayCount: 0,
      avgPerDay: 0,
      totalDays: 0,
      todayHourlyCounts: Array.from({ length: 24 }).map(() => 0)
    });
  }

  const store = readStore();
  const record = store[userId];

  if (!record) {
    return res.status(200).json({
      todayCount: 0,
      avgPerDay: 0,
      totalDays: 0,
      todayHourlyCounts: Array.from({ length: 24 }).map(() => 0)
    });
  }

  const todayKey = getTodayKey();
  const todayCount = record.daily[todayKey] ?? 0;
  const totalCount = record.totalCount ?? 0;
  const totalDays = record.totalDays ?? 0;
  const avgPerDay = totalDays > 0 ? totalCount / totalDays : 0;

  const hourlyForDay = (record.hourly && record.hourly[todayKey]) || {};
  const todayHourlyCounts: number[] = Array.from({ length: 24 }).map(
    (_, index) => {
      const key = index.toString().padStart(2, "0");
      return hourlyForDay[key] ?? 0;
    }
  );

  return res.status(200).json({
    todayCount,
    avgPerDay,
    totalDays,
    todayHourlyCounts
  });
}

