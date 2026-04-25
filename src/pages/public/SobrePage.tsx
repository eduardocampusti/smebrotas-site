import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { SobreConfig } from '../../types'

const DEFAULT_CONFIG: SobreConfig = {
  id: 'default',
  hero_title: "Sobre a Secretaria de Educação",
  hero_subtitle: "Conheça a nossa história, nossa missão como instituição formadora e a equipe gestora dedicada ao avanço da educação no município.",
  hero_banner_url: "/secretaria_foto.jpg",
  hero_banner_text: "Trabalhando diariamente para construir um futuro mais brilhante através do conhecimento.",
  intro_title: "Apresentação",
  intro_text: "A Secretaria Municipal de Educação atua como o órgão responsável por organizar, administrar e supervisionar o sistema educacional do município. Nosso compromisso é com a oferta de uma educação básica de excelência, pautada na equidade, inclusão e inovação pedagógica.\n\nGerenciamos uma rede composta por dezenas de unidades escolares, desde a Educação Infantil até o Ensino Fundamental, além da Educação de Jovens e Adultos (EJA) e Educação Especial. Trabalhamos em conjunto com a comunidade escolar para garantir que cada estudante alcance seu pleno potencial.",
  mission: "Garantir o acesso, a permanência e o sucesso de todos os alunos na escola, oferecendo uma educação pública gratuita, democrática e de qualidade, que promova o desenvolvimento integral do cidadão.",
  vision: "Ser referência nacional em gestão educacional e inovação pedagógica, reconhecida por uma rede de ensino acolhedora e eficiente que transforma a realidade local através do conhecimento.",
  values: [
    "Ética e Transparência",
    "Gestão Democrática",
    "Inclusão e Diversidade",
    "Valorização dos Profissionais"
  ],
  management_team: [
    { id: '1', name: 'Dra. Helena Mendes', role: 'Secretária de Educação', photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrNnWZr7Robgj8wIGhvAl_9ZawhTShF4reqPwlXKsLBNUk4MCIIvBNU5xs0nSR_7OUX2xd8InOoHpx4PWuQIzABMd6yInQcuyWjtGJ3E2c1h3jrRqw2_iAzp-noGNGYpVHTGQJLTgNgH9rESI3qjmStEoTsbpBu-NXQPQVQSJ4WF4upmnq4GQSMxsA33WbhYIhosXm7G7TFfrnTZup0_iZwQ9Og1AH1V0EVkaZgaY25T_a30wtDVztq-i8nSyAZ0APU0tpdaTXCuE', order: 0 },
    { id: '2', name: 'Roberto Carvalho', role: 'Diretor de Ensino', photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTIEqMWUkWgUAhRgKYAHMmthqG_e6SL-8dt-boq5XMY2XSlW-9jNqcFWqs1_s3m8Oi5b1u8WemWw3qGZyTP5xc8cSHYIIoLr0WxNN_D5ABNcapLbsBdaW1vQVKsjEEHKK9ZKdGSl5ex8TzLJvjlC_xZtoLxIMoYh2UJ0FSWehHUEYcjYUQd_yB-XKJE9jbxHv3V-6A-dTktmUbM0YpnFwu324vF1O7GbWRm_rIY0qo70RhxRQQzLLTq71VPn5__l7imMXfHQS6FZY', order: 1 },
    { id: '3', name: 'Ana Lúcia Costa', role: 'Diretora Administrativa', photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtiKcnAf459gSwcOi4vcBtr537dk9X1pujmCDRvp23ejU8Z7piSEQ4D-ERNMMQhivzuDC1mSMeud7eOuIDk-ctleJlAWvuzLzUNuEZrlaK0H4lLCi6FxXIfwgAfqqA_DhVpp1mcmWqyu5EuWSLQprS93ycdLUPhNZ3NaYi5UFoA6lsp-t4OJt5E9xS9k7fmPxbDwPHKHYrCwFnFBpNLDaG4rSUOSfV87qqHgtxZ-hMtTFfKRWbwTCTVoDFHoBK1GTFOihCH39WOpQ', order: 2 },
    { id: '4', name: 'Carlos Eduardo', role: 'Gestão de Pessoas', photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg3R_hoIukiHDdMIwCyRbW0OMa7ADiUx9juuBnOJYxFtJrKpbREVS0fTd-OsMMIE4hU1ikjRce6JAD8RYkeGoxI1OnViaPw4vJMoaBpfwC0pMWOJfankxjVfzA-uixKeuOmFeYiyuAoQaXoBynAm5luKPJcTaT6A-r_Z408VJYgStoS32Disqwsr8d064DLsaAjJxL3RMvAxKELycf3ECpufkAJcdKbPZ0MGElXpx4gjE_O3j2DVSBz1nZ5wtXqoUJtpzyBewB5K0', order: 3 }
  ]
}

export default function SobrePage() {
  const [config, setConfig] = useState<SobreConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('site_about')
          .select('*')
          .single()

        if (error && error.code !== 'PGRST116') throw error
        if (data) setConfig(data)
      } catch (err) {
        console.error('Erro ao carregar configurações da página Sobre:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Carregando informações institucionais...</p>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col gap-6">
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link className="text-slate-500 hover:text-primary font-medium flex items-center gap-1" to="/">
            <span className="material-symbols-outlined text-[18px]">home</span> Início
          </Link>
          <span className="text-slate-400 material-symbols-outlined text-[18px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">Sobre a Secretaria</span>
        </nav>
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
            {config.hero_title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
            {config.hero_subtitle}
          </p>
        </div>
        <div 
          className="w-full bg-slate-200 dark:bg-slate-800 bg-center bg-no-repeat bg-cover rounded-2xl min-h-[320px] md:min-h-[400px] shadow-sm relative overflow-hidden" 
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url("${config.hero_banner_url}")` }}
        >
          <div className="absolute inset-x-0 bottom-0 p-8">
            <p className="text-white font-medium text-lg max-w-2xl bg-black/20 backdrop-blur-sm p-4 rounded-xl">
              {config.hero_banner_text}
            </p>
          </div>
        </div>
      </section>

      {/* Apresentação */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">info</span> {config.intro_title}
        </h2>
        <div className="text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed whitespace-pre-wrap">
          {config.intro_text}
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Missão */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full hover:border-primary/30 transition-colors">
            <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">track_changes</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Nossa Missão</h3>
            <p className="text-slate-600 dark:text-slate-400 flex-1">
              {config.mission}
            </p>
          </div>
          {/* Visão */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full hover:border-primary/30 transition-colors">
            <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">visibility</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Nossa Visão</h3>
            <p className="text-slate-600 dark:text-slate-400 flex-1">
              {config.vision}
            </p>
          </div>
          {/* Valores */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full hover:border-primary/30 transition-colors">
            <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">diamond</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Nossos Valores</h3>
            <ul className="text-slate-600 dark:text-slate-400 flex-1 space-y-2">
              {config.values.map((valor, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> 
                  {valor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Equipe Gestora */}
      <section className="pt-4">
        <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">groups</span> Equipe Gestora
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.management_team
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((gestor) => (
              <div key={gestor.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 mb-4 overflow-hidden ring-4 ring-primary/10">
                  {gestor.photo_url ? (
                    <img alt={`Foto de ${gestor.name}`} className="w-full h-full object-cover" src={gestor.photo_url} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <span className="material-symbols-outlined text-slate-400 text-4xl">person</span>
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{gestor.name}</h4>
                <p className="text-sm font-semibold text-primary mt-1">{gestor.role}</p>
              </div>
            ))
          }
        </div>
      </section>

      {/* Organograma */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_tree</span> Organograma
        </h2>
        <div className="flex flex-col items-center py-6 overflow-x-auto">
          <div className="bg-primary text-white px-6 py-3 rounded-lg shadow-md font-bold mb-6 relative z-10 min-w-[200px] text-center">
            Secretaria de Educação
          </div>
          <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700"></div>
          <div className="w-full max-w-[600px] h-0.5 bg-slate-300 dark:bg-slate-700"></div>
          <div className="flex justify-between w-full max-w-[680px] mt-0 relative">
            <div className="absolute left-[10%] top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-700"></div>
            <div className="absolute left-[50%] top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-700 -translate-x-1/2"></div>
            <div className="absolute right-[10%] top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex justify-between w-full mt-6 px-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-sm text-center flex-1 shadow-sm">
                Diretoria de Ensino
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-sm text-center flex-1 shadow-sm">
                Diretoria Administrativa
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-sm text-center flex-1 shadow-sm">
                Gestão de Pessoas
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
