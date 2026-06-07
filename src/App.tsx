import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { releases } from "@/config/releases";
import ReleasePage from "@/pages/ReleasePage";
import Analytics from "@/pages/Analytics";
import AdminGate from "@/components/AdminGate";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/analytics"
        element={
          <AdminGate>
            <Analytics />
          </AdminGate>
        }
      />
      {releases.map((r) => (
        <Route
          key={r.slug}
          path={`/${r.slug}`}
          element={<ReleasePage release={r} />}
        />
      ))}
      <Route path="*" element={<Navigate to={`/${releases[0].slug}`} replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
