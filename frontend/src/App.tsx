import { BrowserRouter, Routes, Route } from "react-router";
import AuthNav from "./components/AuthNav";
import Home from "./pages/Home";
import Course from "./pages/Course";
import RootNav from "./pages/RootNav";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "./graphql/me";

function App() {

  const { data, loading, error } = useQuery(ME_QUERY);

  console.log("ME_QUERY data:", { data, loading, error });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthNav />} />
        <Route path="/" element={<RootNav />}>
          <Route index element={<Home />} />
          <Route path="course" element={<Course />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
