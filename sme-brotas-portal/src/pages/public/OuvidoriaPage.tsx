import { Link } from 'react-router-dom'

export default function OuvidoriaPage() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link className="text-slate-500 hover:text-primary font-medium flex items-center gap-1" to="/">
          <span className="material-symbols-outlined text-[18px]">home</span> Início
        </Link>
        <span className="text-slate-400 material-symbols-outlined text-[18px]">chevron_right</span>
        <span className="text-slate-900 font-medium">Ouvidoria</span>
      </nav>

      {/* Hero */}
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900">
          Ouvidoria
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Canal aberto para que você possa registrar solicitações, sugestões, elogios, reclamações e denúncias. Sua participação é fundamental para melhorarmos continuamente os serviços da Secretaria Municipal de Educação.
        </p>
      </section>

      {/* O que é a Ouvidoria */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">support_agent</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">O que é a Ouvidoria?</h2>
        </div>
        <div className="text-slate-600 space-y-4 leading-relaxed">
          <p>
            A Ouvidoria da Secretaria Municipal de Educação de Brotas de Macaúbas é um canal de comunicação direta entre o cidadão e a gestão pública educacional. Funciona como um espaço democrático onde toda a comunidade escolar — pais, alunos, professores, servidores e cidadãos em geral — pode manifestar suas opiniões, demandas e reivindicações.
          </p>
          <p>
            Nosso compromisso é receber, analisar e encaminhar todas as manifestações de forma sigilosa, ágil e transparente, garantindo que cada solicitação receba a devida atenção e resposta.
          </p>
        </div>
      </section>

      {/* Tipos de manifestação */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">category</span>
          Tipos de Manifestação
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icone: 'campaign', titulo: 'Sugestão', descricao: 'Apresente ideias e propostas para melhorar os serviços e ações da Secretaria de Educação.' },
            { icone: 'thumb_up', titulo: 'Elogio', descricao: 'Reconheça o bom atendimento, iniciativas ou profissionais que fizeram a diferença.' },
            { icone: 'report', titulo: 'Reclamação', descricao: 'Registre insatisfação com serviços, atendimento ou ações da gestão educacional.' },
            { icone: 'task_alt', titulo: 'Solicitação', descricao: 'Solicite informações, serviços ou ações que sejam de responsabilidade da Secretaria.' },
            { icone: 'shield', titulo: 'Denúncia', descricao: 'Comunique irregularidades, infrações ou atos que prejudiquem a educação municipal.' },
            { icone: 'help', titulo: 'Dúvida', descricao: 'Esclareça questões sobre normas, procedimentos, matrículas e demais serviços.' },
          ].map((item) => (
            <div
              key={item.titulo}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-primary/30 transition-colors flex flex-col"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl">{item.icone}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.titulo}</h3>
              <p className="text-sm text-slate-600 flex-1 leading-relaxed">{item.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aviso provisório */}
      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-500 text-2xl shrink-0 mt-0.5">info</span>
        <div>
          <h3 className="text-base font-bold text-blue-800 mb-1">Canal de atendimento</h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            O formulário oficial e os canais de contato da Ouvidoria serão disponibilizados em breve. Enquanto isso, entre em contato com a Secretaria pelos canais listados na página de <Link to="/contato" className="font-semibold underline underline-offset-2 hover:text-blue-900">Contato</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
