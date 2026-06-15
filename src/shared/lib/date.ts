const MONDAY_INDEX = 0;

const toMondayFirst = (day: number): number => (day + 6) % 7;

export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (key: string): Date => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getMonthStart = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const getDaysInMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const getMonthGridDates = (monthDate: Date): Date[] => {
  const firstDay = getMonthStart(monthDate);
  const firstWeekday = toMondayFirst(firstDay.getDay());
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, idx) => {
    const next = new Date(start);
    next.setDate(start.getDate() + idx);
    return next;
  });
};

export const isSameMonth = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

export const getMonthLabel = (date: Date): string =>
  date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

export const getWeekdayLabels = (): string[] => {
  const baseMonday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseMonday);
    date.setDate(baseMonday.getDate() + ((MONDAY_INDEX + index) % 7));
    return date.toLocaleDateString("ru-RU", { weekday: "short" });
  });
};
