import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { useState } from 'react'

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/home', label: 'Página Inicial', icon: 'home' },
  { to: '/admin/sobre', label: 'Sobre a Secretaria', icon: 'info' },
  { to: '/admin/noticias', label: 'Notícias', icon: 'newspaper' },
  { to: '/admin/escolas', label: 'Rede Municipal', icon: 'school' },
  { to: '/admin/servicos', label: 'Serviços', icon: 'home_repair_service' },
  { to: '/admin/programas', label: 'Programas', icon: 'assignment' },
  { to: '/admin/transparencia', label: 'Transparência', icon: 'visibility' },
  { to: '/admin/contato', label: 'Contato', icon: 'contact_mail' },
  { to: '/admin/config', label: 'Configurações', icon: 'settings' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao sair. Tente novamente.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">school</span>
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">SME Brotas</h2>
              <p className="text-xs text-slate-400">Painel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/admin' && location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-300 text-lg">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.nome || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">
              {isLoggingOut ? 'sync' : 'logout'}
            </span>
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Painel Administrativo</h1>
            <p className="text-xs text-slate-500">Secretaria Municipal de Educação de Brotas</p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:underline"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Ver site
          </Link>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
