
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import type { IndicadorTransparencia, ArquivoTransparencia, CategoriaTransparencia, SiteConfig } from '../../types';

export default function TransparenciaPage() {
  const [indicadores, setIndicadores] = useState<IndicadorTransparencia[]>([]);
  const [arquivos, setArquivos] = useState<ArquivoTransparencia[]>([]);
  const [categorias, setCategorias] = useState<CategoriaTransparencia[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anoFiltro, setAnoFiltro] = useState('Todos os Anos');

  useEffect(() => {
    fetchData();
  }, []);

  // SEO dinâmico
  useEffect(() => {
    if (siteConfig?.transparencia_config?.titulo_pagina) {
      document.title = `${siteConfig.transparencia_config.titulo_pagina} | SME Brotas`;
    } else {
      document.title = 'Transparência e Indicadores | SME Brotas';
    }
  }, [siteConfig]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch data in parallel
      const [indRes, arqRes, catRes, configRes] = await Promise.all([
        supabase
          .from('transparencia_indicadores')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true }),
        supabase
          .from('transparencia_arquivos')
          .select('*')
          .eq('ativo', true)
          .order('data_publicacao', { ascending: false }),
        supabase
          .from('transparencia_categorias')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true }),
        supabase
          .from('site_config')
          .select('*')
          .single()
      ]);

      if (indRes.error) throw indRes.error;
      if (arqRes.error) throw arqRes.error;
      if (catRes.error) throw catRes.error;
      
      setIndicadores(indRes.data || []);
      setArquivos(arqRes.data || []);
      setCategorias(catRes.data || []);
      setSiteConfig(configRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados da transparência:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleExportData = () => {
    if (indicadores.length === 0) return;
    
    const headers = ['Título', 'Valor', 'Unidade', 'Ano', 'Meta', 'Variação'];
    const rows = indicadores.map(i => [
      i.titulo,
      i.valor,
      i.unidade || '',
      i.ano_referencia.toString(),
      i.meta || '',
      i.variacao || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `indicadores_sme_brotas_${new Date().getFullYear()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const config = siteConfig?.transparencia_config;
  
  const atosOficiais = arquivos.filter(a => 
    a.categoria === (config?.atos_oficiais_categoria_slug || 'ato_oficial') && 
    (a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
     a.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     a.descricao?.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, config?.atos_oficiais_limite || 10);

  const getArquivosPorCategoria = (categoria: string) => {
    return arquivos.filter(a => a.categoria === categoria);
  };

  const anosDisponiveis = Array.from(new Set([
    ...indicadores.map(i => i.ano_referencia),
    new Date().getFullYear()
  ])).sort((a, b) => b - a);

  return (
    <>
      <div className="flex flex-col gap-6 py-8 border-b border-slate-100 dark:border-slate-800 mb-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex flex-col gap-2 flex-1 min-w-[300px]">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
              {config?.titulo_pagina || 'Transparência e Indicadores'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed max-w-2xl">
              {config?.descricao_pagina || 'Acompanhe os dados educacionais, indicadores de qualidade e a execução orçamentária da rede municipal de ensino.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={config?.dados_abertos_url ? () => window.open(config.dados_abertos_url, '_blank') : handleExportData}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
            >
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>download</span>
              {config?.dados_abertos_url ? 'Portal de Dados Abertos' : 'Exportar Indicadores (CSV)'}
            </button>
          </div>
        </div>

        {/* Busca Global Consolidada */}
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary">
            <span className="material-symbols-outlined" style={{fontSize: '24px'}}>search</span>
          </div>
          <input 
            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary block w-full pl-12 pr-12 p-4 outline-none transition-all placeholder:text-slate-400 shadow-sm" 
            placeholder="O que você está procurando? (Ex: Atos, IDEB, Cardápio...)" 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>cancel</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Indicadores Educacionais */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em]">
            {config?.indicadores_titulo || 'Indicadores Educacionais'}
          </h2>
          <select 
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-1.5 focus:ring-primary focus:border-primary outline-none px-3"
            value={anoFiltro}
            onChange={(e) => setAnoFiltro(e.target.value)}
          >
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
            <option value="Todos os Anos">Todos os Anos</option>
          </select>
        </div>

        {searchTerm && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Mostrando resultados para <span className="font-bold text-primary italic">"{searchTerm}"</span> em toda a Transparência
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const filtered = indicadores.filter(i => {
                const matchesAno = anoFiltro === 'Todos os Anos' || i.ano_referencia === parseInt(anoFiltro);
                const matchesSearch = !searchTerm || 
                                     i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     i.valor.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesAno && matchesSearch;
              });

              if (filtered.length === 0 && !loading) {
                return (
                  <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 mb-2" style={{fontSize: '48px'}}>analytics</span>
                    <p className="text-slate-500">Nenhum indicador encontrado para os critérios selecionados.</p>
                  </div>
                );
              }

              return filtered.map((indicador) => (
                <div key={indicador.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-base font-medium leading-normal">{indicador.titulo}</p>
                    <span className="material-symbols-outlined text-primary">{indicador.icone || 'monitoring'}</span>
                  </div>
                  <p className="tracking-light text-[32px] font-bold leading-tight truncate">
                    {indicador.unidade === 'R$' ? `R$ ${indicador.valor}` : `${indicador.valor}${indicador.unidade || ''}`}
                  </p>
                  <div className="flex gap-1 items-center">
                    {indicador.meta && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Meta: {indicador.meta}</p>
                    )}
                    {indicador.variacao && (
                      <p className={`text-sm font-medium leading-normal ml-2 flex items-center ${indicador.variacao.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}>
                          {indicador.variacao.startsWith('+') ? 'arrow_upward' : 'arrow_downward'}
                        </span> 
                        {indicador.variacao}
                        {indicador.unidade === '%' ? '' : ' pts'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex min-h-[120px] flex-1 flex-col gap-4 mt-4 relative">
                    {indicador.tipo_grafico === 'linha' && Array.isArray(indicador.dados_grafico) && indicador.dados_grafico.length > 0 && (
                      <>
                        <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
                          {(() => {
                            const points = (indicador.dados_grafico || []).map((d, idx: number) => {
                              const x = (idx / (indicador.dados_grafico!.length - 1)) * 100;
                              const val = typeof d.valor === 'number' ? d.valor : parseFloat(d.valor || (d as any).y?.toString() || '0');
                              const y = 35 - (val / 100) * 30; 
                              return { x, y };
                            });
                            
                            const pathD = points.reduce((acc, p, i) => 
                              i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, ""
                            );
                            
                            const areaD = `${pathD} L 100 40 L 0 40 Z`;
                            
                            return (
                              <>
                                <path className="text-primary/10 dark:text-primary/20" d={areaD} fill="currentColor"></path>
                                <path className="text-primary" d={pathD} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                {points.map((p, idx) => (
                                  <circle key={idx} className="text-primary" cx={p.x} cy={p.y} fill="currentColor" r="2"></circle>
                                ))}
                              </>
                            );
                          })()}
                        </svg>
                        <div className="flex justify-between absolute bottom-0 w-full px-1">
                          {indicador.dados_grafico.map((d, idx) => (
                            <p key={idx} className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{d.label || (d as any).x}</p>
                          ))}
                        </div>
                      </>
                    )}

                    {indicador.tipo_grafico === 'barra' && Array.isArray(indicador.dados_grafico) && (
                      <div className="flex items-end gap-2 h-full pb-4">
                        {indicador.dados_grafico.map((d, idx) => {
                          const valorRaw = d.valor || (d as any).y || 0;
                          const valor = typeof valorRaw === 'number' ? valorRaw : parseFloat(valorRaw.toString());
                          const height = `${valor}%`;
                          const isLast = idx === indicador.dados_grafico!.length - 1;
                          return (
                            <div key={idx} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t relative group" style={{height}}>
                              <div className={`absolute inset-x-0 bottom-0 rounded-t h-full transition-colors ${isLast ? 'bg-primary' : 'bg-primary/60 group-hover:bg-primary/80'}`}></div>
                              <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] ${isLast ? 'font-bold text-primary' : 'text-slate-500'}`}>
                                {valor}{indicador.unidade || ''}
                              </span>
                              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 whitespace-nowrap">
                                {d.label || (d as any).x}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {indicador.tipo_grafico === 'pizza' && Array.isArray(indicador.dados_grafico) && (
                      <div className="flex flex-col justify-center gap-2">
                        {indicador.dados_grafico.map((d, idx) => {
                          const valorRaw = d.valor || (d as any).y || 0;
                          const valor = typeof valorRaw === 'number' ? valorRaw : parseFloat(valorRaw.toString());
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-600 dark:text-slate-400">{d.label || (d as any).x}</span>
                                <span className="font-medium">{valor}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-blue-400' : 'bg-blue-200'}`} 
                                  style={{width: `${valor}%`}}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Documentos Anexos */}
                  {indicador.arquivos && indicador.arquivos.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Documentos Relacionados</p>
                      <div className="flex flex-col gap-2">
                        {indicador.arquivos.map((arq, idx) => (
                          <a 
                            key={idx} 
                            href={arq.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors group"
                          >
                            <span className="text-xs font-medium truncate pr-2">{arq.titulo}</span>
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary" style={{fontSize: '16px'}}>download</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        )}
      </section>
      
      {/* Documentos Públicos e Relatórios */}
      <section className="mb-10" id="documentos-relatorios">
        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
          {config?.documentos_titulo || 'Documentos e Relatórios'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorias
            .filter(cat => {
              if (!searchTerm) return true;
              const catMatches = cat.nome.toLowerCase().includes(searchTerm.toLowerCase());
              const filesMatch = getArquivosPorCategoria(cat.slug).some(a => 
                a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
              );
              return catMatches || filesMatch;
            })
            .map(cat => (
              <CategoryCard 
                key={cat.id}
                titulo={cat.nome}
                descricao={cat.descricao || ''}
                icone={cat.icone}
                arquivos={getArquivosPorCategoria(cat.slug).filter(a => 
                  !searchTerm || 
                  a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                autoOpen={!!searchTerm}
              />
          ))}
        </div>
      </section>
      
      {/* Atos Oficiais Table */}
      <section className="mb-10" id="atos-oficiais">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em]">
            {config?.atos_oficiais_titulo || 'Atos Oficiais Recentes'}
          </h2>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3" scope="col">Tipo / Número</th>
                <th className="px-6 py-3" scope="col">Data</th>
                <th className="px-6 py-3" scope="col">Assunto</th>
                <th className="px-6 py-3 text-right" scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {atosOficiais.length > 0 ? (
                atosOficiais.map((ato) => (
                  <tr key={ato.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium whitespace-nowrap"> {ato.titulo} </td>
                    <td className="px-6 py-4"> {new Date(ato.data_publicacao).toLocaleDateString('pt-BR')} </td>
                    <td className="px-6 py-4 max-w-md truncate"> {ato.descricao} </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        className="font-medium text-primary hover:underline flex items-center justify-end gap-1" 
                        href={ato.arquivo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <span className="material-symbols-outlined" style={{fontSize: '18px'}}>download</span> Baixar
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    Nenhum ato oficial encontrado para os termos buscados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-center bg-slate-50 dark:bg-slate-800/30">
            <Link className="text-sm font-medium text-primary hover:text-blue-700" to={`/transparencia/atos-oficiais${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ''}`}>Ver todos os atos oficiais</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryCard({ 
  titulo, 
  descricao, 
  icone, 
  arquivos,
  autoOpen = false
}: { 
  titulo: string, 
  descricao: string, 
  icone: string, 
  arquivos: ArquivoTransparencia[],
  autoOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Abrir automaticamente se autoOpen for true (durante a busca)
  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group text-left"
      >
        <div className={`size-12 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
          <span className="material-symbols-outlined">{icone}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base">{titulo}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{descricao}</p>
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>chevron_right</span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 mt-1 animate-in slide-in-from-top-2 duration-200">
          {arquivos.length > 0 ? (
            arquivos.map(arq => (
              <a 
                key={arq.id} 
                href={arq.arquivo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-colors group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{arq.titulo}</span>
                  <span className="text-[11px] text-slate-500">{new Date(arq.data_publicacao).toLocaleDateString('pt-BR')}</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary" style={{fontSize: '20px'}}>download</span>
              </a>
            ))
          ) : (
            <p className="text-sm text-slate-500 p-4 text-center">Nenhum documento disponível nesta categoria.</p>
          )}
        </div>
      )}
    </div>
  );
}
