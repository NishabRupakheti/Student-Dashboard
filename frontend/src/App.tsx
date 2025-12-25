import { BrowserRouter, Routes, Route } from "react-router";
import AuthNav from "./components/AuthNav";
import Home from "./pages/Home";
import Course from "./pages/Course";
import RootNav from "./pages/RootNav";
import ProtectedRoute from "./components/ProtectedRoute";

// main app component || sets up routing
function App() {
  return (
    // routes setup
    <BrowserRouter> {/* BrowserRouter wraps the entire routing setup */}
      <Routes> {/* Switchboards that evaluate the current URL and render the matching Route */}
        <Route path="/auth" element={<AuthNav />} /> {/* On the /auth path, render the AuthNav component */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <RootNav />
            </ProtectedRoute>
          }
        > {/* On the / path, render the RootNav component (protected) */}
          <Route index element={<Home />} />  
          <Route path="course" element={<Course />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
