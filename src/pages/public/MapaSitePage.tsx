import { Link } from 'react-router-dom'

const SECOES_PRINCIPAIS = [
  { icone: 'home', titulo: 'Início', descricao: 'Página inicial do portal', link: '/' },
  { icone: 'account_balance', titulo: 'Sobre', descricao: 'Informações institucionais da Secretaria', link: '/sobre' },
  { icone: 'school', titulo: 'Escolas', descricao: 'Unidades escolares do município', link: '/escolas' },
  { icone: 'work', titulo: 'Serviços', descricao: 'Serviços oferecidos pela Secretaria', link: '/servicos' },
  { icone: 'newspaper', titulo: 'Notícias', descricao: 'Notícias e comunicados', link: '/noticias' },
  { icone: 'volunteer_activism', titulo: 'Programas', descricao: 'Programas e projetos educacionais', link: '/programas' },
  { icone: 'fact_check', titulo: 'Transparência', descricao: 'Dados abertos e prestação de contas', link: '/transparencia' },
  { icone: 'mail', titulo: 'Contato', descricao: 'Canais de atendimento ao cidadão', link: '/contato' },
]

const ATALHOS_TOPO = [
  { icone: 'hearing', titulo: 'Ouvidoria', link: '/ouvidoria' },
  { icone: 'info', titulo: 'Acesso à Informação', link: '/acesso-a-informacao' },
  { icone: 'shield', titulo: 'Proteção de Dados (LGPD)', link: '/lgpd' },
  { icone: 'map', titulo: 'Mapa do Site', link: '/mapa-do-site' },
]

export default function MapaSitePage() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link className="text-slate-500 hover:text-primary font-medium flex items-center gap-1" to="/">
          <span className="material-symbols-outlined text-[18px]">home</span> Início
        </Link>
        <span className="text-slate-400 material-symbols-outlined text-[18px]">chevron_right</span>
        <span className="text-slate-900 font-medium">Mapa do Site</span>
      </nav>

      {/* Hero */}
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900">
          Mapa do Site
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Encontre rapidamente todas as páginas e seções disponíveis no portal da Secretaria Municipal de Educação.
        </p>
      </section>

      {/* Páginas Principais */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">dashboard</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Páginas Principais</h2>
            <p className="text-sm text-slate-500">Navegação principal do portal</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECOES_PRINCIPAIS.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="group p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-all flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">{item.icone}</span>
                </div>
                <span className="font-semibold text-slate-900 text-sm">{item.titulo}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pl-12">{item.descricao}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Atalhos da Barra Superior */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">toolbar</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Atalhos Rápidos</h2>
            <p className="text-sm text-slate-500">Links da barra superior do portal</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ATALHOS_TOPO.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="group p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-all flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">{item.icone}</span>
              </div>
              <span className="font-semibold text-slate-900 text-sm">{item.titulo}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Transparência */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">fact_check</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Transparência e Atos Oficiais</h2>
            <p className="text-sm text-slate-500">Documentos e informações públicas</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/transparencia"
            className="group p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-all flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">assessment</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm block">Portal da Transparência</span>
              <span className="text-xs text-slate-500">Receitas, despesas e convênios</span>
            </div>
          </Link>
          <Link
            to="/transparencia/atos-oficiais"
            className="group p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-all flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">description</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm block">Atos Oficiais</span>
              <span className="text-xs text-slate-500">Portarias, resoluções e decretos</span>
            </div>
          </Link>
        </div>
      </section>
    </>
  )
}
