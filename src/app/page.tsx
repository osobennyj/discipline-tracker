"use client";

import { useEffect, useMemo, useState } from "react";

import { calculateMonthlyMetrics } from "@/entities/record/model/metrics";
import { logoutUser } from "@/entities/user/model/auth-storage";
import { formatDateKey } from "@/shared/lib/date";
import type { UserAccount } from "@/shared/types/auth";
import type { DayAttachment, DayRecord, MoodTag, SkippedTradeRecord, TradeRecord, TradingJournal } from "@/shared/types/trading";
import { AuthPanel } from "@/features/auth/ui/auth-panel";
import { DisciplineCalendar } from "@/widgets/calendar/ui/discipline-calendar";
import { DayDetails } from "@/widgets/day-details/ui/day-details";
import { StatsDashboard } from "@/widgets/dashboard/ui/stats-dashboard";

const createEmptyDayRecord = (dateKey: string): DayRecord => ({
  date: dateKey,
  comment: "",
  trades: [],
  skippedTrades: [],
  attachments: [],
});

const normalizeDayRecord = (day: Partial<DayRecord>, dateKey: string): DayRecord => ({
  date: day.date ?? dateKey,
  comment: day.comment ?? "",
  mood: day.mood,
  trades: day.trades ?? [],
  skippedTrades: day.skippedTrades ?? [],
  attachments: day.attachments ?? [],
});

const getDay = (journal: TradingJournal, dateKey: string): DayRecord => {
  const day = journal[dateKey];
  return day ? normalizeDayRecord(day, dateKey) : createEmptyDayRecord(dateKey);
};

const createStorageKey = (userId: string): string => `trading-discipline-journal:${userId}`;

const loadJournalForUser = (userId: string): TradingJournal => {
  const raw = window.localStorage.getItem(createStorageKey(userId));
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<DayRecord>>;
    return Object.entries(parsed).reduce<TradingJournal>((acc, [date, day]) => {
      acc[date] = normalizeDayRecord(day, date);
      return acc;
    }, {});
  } catch {
    window.localStorage.removeItem(createStorageKey(userId));
    return {};
  }
};

export default function HomePage() {
  const now = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(now));
  const [user, setUser] = useState<UserAccount | null>(null);
  const [journal, setJournal] = useState<TradingJournal>({});

  useEffect(() => {
    if (!user) return;
    window.localStorage.setItem(createStorageKey(user.id), JSON.stringify(journal));
  }, [journal, user]);

  const selectedDay = getDay(journal, selectedDateKey);
  const monthlyMetrics = useMemo(() => calculateMonthlyMetrics(journal, monthDate), [journal, monthDate]);

  if (!user) {
    return (
      <AuthPanel
        onAuthenticated={(authenticatedUser) => {
          setUser(authenticatedUser);
          setJournal(loadJournalForUser(authenticatedUser.id));
        }}
      />
    );
  }

  const updateDay = (updater: (day: DayRecord) => DayRecord) => {
    setJournal((previous) => {
      const current = getDay(previous, selectedDateKey);
      const updated = updater(current);
      return {
        ...previous,
        [selectedDateKey]: updated,
      };
    });
  };

  const addTrade = (trade: TradeRecord) =>
    updateDay((day) => ({
      ...day,
      trades: [...day.trades, trade],
    }));

  const addSkippedTrade = (record: SkippedTradeRecord) =>
    updateDay((day) => ({
      ...day,
      skippedTrades: [...day.skippedTrades, record],
    }));

  const updateComment = (comment: string) =>
    updateDay((day) => ({
      ...day,
      comment,
    }));

  const updateMood = (mood?: MoodTag) =>
    updateDay((day) => ({
      ...day,
      mood,
    }));

  const addAttachments = (attachments: DayAttachment[]) =>
    updateDay((day) => ({
      ...day,
      attachments: [...day.attachments, ...attachments],
    }));

  const removeAttachment = (attachmentId: string) =>
    updateDay((day) => ({
      ...day,
      attachments: day.attachments.filter((item) => item.id !== attachmentId),
    }));

  const goToPreviousMonth = () =>
    setMonthDate((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setMonthDate((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));

  return (
    <main className="page">
      <header className="page__header">
        <div>
          <h1>Trading Discipline Calendar</h1>
          <p className="subtitle">Сначала качество решения, затем результат сделки.</p>
          <p className="subtitle">Аккаунт: {user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logoutUser();
            setUser(null);
            setJournal({});
          }}
        >
          Выйти
        </button>
      </header>

      <StatsDashboard metrics={monthlyMetrics} />

      <DisciplineCalendar
        monthDate={monthDate}
        selectedDateKey={selectedDateKey}
        journal={journal}
        onSelectDate={setSelectedDateKey}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <DayDetails
        dayRecord={selectedDay}
        onAddTrade={addTrade}
        onAddSkipped={addSkippedTrade}
        onUpdateComment={updateComment}
        onUpdateMood={updateMood}
        onAddAttachments={addAttachments}
        onRemoveAttachment={removeAttachment}
      />
    </main>
  );
}
