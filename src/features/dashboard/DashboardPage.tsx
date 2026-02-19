import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import { calculateAggregate } from "../../shared/lib/score";
import { PageLayout } from "../../shared/ui/PageLayout";
import { ScoreRadar } from "../../shared/ui/ScoreRadar";
import type { DateEvent } from "../../entities/score";

export const DashboardPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { settings, listEvents } = useAppContext();
  const [events, setEvents] = useState<DateEvent[]>([]);

  useEffect(() => {
    void listEvents().then(setEvents);
  }, [listEvents]);

  const aggregate = useMemo(() => calculateAggregate(events), [events]);
  const selectedCategories = settings.selectedRadarCategoryIds
    .map((id) => settings.categories.find((category) => category.id === id))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  const values = selectedCategories.map((category) => aggregate.byCategory[category.id] ?? 0);
  const labels = selectedCategories.map((category) => category.label);

  return (
    <PageLayout title="メイン画面">
      <div className="card">
        <p>最新の総合点: {aggregate.overall}</p>
      </div>
      <ScoreRadar values={values} labels={labels} />
      <div className="button-row">
        <button onClick={() => navigate("/entry")}>点数を入力</button>
        <button onClick={() => navigate("/history")}>履歴カレンダー</button>
        <button onClick={() => navigate("/settings")}>設定</button>
        <button onClick={() => navigate("/help")}>ヘルプ</button>
      </div>
    </PageLayout>
  );
};
