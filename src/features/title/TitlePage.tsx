import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../shared/ui/PageLayout";

const APP_NAME = "donuts";
const APP_TAGLINE = "ドーナッツ～恋人相性チェッカー～";

export const TitlePage = (): JSX.Element => {
  const navigate = useNavigate();
  const openPersonSelector = (): void => {
    navigate("/people");
  };

  return (
    <PageLayout title="タイトル画面" showNav={false} showTitle={false}>
      <div
        className="title-hero fade-in fade-in-base"
        role="button"
        tabIndex={0}
        aria-label="タイトル画面。クリックして人物選択に進む"
        onClick={openPersonSelector}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPersonSelector();
          }
        }}
      >
        <div className="title-content">
          <h2 className="title-name">{APP_NAME}</h2>
          <p className="title-tagline">{APP_TAGLINE}</p>
        </div>
      </div>
    </PageLayout>
  );
};
