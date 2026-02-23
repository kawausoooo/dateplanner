import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../shared/ui/PageLayout";

export const TitlePage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <PageLayout title="タイトル画面" showNav={false}>
      <div className="card title-card">
        <div className="app-logo" aria-label="アプリロゴ">💛 Date Planner</div>
        <p>相性チェックへようこそ</p>
        <button type="button" onClick={() => navigate("/people")}>
          スタート
        </button>
      </div>
    </PageLayout>
  );
};
