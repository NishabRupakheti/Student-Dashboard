import React from 'react'
import { Outlet, NavLink } from 'react-router'

const RootNav = () => {
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