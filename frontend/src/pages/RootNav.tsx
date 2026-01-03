import { Outlet, NavLink, useNavigate } from 'react-router'
import { useMutation } from '@apollo/client/react'
import { LOGOUT_MUTATION } from '../graphql/mutations/auth'

interface LogoutResponse {
  logout: string;
}

const RootNav = () => {
  const navigate = useNavigate();
  const [logout] = useMutation<LogoutResponse>(LOGOUT_MUTATION);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
        .then((response) => {
          console.log('Logout successful:', response.data?.logout);
          // Redirect to auth page
          navigate('/auth');
        })
        .catch((error) => {
          console.error('Logout error:', error);
        });
    }
  };

  return (
    // this gives out navigation for the main app pages and an outlet for rendering the child routes
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
              
              <div className="flex space-x-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  end
                >
                  Home
                </NavLink>
                
                <NavLink
                  to="/course"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  Courses
                </NavLink>
              </div>
            </div>
            
            <div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Outlet for rendering child routes like Home and Course */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default RootNav