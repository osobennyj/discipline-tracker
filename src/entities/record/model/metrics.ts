import { getDayStatus } from "@/entities/day/model/day-status";
import { formatDateKey, getDaysInMonth } from "@/shared/lib/date";
import type { DayRecord, TradeRecord, TradingJournal } from "@/shared/types/trading";

export interface MonthlyMetrics {
  greenDaysPercent: number;
  filledDays: number;
  greenDays: number;
  redDays: number;
  byPlanTrades: number;
  offPlanTrades: number;
  greenStreak: number;
  byPlanWinrate: number;
  offPlanWinrate: number;
  avgByPlanRr: number;
  avgOffPlanRr: number;
  skippedWins: number;
  skippedLosses: number;
  skippedTotalRr: number;
  skippedOutcomeText: string;
  motivation: string;
}

const round = (value: number): number => Math.round(value * 100) / 100;

const average = (items: number[]): number => {
  if (!items.length) return 0;
  return round(items.reduce((sum, val) => sum + val, 0) / items.length);
};

const winrate = (trades: TradeRecord[]): number => {
  if (!trades.length) return 0;
  const wins = trades.filter((trade) => trade.result === "win").length;
  return round((wins / trades.length) * 100);
};

const toMonthRecords = (journal: TradingJournal, monthDate: Date): DayRecord[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  return Object.values(journal).filter((record) => {
    const date = new Date(record.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
};

const getCurrentGreenStreak = (journal: TradingJournal, monthDate: Date): number => {
  const daysInMonth = getDaysInMonth(monthDate);
  let streak = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const key = formatDateKey(date);
    const status = getDayStatus(journal[key]);
    if (status === "green") {
      streak += 1;
    } else {
      streak = 0;
    }
  }

  return streak;
};

const buildMotivation = (offPlanTrades: TradeRecord[], skippedTotalRr: number): string => {
  const offPlanLosses = offPlanTrades.filter((trade) => trade.result === "lose").length;

  if (offPlanLosses > 0) {
    return `В этом месяце нарушения плана дали ${offPlanLosses} убыточных входов. Дисциплина защищает капитал.`;
  }

  if (skippedTotalRr < 0) {
    return `Пропуская невалидные сетапы, ты избежал примерно ${Math.abs(skippedTotalRr)} RR убытка.`;
  }

  if (skippedTotalRr > 0) {
    return `Некоторые пропущенные сетапы дали бы прибыль (+${skippedTotalRr} RR), но системность важнее разовых исходов.`;
  }

  return "";
};

export const calculateMonthlyMetrics = (journal: TradingJournal, monthDate: Date): MonthlyMetrics => {
  const records = toMonthRecords(journal, monthDate);
  const daysInMonth = getDaysInMonth(monthDate);
  const statuses = records.map((record) => getDayStatus(record));
  const redDays = statuses.filter((status) => status === "red").length;
  const greenDays = statuses.filter((status) => status === "green").length;
  const filledDays = greenDays + redDays;

  const trades = records.flatMap((record) => record.trades);
  const byPlanTrades = trades.filter((trade) => trade.byPlan);
  const offPlanTrades = trades.filter((trade) => !trade.byPlan);

  const skipped = records.flatMap((record) => record.skippedTrades);
  const skippedWins = skipped.filter((item) => item.hypotheticalResult === "win").length;
  const skippedLosses = skipped.filter((item) => item.hypotheticalResult === "lose").length;
  const skippedTotalRr = round(skipped.reduce((sum, item) => sum + item.hypotheticalRr, 0));

  let skippedOutcomeText = "Пропущенные невалидные входы в сумме дали нейтральный результат.";
  if (skippedTotalRr > 0) {
    skippedOutcomeText = `Пропущенные невалидные входы в сумме дали бы прибыль: +${skippedTotalRr} RR.`;
  }
  if (skippedTotalRr < 0) {
    skippedOutcomeText = `Пропущенные невалидные входы в сумме дали бы убыток: ${skippedTotalRr} RR.`;
  }

  return {
    greenDaysPercent: filledDays > 0 ? round((greenDays / filledDays) * 100) : 0,
    filledDays,
    greenDays,
    redDays,
    byPlanTrades: byPlanTrades.length,
    offPlanTrades: offPlanTrades.length,
    greenStreak: getCurrentGreenStreak(journal, monthDate),
    byPlanWinrate: winrate(byPlanTrades),
    offPlanWinrate: winrate(offPlanTrades),
    avgByPlanRr: average(byPlanTrades.map((trade) => trade.rr)),
    avgOffPlanRr: average(offPlanTrades.map((trade) => trade.rr)),
    skippedWins,
    skippedLosses,
    skippedTotalRr,
    skippedOutcomeText,
    motivation: buildMotivation(offPlanTrades, skippedTotalRr),
  };
};
