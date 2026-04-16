import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { releases } from "@/config/releases";
import ReleasePage from "@/pages/ReleasePage";

const App = () => (
  <BrowserRouter>
    <Routes>
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
