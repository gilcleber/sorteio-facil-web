import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, Settings, DollarSign, Shield, LogOut, Radio } from 'lucide-react'

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, signOut } = useAuth()

    const menuItems = [
        {
            name: 'Sorteios',
            icon: Home,
            path: '/',
            show: true
        },
        {
            name: 'Configurações',
            icon: Settings,
            path: '/configuracoes',
            show: true
        },
        {
            name: 'Financeiro',
            icon: DollarSign,
            path: '/financeiro',
            show: user?.isAdmin
        },
        {
            name: 'Super Admin',
            icon: Shield,
            path: '/super-admin',
            show: user?.isAdmin
        }
    ]

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50">
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                        <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">Sorteio Fácil</h1>
                        <p className="text-gray-400 text-xs">PRO</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                            {user?.email}
                        </p>
                        {user?.isAdmin && (
                            <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">
                                Admin
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.filter(item => item.show).map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    )
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar
