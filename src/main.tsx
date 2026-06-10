
  import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "./app/store/AppContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <AppProvider>
      <App />
    </AppProvider>
  </ThemeProvider>
);
  