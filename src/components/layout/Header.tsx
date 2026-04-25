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

  return (
    <>
      <TopBar />
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-10 py-4 bg-white dark:bg-slate-900 sticky top-[36px] z-50">
      <div className="flex items-center gap-8">
        <Link className="flex items-center" to="/">
          <img src="/logo sec educ.png" alt="Secretaria de Educação" className="h-12 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium leading-normal transition-colors ${
                location.pathname === link.to
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4 sm:gap-8">
        {actionButtons.map((botao) => {
          const isExternal = botao.link.startsWith('http') || botao.target_blank
          
          const className = `inline-flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm ${
            botao.cor === 'slate' 
              ? 'bg-slate-800 hover:bg-slate-700' 
              : 'bg-primary hover:bg-primary/90'
          }`

          if (isExternal) {
            return (
              <a
                key={botao.id}
                href={botao.link}
                target={botao.target_blank ? '_blank' : undefined}
                rel={botao.target_blank ? 'noopener noreferrer' : undefined}
                className={className}
              >
                <span className="truncate">{botao.texto}</span>
              </a>
            )
          }

          return (
            <Link
              key={botao.id}
              to={botao.link}
              className={className}
            >
              <span className="truncate">{botao.texto}</span>
            </Link>
          )
        })}
      </div>
    </header>
    </>
  )
}
