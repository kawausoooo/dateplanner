import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import { PageLayout } from "../../shared/ui/PageLayout";

type CalendarCell = {
  isoDate: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const pad2 = (value: number): string => String(value).padStart(2, "0");

const toLocalIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${pad2(month)}-${pad2(day)}`;
};

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const buildCalendarCells = (monthDate: Date): CalendarCell[] => {
  const monthStart = startOfMonth(monthDate);
  const firstGridDate = new Date(monthStart);
  firstGridDate.setDate(monthStart.getDate() - monthStart.getDay());
  const todayIso = toLocalIsoDate(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(firstGridDate);
    current.setDate(firstGridDate.getDate() + index);

    return {
      isoDate: toLocalIsoDate(current),
      day: current.getDate(),
      isCurrentMonth: current.getMonth() === monthDate.getMonth(),
      isToday: toLocalIsoDate(current) === todayIso,
    };
  });
};

export const DateCalendarPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { listEvents } = useAppContext();
  const [displayMonth, setDisplayMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [recordedDates, setRecordedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    void listEvents().then((events) => {
      setRecordedDates(new Set(events.map((event) => event.date)));
    });
  }, [listEvents]);

  const monthTitle = useMemo(
    () => new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long" }).format(displayMonth),
    [displayMonth],
  );
  const cells = useMemo(() => buildCalendarCells(displayMonth), [displayMonth]);

  const moveMonth = (offset: number): void => {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleSelectDate = (date: string): void => {
    navigate("/entry/satisfaction", { state: { date } });
  };

  return (
    <PageLayout title="日付を選択">
      <div className="card calendar-card">
        <div className="calendar-header">
          <button type="button" className="calendar-nav-button" onClick={() => moveMonth(-1)}>
            前月
          </button>
          <strong>{monthTitle}</strong>
          <button type="button" className="calendar-nav-button" onClick={() => moveMonth(1)}>
            次月
          </button>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="calendar-weekday">
              {label}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((cell) => (
            <button
              key={cell.isoDate}
              type="button"
              className={[
                "calendar-day",
                cell.isCurrentMonth ? "is-current-month" : "is-other-month",
                cell.isToday ? "is-today" : "",
                recordedDates.has(cell.isoDate) ? "has-record" : "",
              ].join(" ")}
              onClick={() => handleSelectDate(cell.isoDate)}
            >
              <span className="calendar-day-number">{cell.day}</span>
              {recordedDates.has(cell.isoDate) && <span className="calendar-record-dot" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};
