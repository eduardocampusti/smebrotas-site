import { useEffect, useState } from 'react'
import React from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { TopBarItem } from '../../types'

const TEMP_TOPBAR_ITEMS: TopBarItem[] = [
  { id: '1', texto: 'Ouvidoria', icone: 'hearing', link: '#', target_blank: true, ativo: true, ordem: 1 },
  { id: '2', texto: 'Diário Oficial', icone: 'description', link: '#', target_blank: true, ativo: true, ordem: 2 },
  { id: '3', texto: 'Acesso à Informação', icone: 'info', link: '#', target_blank: true, ativo: true, ordem: 3 },
  { id: '4', texto: 'Proteção de Dados', icone: 'shield', link: '#', target_blank: true, ativo: true, ordem: 4 },
  { id: '5', texto: 'Governo Digital', icone: 'computer', link: '#', target_blank: true, ativo: true, ordem: 5 },
  { id: '6', texto: 'Mapa do Site', icone: 'map', link: '/mapa-do-site', target_blank: false, ativo: true, ordem: 6 },
  { id: '7', texto: 'Webmail', icone: 'mail', link: '#', target_blank: true, ativo: true, ordem: 7 },
  { id: '8', texto: 'Instagram', icone: 'photo_camera', link: '#', target_blank: true, ativo: true, ordem: 8 }
]

function isInternalLink(link: string): boolean {
  return link.startsWith('/') && !link.startsWith('//')
}

export default function TopBar() {
  const [items, setItems] = useState<TopBarItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopBarItems() {
      try {
        const { data: configData, error: configError } = await supabase
          .from('site_config')
          .select('top_bar_items')
          .single()

        if (!configError && configData?.top_bar_items && Array.isArray(configData.top_bar_items)) {
          const filteredItems = (configData.top_bar_items as TopBarItem[])
            .filter((item: TopBarItem) => item.ativo)
            .sort((a: TopBarItem, b: TopBarItem) => a.ordem - b.ordem)

          if (filteredItems.length > 0) {
            setItems(filteredItems)
            return
          }
        }

        const { data: tableData, error: tableError } = await supabase
          .from('top_bar_items')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true })

        if (!tableError && tableData && tableData.length > 0) {
          setItems(tableData.map(item => ({
            id: String(item.id),
            texto: item.texto,
            icone: item.icone,
            link: item.link,
            target_blank: item.target_blank,
            ativo: item.ativo,
            ordem: item.ordem
          })) as TopBarItem[])
          return
        }

        if (tableError?.code === '42P01') {
          try {
            const { error: insertError } = await supabase.from('top_bar_items').insert([
              { texto: 'Ouvidoria', icone: 'hearing', link: '#', target_blank: true, ativo: true, ordem: 1 },
              { texto: 'Diário Oficial', icone: 'description', link: '#', target_blank: true, ativo: true, ordem: 2 },
              { texto: 'Acesso à Informação', icone: 'info', link: '#', target_blank: true, ativo: true, ordem: 3 },
              { texto: 'Proteção de Dados', icone: 'shield', link: '#', target_blank: true, ativo: true, ordem: 4 },
              { texto: 'Governo Digital', icone: 'computer', link: '#', target_blank: true, ativo: true, ordem: 5 },
              { texto: 'Mapa do Site', icone: 'map', link: '/mapa-do-site', target_blank: false, ativo: true, ordem: 6 },
              { texto: 'Webmail', icone: 'mail', link: '#', target_blank: true, ativo: true, ordem: 7 },
              { texto: 'Instagram', icone: 'photo_camera', link: '#', target_blank: true, ativo: true, ordem: 8 }
            ])

            if (!insertError) {
              const { data: newData } = await supabase
                .from('top_bar_items')
                .select('*')
                .eq('ativo', true)
                .order('ordem', { ascending: true })
              if (newData && newData.length > 0) {
                setItems(newData.map(item => ({
                  id: String(item.id),
                  texto: item.texto,
                  icone: item.icone,
                  link: item.link,
                  target_blank: item.target_blank,
                  ativo: item.ativo,
                  ordem: item.ordem
                })) as TopBarItem[])
                return
              }
            }
          } catch {
            // Falhou ao criar tabela, usa temporários
          }
        }

        setItems(TEMP_TOPBAR_ITEMS)
      } catch {
        setItems(TEMP_TOPBAR_ITEMS)
      } finally {
        setLoading(false)
      }
    }

    fetchTopBarItems()
  }, [])

  return (
    <div
      className="relative w-full min-h-[36px] sticky top-0 z-[10000]
        bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950
        shadow-[0_1px_12px_rgba(0,0,0,0.15)]"
    >
      <div className="max-w-[1400px] mx-auto px-5 py-[7px]">
        <div className="flex flex-wrap justify-center items-center gap-[2px]">
          {loading ? (
            <span className="text-[11px] text-white/50 font-medium tracking-wide">
              Carregando...
            </span>
          ) : (
            <>
              {items.length === 0 ? (
                <span className="text-[11px] text-white/50 font-medium">
                  Nenhum item configurado
                </span>
              ) : (
                items.map((item, index) => {
                  const itemContent = (
                    <>
                      {item.icone && (
                        <span className="material-symbols-outlined text-[15px] flex items-center opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                          {item.icone}
                        </span>
                      )}
                      <span className="text-[12px] font-medium leading-tight">
                        {item.texto}
                      </span>
                    </>
                  )

                  const itemClassName = [
                    'group inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px]',
                    'text-white/85 hover:text-white',
                    'hover:bg-white/[0.12] hover:shadow-sm',
                    'transition-all duration-200 ease-out',
                    'cursor-pointer select-none whitespace-nowrap',
                  ].join(' ')

                  const separator = index < items.length - 1 && (
                    <span
                      className="text-white/20 text-[13px] font-extralight px-0.5 flex items-center select-none"
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )

                  return (
                    <React.Fragment key={item.id}>
                      {isInternalLink(item.link) ? (
                        <Link to={item.link} className={itemClassName} title={item.texto}>
                          {itemContent}
                        </Link>
                      ) : (
                        <a
                          href={item.link}
                          target={item.target_blank ? '_blank' : undefined}
                          rel={item.target_blank ? 'noopener noreferrer' : undefined}
                          className={itemClassName}
                          title={item.texto}
                        >
                          {itemContent}
                        </a>
                      )}
                      {separator}
                    </React.Fragment>
                  )
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
