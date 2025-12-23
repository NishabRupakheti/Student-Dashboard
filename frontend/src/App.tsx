import { BrowserRouter, Routes, Route } from "react-router";
import AuthNav from "./components/AuthNav";
import Home from "./pages/Home";
import Course from "./pages/Course";
import RootNav from "./pages/RootNav";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "./graphql/queries/me";

// main app component || sets up routing
function App() {

  const { data, loading, error } = useQuery(ME_QUERY); // runs this when the app loads to check if user is logged in
  console.log("ME_QUERY data:", { data, loading, error });

  return (
    // routes setup
    <BrowserRouter> {/* BrowserRouter wraps the entire routing setup */}
      <Routes> {/* Switchboards that evaluate the current URL and render the matching Route */}
        <Route path="/auth" element={<AuthNav />} /> {/* On the /auth path, render the AuthNav component */}
        <Route path="/" element={<RootNav />}> {/* On the / path, render the RootNav component */}
          <Route index element={<Home />} />  
          <Route path="course" element={<Course />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
