import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { SiteConfig, DraggableItem } from '../../types'

const defaultLinksEstaticos: DraggableItem[] = [
  { id: '1', nome: 'Política de Privacidade', link: '/contato', ativo: true, ordem: 0 },
  { id: '2', nome: 'Termos de Uso', link: '/contato', ativo: true, ordem: 1 },
  { id: '3', nome: 'Mapa do Site', link: '/', ativo: true, ordem: 2 },
]

const defaultLinksUteis: DraggableItem[] = [
  { id: 'fnde', nome: 'FNDE', link: 'https://www.gov.br/fnde/pt-br', ativo: true, ordem: 0 },
  { id: 'mec', nome: 'MEC', link: 'https://www.gov.br/mec/pt-br', ativo: true, ordem: 1 },
  { id: 'seduc', nome: 'SEDUC-BA', link: 'https://www.educacao.ba.gov.br/', ativo: true, ordem: 2 },
  { id: 'undime', nome: 'UNDIME', link: 'https://undime.org.br/', ativo: true, ordem: 3 },
]

export default function Footer() {
  const [config, setConfig] = useState<SiteConfig | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('site_config').select('rodape_texto, rodape_endereco, rodape_telefone, rodape_email, rodape_links_uteis, rodape_redes_sociais, rodape_links_estaticos').single()
      if (data) setConfig(data as SiteConfig)
    }
    fetchConfig()
  }, [])

  const textoInstitucional = config?.rodape_texto || "Compromisso com o futuro através de uma educação pública, gratuita e de qualidade para todos os cidadãos."
  const endereco = config?.rodape_endereco || "Av. Principal, 1000 - Centro"
  const telefone = config?.rodape_telefone || "(74) 3621-8400"
  const email = config?.rodape_email || "sme@brotasdemacaubas.ba.gov.br"

  const renderLinksUteis =
    config?.rodape_links_uteis && Array.isArray(config.rodape_links_uteis) && config.rodape_links_uteis.length > 0
      ? config.rodape_links_uteis.filter((a) => a.ativo).sort((a, b) => a.ordem - b.ordem)
      : defaultLinksUteis

  const renderRedesSociais = (config?.rodape_redes_sociais && Array.isArray(config.rodape_redes_sociais) && config.rodape_redes_sociais.length > 0)
    ? config.rodape_redes_sociais.filter(a => a.ativo).sort((a,b) => a.ordem - b.ordem)
    : []

  const renderLinksEstaticos = (config?.rodape_links_estaticos && Array.isArray(config.rodape_links_estaticos) && config.rodape_links_estaticos.length > 0)
    ? config.rodape_links_estaticos.filter(a => a.ativo).sort((a,b) => a.ordem - b.ordem)
    : defaultLinksEstaticos

  const isExternalLink = (url?: string) => url?.startsWith('http')

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo sec educ.png" alt="Secretaria de Educação" className="h-10 w-auto" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">{textoInstitucional}</p>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 dark:text-slate-100 font-bold">Contato</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-2"><span className="material-symbols-outlined text-base">location_on</span> {endereco}</p>
              <p className="flex items-center gap-2"><span className="material-symbols-outlined text-base">call</span> {telefone}</p>
              <p className="flex items-center gap-2"><span className="material-symbols-outlined text-base">mail</span> {email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 dark:text-slate-100 font-bold">Links Úteis</h4>
            <nav className="flex flex-col gap-2 text-sm">
              {renderLinksUteis.length > 0 ? (
                renderLinksUteis.map((linkItem) => {
                  const url = linkItem.link || '/';
                  const isExt = isExternalLink(url);
                  
                  if (isExt) {
                    return (
                      <a 
                        key={linkItem.id}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1 ${linkItem.icone ? 'text-primary font-medium' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        {linkItem.icone && <span className="material-symbols-outlined text-base">{linkItem.icone}</span>}
                        {linkItem.nome}
                      </a>
                    );
                  }

                  return (
                    <Link 
                      key={linkItem.id}
                      to={url}
                      className={`hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1 ${linkItem.icone ? 'text-primary font-medium' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {linkItem.icone && <span className="material-symbols-outlined text-base">{linkItem.icone}</span>}
                      {linkItem.nome}
                    </Link>
                  );
                })
              ) : null}
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 dark:text-slate-100 font-bold">Redes Sociais</h4>
            <div className="flex flex-wrap items-center gap-4">
              {renderRedesSociais.length > 0 ? (
                renderRedesSociais.map((rede) => {
                  const url = rede.link || '/';
                  const isExt = isExternalLink(url);

                  if (isExt) {
                    return (
                      <a 
                        key={rede.id}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={rede.nome}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined">{rede.icone || 'link'}</span>
                      </a>
                    );
                  }

                  return (
                    <Link 
                      key={rede.id}
                      to={url}
                      title={rede.nome}
                      className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">{rede.icone || 'link'}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 text-xs">
                  <span className="material-symbols-outlined text-sm">link_off</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} Secretaria Municipal de Educação. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            {renderLinksEstaticos.map((link) => {
              const url = link.link || '/';
              const isExt = isExternalLink(url);

              if (isExt) {
                return (
                  <a 
                    key={link.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                  >
                    {link.nome}
                  </a>
                );
              }

              return (
                <Link 
                  key={link.id}
                  to={url}
                  className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                >
                  {link.nome}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}