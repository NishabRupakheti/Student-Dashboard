import Login from "./components/Login";
import { BrowserRouter, Routes, Route } from "react-router";
import Registration from "./components/Registration";
import AuthNav from "./components/AuthNav";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthNav />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
