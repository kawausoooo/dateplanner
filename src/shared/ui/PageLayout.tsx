import type { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";

interface PageLayoutProps extends PropsWithChildren {
  title: string;
  showNav?: boolean;
  showTitle?: boolean;
}

type NavItem = { to: string; label: string; exact?: boolean };

const NAV_ITEMS: NavItem[] = [
  { to: "/",         label: "メイン",  exact: true },
  { to: "/entry",    label: "入力" },
  { to: "/history",  label: "履歴" },
  { to: "/settings", label: "設定" },
  { to: "/help",     label: "ヘルプ" },
];

export const PageLayout = ({ title, children, showNav = true, showTitle = true }: PageLayoutProps): JSX.Element => {
  const { pathname } = useLocation();

  const isActive = (to: string, exact?: boolean): boolean => {
    if (exact) return pathname === to;
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <main className="page">
      {showTitle && (
        <header className="page-header">
          <h1>{title}</h1>
        </header>
      )}

      {showNav && (
        <nav className="nav-tabs" aria-label="メインナビゲーション">
          {NAV_ITEMS.map(({ to, label, exact }) => (
            <Link
              key={to}
              to={to}
              className={`nav-tab${isActive(to, exact) ? " active" : ""}`}
              aria-current={isActive(to, exact) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}

      <section>{children}</section>
    </main>
  );
};
