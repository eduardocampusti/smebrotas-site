import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'

interface Stats {
  totalNoticias: number
  noticiasPublicadas: number
  noticiasDraft: number
  totalFaqs: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalNoticias: 0, noticiasPublicadas: 0, noticiasDraft: 0, totalFaqs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [noticiasRes, faqRes] = await Promise.all([
        supabase.from('noticias').select('status'),
        supabase.from('faq').select('id'),
      ])

      const noticias = noticiasRes.data || []
      const publicadas = noticias.filter((n: any) => n.status === 'publicado').length
      const rascunhos = noticias.filter((n: any) => n.status === 'rascunho').length

      setStats({
        totalNoticias: noticias.length,
        noticiasPublicadas: publicadas,
        noticiasDraft: rascunhos,
        totalFaqs: faqRes.data?.length || 0,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Notícias Publicadas', value: stats.noticiasPublicadas, icon: 'newspaper', color: 'bg-emerald-500', link: '/admin/noticias' },
    { label: 'Rascunhos', value: stats.noticiasDraft, icon: 'edit_note', color: 'bg-amber-500', link: '/admin/noticias' },
    { label: 'Total de Notícias', value: stats.totalNoticias, icon: 'article', color: 'bg-[var(--color-primary)]', link: '/admin/noticias' },
    { label: 'Perguntas FAQ', value: stats.totalFaqs, icon: 'help', color: 'bg-violet-500', link: '/admin/contato' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral do portal institucional</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center shadow-lg`}>
                <span className="material-symbols-outlined text-white text-2xl">{card.icon}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-[var(--color-primary)] transition-colors">arrow_forward</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/noticias/nova"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors group"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-[var(--color-primary)] text-2xl">add_circle</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Nova Notícia</p>
              <p className="text-xs text-slate-500">Criar novo comunicado</p>
            </div>
          </Link>
          <Link
            to="/admin/home"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors group"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-[var(--color-primary)] text-2xl">edit</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Editar Home</p>
              <p className="text-xs text-slate-500">Alterar banner e título</p>
            </div>
          </Link>
          <Link
            to="/admin/contato"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors group"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-[var(--color-primary)] text-2xl">phone</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Atualizar Contato</p>
              <p className="text-xs text-slate-500">Telefone, e-mail, endereço</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
