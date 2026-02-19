import { useEffect, useMemo, useState } from "react";
import type { DateEvent } from "../../entities/score";
import { useAppContext } from "../../app/providers/AppProvider";
import { calculateWeightedAverage } from "../../shared/lib/score";
import { PageLayout } from "../../shared/ui/PageLayout";

export const HistoryCalendarPage = (): JSX.Element => {
  const { listEvents } = useAppContext();
  const [events, setEvents] = useState<DateEvent[]>([]);

  useEffect(() => {
    void listEvents().then(setEvents);
  }, [listEvents]);

  const scoresByDate = useMemo(() => {
    const map = new Map<string, DateEvent[]>();
    for (const event of events) {
      const current = map.get(event.date) ?? [];
      current.push(event);
      map.set(event.date, current);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, dayEvents]) => ({
        date,
        score: calculateWeightedAverage(dayEvents.flatMap((event) => event.scores)),
        count: dayEvents.length,
      }));
  }, [events]);

  return (
    <PageLayout title="履歴カレンダー">
      <div className="card">
        <p>日付ごとの記録</p>
        {scoresByDate.length === 0 && <p>まだ履歴がありません。</p>}
        {scoresByDate.map((item) => (
          <div key={item.date} className="history-item">
            <strong>{item.date}</strong>
            <span>平均: {item.score}</span>
            <span>件数: {item.count}</span>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};
