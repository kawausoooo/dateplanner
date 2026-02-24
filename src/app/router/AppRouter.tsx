import { Navigate, Route, Routes } from "react-router-dom";
import { PersonSelectorPage } from "../../features/person-selector/PersonSelectorPage";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { DateEntryPage } from "../../features/date-entry/DateEntryPage";
import { HistoryCalendarPage } from "../../features/history-calendar/HistoryCalendarPage";
import { SettingsPage } from "../../features/settings/SettingsPage";
import { HelpPage } from "../../features/help/HelpPage";
import { TitlePage } from "../../features/title/TitlePage";
import { useAppContext } from "../providers/AppProvider";


const RequirePerson = ({ children }: { children: JSX.Element }): JSX.Element => {
  const { selectedPersonId, isLoaded } = useAppContext();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!selectedPersonId) {
    return <Navigate to="/people" replace />;
  }

  return children;
};

export const AppRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<TitlePage />} />
      <Route path="/people" element={<PersonSelectorPage />} />
      <Route
        path="/main"
        element={
          <RequirePerson>
            <DashboardPage />
          </RequirePerson>
        }
      />
      <Route
        path="/entry"
        element={
          <RequirePerson>
            <DateEntryPage />
          </RequirePerson>
        }
      />
      <Route
        path="/history"
        element={
          <RequirePerson>
            <HistoryCalendarPage />
          </RequirePerson>
        }
      />
      <Route
        path="/settings"
        element={
          <RequirePerson>
            <SettingsPage />
          </RequirePerson>
        }
      />
      <Route
        path="/help"
        element={
          <RequirePerson>
            <HelpPage />
          </RequirePerson>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
