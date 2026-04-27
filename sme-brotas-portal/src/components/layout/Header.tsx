import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { HeaderActionButton, NavLinkItem } from '../../types'
import TopBar from './TopBar'

const defaultNavLinks: NavLinkItem[] = [
  { id: '1', to: '/', label: 'Início', ativo: true, ordem: 0 },
  { id: '2', to: '/sobre', label: 'Sobre', ativo: true, ordem: 1 },
  { id: '3', to: '/escolas', label: 'Escolas', ativo: true, ordem: 2 },
  { id: '4', to: '/servicos', label: 'Serviços', ativo: true, ordem: 3 },
  { id: '5', to: '/noticias', label: 'Notícias', ativo: true, ordem: 4 },
  { id: '6', to: '/programas', label: 'Programas', ativo: true, ordem: 5 },
  { id: '7', to: '/transparencia', label: 'Transparência', ativo: true, ordem: 6 },
  { id: '8', to: '/contato', label: 'Contato', ativo: true, ordem: 7 },
]

const defaultActionButtons: HeaderActionButton[] = [
  { id: '1', texto: 'Portal Educacional', link: '/portal', ativo: true, target_blank: false, cor: 'primary', ordem: 0 },
  { id: '2', texto: 'Portal do Servidor', link: 'https://www.keepinformatica.com.br/contracheque/web/user-management/auth/login', ativo: true, target_blank: true, cor: 'slate', ordem: 1 }
]

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>(defaultNavLinks)
  const [actionButtons, setActionButtons] = useState<HeaderActionButton[]>(defaultActionButtons)

  useEffect(() => {
    async function fetchHeaderConfig() {
      const { data } = await supabase.from('site_config').select('nav_links, header_action_buttons').single()

      if (data) {
        if (data.nav_links && Array.isArray(data.nav_links) && data.nav_links.length > 0) {
          setNavLinks(
            data.nav_links
              .filter((b: NavLinkItem) => b.ativo)
              .sort((a: NavLinkItem, b: NavLinkItem) => a.ordem - b.ordem)
          )
        }

        if (data.header_action_buttons && Array.isArray(data.header_action_buttons)) {
          setActionButtons(
            data.header_action_buttons
              .filter((b: HeaderActionButton) => b.ativo)
              .sort((a: HeaderActionButton, b: HeaderActionButton) => a.ordem - b.ordem)
          )
        }
      }
    }
    fetchHeaderConfig()
  }, [])

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <TopBar />
      <header
        className="sticky top-[36px] z-50 w-full
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
          border-b border-white/20 dark:border-slate-700/30
          shadow-[0_1px_24px_rgba(0,0,0,0.06)]
          transition-shadow duration-300"
      >
        <div
          className="mx-auto px-6 flex items-center justify-between flex-nowrap gap-0 h-[68px]"
          style={{ maxWidth: '1200px' }}
        >
          {/* Logo — fixo, nunca encolhe */}
          <Link to="/" className="flex items-center shrink-0 mr-4 group/logo transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/logo sec educ.png"
              alt="Secretaria de Educação"
              className="h-11 w-auto"
            />
          </Link>

          {/* Navegação — shrink:1, aceita encolher */}
          <nav className="hidden lg:flex items-center gap-0 min-w-0 flex-1 shrink">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={[
                    'relative text-[13px] font-semibold tracking-[0.01em]',
                    'px-[0.5rem] py-[0.3rem] rounded-lg whitespace-nowrap',
                    'border-b-2 leading-none',
                    'transition-all duration-300 ease-out',
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-primary hover:border-primary/30 hover:bg-primary/[0.04]',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Hamburguer — visível abaixo de 1024px */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl
              text-slate-600 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors shrink-0 ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu de navegação"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Botões CTA — shrink-0, nunca encolhem */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 whitespace-nowrap">
            {actionButtons.map((botao) => {
              const isExternal = botao.link.startsWith('http') || botao.target_blank

              const className = [
                'inline-flex cursor-pointer items-center justify-center whitespace-nowrap',
                'px-3 py-2 text-[12px] font-bold leading-normal tracking-[0.01em]',
                'rounded-xl',
                'transition-all duration-300 ease-out',
                'shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0',
                botao.cor === 'slate'
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-primary hover:bg-primary/90 text-white',
              ].join(' ')

              if (isExternal) {
                return (
                  <a
                    key={botao.id}
                    href={botao.link}
                    target={botao.target_blank ? '_blank' : undefined}
                    rel={botao.target_blank ? 'noopener noreferrer' : undefined}
                    className={className}
                  >
                    {botao.texto}
                  </a>
                )
              }

              return (
                <Link
                  key={botao.id}
                  to={botao.link}
                  className={className}
                >
                  {botao.texto}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Menu mobile — drawer abaixo de 1024px */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 dark:border-slate-700/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-fade-in">
            <nav className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={[
                      'text-[14px] font-semibold px-4 py-2.5 rounded-lg',
                      'transition-all duration-200',
                      isActive
                        ? 'text-primary bg-primary/[0.06]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/[0.04]',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="max-w-[1200px] mx-auto px-6 pb-4 flex flex-col gap-2">
              {actionButtons.map((botao) => {
                const isExternal = botao.link.startsWith('http') || botao.target_blank
                const btnClass = [
                  'inline-flex cursor-pointer items-center justify-center whitespace-nowrap',
                  'px-3 py-2.5 text-[13px] font-bold rounded-xl',
                  botao.cor === 'slate'
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-primary hover:bg-primary/90 text-white',
                ].join(' ')

                if (isExternal) {
                  return (
                    <a
                      key={botao.id}
                      href={botao.link}
                      target={botao.target_blank ? '_blank' : undefined}
                      rel={botao.target_blank ? 'noopener noreferrer' : undefined}
                      className={btnClass}
                    >
                      {botao.texto}
                    </a>
                  )
                }
                return (
                  <Link
                    key={botao.id}
                    to={botao.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className={btnClass}
                  >
                    {botao.texto}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
