import { Navigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "../graphql/queries/me";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface MeData {
  me: {
    firstName: string;
    email: string;
  };
}

// Component to protect routes from unauthorized access
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data, loading, error } = useQuery<MeData>(ME_QUERY);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // If there's an error or no user data, redirect to auth page
  if (error || !data?.me) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
