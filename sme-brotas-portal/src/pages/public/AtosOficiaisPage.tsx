
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import type { ArquivoTransparencia, SiteConfig } from '../../types';

export default function AtosOficiaisPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  
  const [arquivos, setArquivos] = useState<ArquivoTransparencia[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [filterAno, setFilterAno] = useState('todos');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Primeiro buscamos o config se ainda não tivermos
      let currentConfig = siteConfig;
      if (!currentConfig) {
        const { data: configRes } = await supabase
          .from('site_config')
          .select('*')
          .single();
        setSiteConfig(configRes);
        currentConfig = configRes;
      }

      const targetCategory = currentConfig?.transparencia_config?.atos_oficiais_categoria_slug || 'ato_oficial';

      // Query base
      let query = supabase
        .from('transparencia_arquivos')
        .select('*', { count: 'exact' })
        .eq('ativo', true)
        .eq('categoria', targetCategory);

      // Filtros de servidor
      if (debouncedSearch) {
        query = query.or(`titulo.ilike.%${debouncedSearch}%,numero.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`);
      }

      if (filterAno !== 'todos') {
        const startOfYear = `${filterAno}-01-01`;
        const endOfYear = `${filterAno}-12-31`;
        query = query.gte('data_publicacao', startOfYear).lte('data_publicacao', endOfYear);
      }

      // Paginação
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order('data_publicacao', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setArquivos(data || []);
      setTotalCount(count || 0);

      // SEO
      if (currentConfig?.transparencia_config?.atos_oficiais_titulo) {
        document.title = `${currentConfig.transparencia_config.atos_oficiais_titulo} | SME Brotas`;
        
        // Atualiza meta description para SEO
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', currentConfig.transparencia_config.descricao_pagina || 'Consulte os atos oficiais da SME Brotas.');
      }
    } catch (error) {
      console.error('Erro ao buscar atos oficiais:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterAno, currentPage, siteConfig]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reseta para primeira página ao buscar
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const targetCategory = siteConfig?.transparencia_config?.atos_oficiais_categoria_slug || 'ato_oficial';
  const totalPages = Math.ceil(totalCount / pageSize);

  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);

  useEffect(() => {
    async function fetchYears() {
      const { data } = await supabase
        .from('transparencia_arquivos')
        .select('data_publicacao')
        .eq('ativo', true)
        .eq('categoria', targetCategory);
      
      if (data) {
        const years = Array.from(new Set(data.map(d => new Date(d.data_publicacao).getFullYear()))).sort((a, b) => b - a);
        setAnosDisponiveis(years);
      }
    }
    if (siteConfig) fetchYears();
  }, [siteConfig, targetCategory]);

  const config = siteConfig?.transparencia_config;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <Link to="/transparencia" className="inline-flex items-center gap-2 text-primary hover:underline mb-4 font-bold">
          <span className="material-symbols-outlined">arrow_back</span> Voltar para Transparência
        </Link>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {config?.atos_oficiais_titulo || 'Atos Oficiais'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
          {config?.descricao_pagina || 'Consulte aqui a listagem completa de decretos, portarias e demais atos oficiais publicados pela Secretaria Municipal de Educação.'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 ${loading ? 'animate-spin' : ''}`}>
            {loading ? 'sync' : 'search'}
          </span>
          <input 
            type="text" 
            placeholder="Buscar por título, número ou assunto..." 
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-primary font-bold"
            value={filterAno}
            onChange={(e) => setFilterAno(e.target.value)}
          >
            <option value="todos">Todos os Anos</option>
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">Tipo / Número</th>
              <th className="px-6 py-4">Data de Publicação</th>
              <th className="px-6 py-4">Assunto / Descrição</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td colSpan={4} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full"></div></td>
                </tr>
              ))
            ) : arquivos.length > 0 ? (
              arquivos.map((ato) => (
                <tr key={ato.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white"> {ato.titulo} </td>
                  <td className="px-6 py-4 whitespace-nowrap"> {new Date(ato.data_publicacao).toLocaleDateString('pt-BR')} </td>
                  <td className="px-6 py-4"> {ato.descricao} </td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg transition-colors" 
                      href={ato.arquivo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <span className="material-symbols-outlined text-[20px]">download</span> Baixar
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl">search_off</span>
                    <p className="font-medium">Nenhum documento encontrado.</p>
                    <p className="text-xs">Tente ajustar sua busca ou filtros.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-bold text-slate-900 dark:text-white">{arquivos.length}</span> de <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> atos oficiais
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="size-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Lógica simples para mostrar páginas próximas à atual
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i + 1;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`size-10 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum ? 'bg-primary text-white shadow-md' : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="size-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h3 className="font-bold mb-2">Dúvidas sobre os Atos Oficiais?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Os atos oficiais são documentos públicos que registram as decisões e normativas da SME. Caso não encontre o que procura, você pode entrar em contato com o setor administrativo.
        </p>
      </div>
    </div>
  );
}
