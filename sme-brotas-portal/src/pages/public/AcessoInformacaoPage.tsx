import { Link } from 'react-router-dom'

export default function AcessoInformacaoPage() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link className="text-slate-500 hover:text-primary font-medium flex items-center gap-1" to="/">
          <span className="material-symbols-outlined text-[18px]">home</span> Início
        </Link>
        <span className="text-slate-400 material-symbols-outlined text-[18px]">chevron_right</span>
        <span className="text-slate-900 font-medium">Acesso à Informação</span>
      </nav>

      {/* Hero */}
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900">
          Acesso à Informação
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          O acesso à informação é um direito fundamental garantido pela Constituição Federal e regulamentado pela Lei nº 12.527/2011. Conheça os canais e instrumentos de transparência da Secretaria Municipal de Educação.
        </p>
      </section>

      {/* O direito de acesso */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">gavel</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Seu Direito de Acesso</h2>
        </div>
        <div className="text-slate-600 space-y-4 leading-relaxed">
          <p>
            A Lei de Acesso à Informação (LAI), Lei Federal nº 12.527, de 18 de novembro de 2011, assegura a qualquer pessoa, física ou jurídica, o direito de receber dos órgãos públicos informações de seu interesse particular ou de interesse coletivo.
          </p>
          <p>
            Na Secretaria Municipal de Educação de Brotas de Macaúbas, estamos comprometidos com a transparência e a prestação de contas à população. Todos os atos, decisões e informações produzidas ou custodiadas pela Secretaria são de acesso público, salvo nas hipóteses de sigilo previstas em lei.
          </p>
        </div>
      </section>

      {/* Como acessar informações */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">search</span>
          Como Acessar Informações
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icone: 'language', titulo: 'Portal da Transparência', descricao: 'Acesse dados sobre receitas, despesas, licitações, contratos e convênios diretamente pela página de Transparência deste portal.', link: '/transparencia' },
            { icone: 'description', titulo: 'Atos Oficiais', descricao: 'Consulte portarias, resoluções, decretos e demais atos normativos publicados pela Secretaria.', link: '/transparencia/atos-oficiais' },
            { icone: 'mail', titulo: 'Contato Direto', descricao: 'Solicite informações específicas diretamente à Secretaria pelos canais de atendimento ao cidadão.', link: '/contato' },
            { icone: 'forum', titulo: 'Ouvidoria', descricao: 'Utilize o canal da Ouvidoria para solicitar informações, registrar reclamações ou fazer sugestões.', link: '/ouvidoria' },
          ].map((item) => (
            <Link
              key={item.titulo}
              to={item.link}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all group flex flex-col"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">{item.icone}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.titulo}</h3>
              <p className="text-sm text-slate-600 flex-1 leading-relaxed">{item.descricao}</p>
              <span className="text-primary text-sm font-semibold mt-3 flex items-center gap-1">
                Acessar <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Informações proativas */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">campaign</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Informações Divulgadas Proativamente</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Conforme determina a LAI, a Secretaria disponibiliza de forma proativa as seguintes informações:
        </p>
        <ul className="space-y-3">
          {[
            'Estrutura organizacional, competências e atribuições dos setores',
            'Programas e ações da Secretaria, incluindo metas e resultados',
            'Relatórios de gestão, auditorias e prestações de contas',
            'Dados sobre orçamento, receitas e despesas',
            'Informações sobre licitações, contratos e convênios',
            'Serviços oferecidos ao público, requisitos e formas de acesso',
            'Dados abertos e estatísticas educacionais do município',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">check_circle</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Contato e-SIC */}
      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-500 text-2xl shrink-0 mt-0.5">info</span>
        <div>
          <h3 className="text-base font-bold text-blue-800 mb-1">Serviço de Informação ao Cidadão (e-SIC)</h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            O canal oficial para pedidos formais de acesso à informação (e-SIC) será disponibilizado em breve. Enquanto isso, solicite informações pelos nossos canais de <Link to="/contato" className="font-semibold underline underline-offset-2 hover:text-blue-900">contato</Link> ou pela <Link to="/ouvidoria" className="font-semibold underline underline-offset-2 hover:text-blue-900">Ouvidoria</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
