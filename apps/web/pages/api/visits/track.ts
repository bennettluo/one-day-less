import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

type UserVisitRecord = {
  daily: Record<string, number>;
  hourly?: Record<string, Record<string, number>>;
  totalCount: number;
  totalDays: number;
};

type VisitStore = Record<string, UserVisitRecord>;

type TrackResponse = {
  todayCount: number;
  avgPerDay: number;
  totalDays: number;
  todayHourlyCounts: number[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const VISITS_FILE = path.join(DATA_DIR, "visits.json");
const USER_COOKIE_KEY = "one-day-less-user-id";

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

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

function writeStore(store: VisitStore) {
  ensureDataDir();
  fs.writeFileSync(VISITS_FILE, JSON.stringify(store, null, 2), "utf8");
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentHourKey() {
  return new Date().getHours().toString().padStart(2, "0");
}

function getOrCreateUserId(req: NextApiRequest, res: NextApiResponse) {
  const existing = req.cookies[USER_COOKIE_KEY];
  if (existing) return existing;

  const id = randomUUID();
  const maxAge = 60 * 60 * 24 * 365;
  const cookie = `${USER_COOKIE_KEY}=${id}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
  const prev = res.getHeader("Set-Cookie");
  if (typeof prev === "string") {
    res.setHeader("Set-Cookie", [prev, cookie]);
  } else if (Array.isArray(prev)) {
    res.setHeader("Set-Cookie", [...prev, cookie]);
  } else {
    res.setHeader("Set-Cookie", cookie);
  }
  return id;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrackResponse | { error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const userId = getOrCreateUserId(req, res);
  const todayKey = getTodayKey();
  const hourKey = getCurrentHourKey();

  const store = readStore();
  const existing: UserVisitRecord =
    store[userId] ?? { daily: {}, hourly: {}, totalCount: 0, totalDays: 0 };

  const currentTodayCount = existing.daily[todayKey] ?? 0;
  const nextTodayCount = currentTodayCount + 1;
  existing.daily[todayKey] = nextTodayCount;

  const existingHourly = existing.hourly ?? {};
  const hourlyForDay = existingHourly[todayKey] ?? {};
  const currentHourCount = hourlyForDay[hourKey] ?? 0;
  const nextHourCount = currentHourCount + 1;
  hourlyForDay[hourKey] = nextHourCount;
  existingHourly[todayKey] = hourlyForDay;
  existing.hourly = existingHourly;

  const counts = Object.values(existing.daily);
  const totalCount = counts.reduce((sum, c) => sum + c, 0);
  const totalDays = counts.length;
  const avgPerDay = totalDays > 0 ? totalCount / totalDays : 0;

  const todayHourlyCounts: number[] = Array.from({ length: 24 }).map(
    (_, index) => {
      const key = index.toString().padStart(2, "0");
      return hourlyForDay[key] ?? 0;
    }
  );

  existing.totalCount = totalCount;
  existing.totalDays = totalDays;
  store[userId] = existing;

  writeStore(store);

  const body: TrackResponse = {
    todayCount: nextTodayCount,
    avgPerDay,
    totalDays,
    todayHourlyCounts
  };

  return res.status(200).json(body);
}

