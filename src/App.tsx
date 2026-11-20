import { Route, Routes } from "react-router-dom";
import Home from "./shell/Home";
import Shell from "./shell/Shell";
import WorkloadHost from "./shell/WorkloadHost";

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="workloads/:id" element={<WorkloadHost />} />
        <Route path="*" element={<p role="alert">Page not found.</p>} />
      </Route>
    </Routes>
  );
}