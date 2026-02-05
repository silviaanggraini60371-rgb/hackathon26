import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./components/pages/Dashboard";
import { Datasets } from "./components/pages/Datasets";
import { DatasetDetail } from "./components/pages/DatasetDetail";
import { Pipelines } from "./components/pages/Pipelines";
import { Analytics } from "./components/pages/Analytics";
import { QualityDashboard } from "./components/pages/QualityDashboard";
import { NotFound } from "./components/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "datasets", Component: Datasets },
      { path: "datasets/:id", Component: DatasetDetail },
      { path: "pipelines", Component: Pipelines },
      { path: "analytics", Component: Analytics },
      { path: "quality", Component: QualityDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);
