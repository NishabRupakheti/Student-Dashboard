import { useState } from 'react'
import Login from './Login'
import Registration from './Registration'
import dashBg from '../assets/dashBg.jpg'

const AuthNav = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'registration'>('login')

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-6"
      style={{ backgroundImage: `url(${dashBg})` }}
    >
      <div className="max-w-md w-full backdrop-blur-sm bg-white/90 rounded-xl shadow-2xl p-8">
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'login' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button 
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'registration' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('registration')}
        >
          Register
        </button>
      </div>
      <div className="mt-6 min-h-[400px] transition-all duration-300 ease-in-out relative overflow-hidden">
        <div 
          className={`transition-all duration-300 ease-in-out ${
            activeTab === 'login' 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-full absolute top-0 left-0 w-full'
          }`}
        >
          <Login />
        </div>
        <div 
          className={`transition-all duration-300 ease-in-out ${
            activeTab === 'registration' 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-full absolute top-0 left-0 w-full'
          }`}
        >
          <Registration />
        </div>
      </div>
      </div>
    </div>
  )
}

export default AuthNav