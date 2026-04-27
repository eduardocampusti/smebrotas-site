import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError('E-mail ou senha incorretos. Tente novamente.')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--color-primary)]/30">
            <span className="material-symbols-outlined text-white text-3xl">school</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SME Brotas</h1>
          <p className="text-slate-400 text-sm mt-1">Painel Administrativo</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Bem-vindo de volta</h2>
          <p className="text-slate-500 text-sm mb-6">Entre com suas credenciais para acessar o painel.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-slate-700 text-sm font-semibold">E-mail</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@educacao.gov.br"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white h-12 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-slate-700 text-sm font-semibold">Senha</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white h-12 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold text-sm transition-colors shadow-md shadow-[var(--color-primary)]/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Secretaria Municipal de Educação de Brotas
        </p>
      </div>
    </div>
  )
}
