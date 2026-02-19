import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./providers/AppProvider";
import { AppRouter } from "./router/AppRouter";

export const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </BrowserRouter>
  );
};
