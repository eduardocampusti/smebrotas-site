import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Servico } from '../../types'

const FALLBACK_SERVICOS = [
  {
    titulo: 'Matrícula Escolar',
    resumo: 'Informações, documentos necessários e prazos para novas matrículas e transferências na rede municipal.',
    icone: 'person_add',
    slug: 'matricula-escolar',
    link_externo: '/portal.html',
    texto_link: 'Acessar Serviço'
  },
  {
    titulo: 'Calendário Escolar',
    resumo: 'Consulte o calendário letivo vigente, períodos de recesso, feriados e dias letivos programados.',
    icone: 'calendar_month',
    slug: 'calendario-escolar',
    link_externo: '/transparencia',
    texto_link: 'Visualizar'
  },
  {
    titulo: 'Cardápio Escolar',
    resumo: 'Acompanhe o cardápio semanal da alimentação escolar, planejado por nutricionistas para cada faixa etária.',
    icone: 'restaurant',
    slug: 'cardapio-escolar',
    link_externo: null,
    texto_link: 'Ver Cardápio'
  },
  {
    titulo: 'Transporte Escolar',
    resumo: 'Informações sobre rotas, horários, cadastro de alunos e normas do transporte escolar municipal.',
    icone: 'directions_bus',
    slug: 'transporte-escolar',
    link_externo: '/contato',
    texto_link: 'Consultar Rotas'
  }
]

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServicos() {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })

      if (!error && data && data.length > 0) {
        setServicos(data as Servico[])
      }
      setLoading(false)
    }

    fetchServicos()
  }, [])

  const displayServicos = servicos.length > 0 ? servicos : (loading ? [] : FALLBACK_SERVICOS)

  return (
    <>
      <div className="flex flex-col gap-4 mb-10">
        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Central de Serviços Educacionais</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-3xl">Acesse de forma rápida e transparente os principais serviços, documentos e portais da Secretaria Municipal de Educação.</p>
      </div>

      {loading && servicos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayServicos.map((servico, index) => {
            const isFeatured = 'destaque' in servico && servico.destaque;
            return (
              <div 
                key={'id' in servico ? servico.id : index} 
                className={`group flex flex-col rounded-xl border overflow-hidden transition-all duration-300 ${
                  isFeatured 
                    ? 'border-primary shadow-lg shadow-primary/10 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 ring-1 ring-primary/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-primary/30'
                }`}
              >
                <div className="p-6 flex flex-col h-full relative">
                  {isFeatured && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-md animate-pulse">
                      <span className="material-symbols-outlined !text-[12px]">star</span>
                      Destaque
                    </div>
                  )}
                  <div className={`size-12 rounded-lg flex items-center justify-center mb-5 transition-colors duration-300 ${
                    isFeatured ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                    <span className="material-symbols-outlined !text-2xl">{servico.icone}</span>
                  </div>
                  <h2 className="text-xl font-bold leading-tight mb-2 text-slate-900 dark:text-white">{servico.titulo}</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-relaxed flex-grow mb-6">
                    {servico.resumo}
                  </p>
                  
                  {servico.link_externo ? (
                    <a 
                      className={`mt-auto flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-colors ${
                        isFeatured
                          ? 'bg-primary text-white hover:bg-primary-dark shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-primary border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white hover:border-primary'
                      }`} 
                      href={servico.link_externo}
                    >
                      {servico.texto_link || 'Acessar Serviço'}
                    </a>
                  ) : (
                    <Link 
                      className={`mt-auto flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-colors ${
                        isFeatured
                          ? 'bg-primary text-white hover:bg-primary-dark shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-primary border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white hover:border-primary'
                      }`} 
                      to={`/servicos/${servico.slug}`}
                    >
                      {servico.texto_link || 'Acessar Serviço'}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  )
}
