import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

interface PageLayoutProps extends PropsWithChildren {
  title: string;
  showNav?: boolean;
}

export const PageLayout = ({ title, children, showNav = true }: PageLayoutProps): JSX.Element => {
  return (
    <main className="page">
      <header className="page-header">
        <h1>{title}</h1>
      </header>
      {showNav && (
        <nav className="nav-row">
          <Link to="/">メイン</Link>
          <Link to="/entry">入力</Link>
          <Link to="/history">履歴</Link>
          <Link to="/settings">設定</Link>
          <Link to="/help">ヘルプ</Link>
        </nav>
      )}
      <section>{children}</section>
    </main>
  );
};
