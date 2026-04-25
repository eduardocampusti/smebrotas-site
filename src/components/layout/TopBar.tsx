import { useEffect, useState } from 'react'
import React from 'react'
import { supabase } from '../../config/supabase'
import type { TopBarItem } from '../../types'

// Dados temporários para teste (caso o banco retorne erro)
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

export default function TopBar() {
  const [items, setItems] = useState<TopBarItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopBarItems() {
      try {
        // PASSO 1: Buscar do site_config (onde o painel admin salva)
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

        // PASSO 2: Buscar da tabela top_bar_items (fonte legada)
        const { data: tableData, error: tableError } = await supabase
          .from('top_bar_items')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true })

        if (!tableError && tableData && tableData.length > 0) {
          const loadedItems = tableData.map(item => ({
            id: String(item.id),
            texto: item.texto,
            icone: item.icone,
            link: item.link,
            target_blank: item.target_blank,
            ativo: item.ativo,
            ordem: item.ordem
          })) as TopBarItem[]

          setItems(loadedItems)
          return
        }

        // PASSO 3: Se tabela não existe, tentar criar automaticamente
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

        // PASSO 4: Último recurso — dados temporários
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
      id="top-bar" 
      style={{ 
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        zIndex: '10000',
        position: 'sticky',
        top: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        minHeight: '36px'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6px 20px' }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '2px',
          position: 'relative'
        }}>
          {loading ? (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Carregando...</span>
          ) : (
            <>
              {items.length === 0 ? (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Nenhum item configurado</span>
              ) : (
                items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <a
                      href={item.link}
                      target={item.target_blank ? '_blank' : undefined}
                      rel={item.target_blank ? 'noopener noreferrer' : undefined}
                      className="topbar-item"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        color: 'rgba(255, 255, 255, 0.95)',
                        textDecoration: 'none',
                        borderRadius: '3px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        fontWeight: '500',
                        lineHeight: 1.3
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
                        e.currentTarget.style.color = '#ffffff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)'
                      }}
                      title={item.texto}
                    >
                      {item.icone && (
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                          {item.icone}
                        </span>
                      )}
                      <span>{item.texto}</span>
                    </a>
                    {/* Separador visual entre itens */}
                    {index < items.length - 1 && (
                      <span 
                        className="topbar-separator"
                        style={{
                          color: 'rgba(255, 255, 255, 0.35)',
                          fontSize: '13px',
                          fontWeight: '200',
                          padding: '0 2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        |
                      </span>
                    )}
                  </React.Fragment>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}