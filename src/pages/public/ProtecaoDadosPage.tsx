import { Link } from 'react-router-dom'

export default function ProtecaoDadosPage() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link className="text-slate-500 hover:text-primary font-medium flex items-center gap-1" to="/">
          <span className="material-symbols-outlined text-[18px]">home</span> Início
        </Link>
        <span className="text-slate-400 material-symbols-outlined text-[18px]">chevron_right</span>
        <span className="text-slate-900 font-medium">Proteção de Dados</span>
      </nav>

      {/* Hero */}
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900">
          Proteção de Dados Pessoais
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          A Secretaria Municipal de Educação de Brotas de Macaúbas está comprometida com a proteção dos dados pessoais de alunos, familiares, servidores e cidadãos, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>
      </section>

      {/* Sobre a LGPD */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">policy</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">O que é a LGPD?</h2>
        </div>
        <div className="text-slate-600 space-y-4 leading-relaxed">
          <p>
            A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709, de 14 de agosto de 2018) estabelece regras para a coleta, o tratamento, o armazenamento e a compartilhamento de dados pessoais, tanto por entidades públicas quanto privadas.
          </p>
          <p>
            A LGPD garante aos titulares de dados o direito à privacidade e à liberdade, e impõe aos órgãos públicos o dever de tratar dados pessoais com responsabilidade, segurança e transparência.
          </p>
        </div>
      </section>

      {/* Nossos compromissos */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">verified_user</span>
          Nossos Compromissos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icone: 'lock', titulo: 'Segurança', descricao: 'Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra acessos não autorizados, destruição, perda ou alteração.' },
            { icone: 'visibility', titulo: 'Transparência', descricao: 'Informamos de forma clara sobre quais dados coletamos, para que finalidade e como são tratados, respeitando o princípio da finalidade.' },
            { icone: 'how_to_reg', titulo: 'Consentimento e Legalidade', descricao: 'Os dados pessoais são coletados e tratados apenas com base legal adequada, seja consentimento, obrigação legal ou interesse legítimo.' },
            { icone: 'manage_accounts', titulo: 'Direitos dos Titulares', descricao: 'Garantimos o exercício dos direitos de acesso, correção, eliminação, portabilidade e revogação do consentimento dos titulares.' },
            { icone: 'update', titulo: 'Atualização Contínua', descricao: 'Nossas práticas e políticas de proteção de dados são revisadas periodicamente para acompanhar mudanças na legislação e nas melhores práticas.' },
            { icone: 'groups', titulo: 'Capacitação', descricao: 'Nossos servidores são treinados e orientados sobre boas práticas de proteção de dados e privacidade no exercício de suas funções.' },
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

      {/* Direitos do titular */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">shield_person</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Seus Direitos como Titular</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Conforme a LGPD, todo titular de dados pessoais tem direitos garantidos. Você pode solicitar à Secretaria:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            'Confirmação da existência de tratamento de dados',
            'Acesso aos dados pessoais coletados',
            'Correção de dados incompletos, inexatos ou desatualizados',
            'Anonimização, bloqueio ou eliminação de dados desnecessários',
            'Portabilidade dos dados a outro fornecedor de serviço',
            'Eliminação dos dados tratados com consentimento',
            'Informação sobre compartilhamento de dados',
            'Revogação do consentimento a qualquer momento',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-600">
              <span className="material-symbols-outlined text-primary text-[16px] mt-1 shrink-0">check</span>
              <span className="text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Aviso provisório */}
      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-500 text-2xl shrink-0 mt-0.5">info</span>
        <div>
          <h3 className="text-base font-bold text-blue-800 mb-1">Encarregado de Dados (DPO)</h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            O contato oficial do Encarregado de Proteção de Dados (DPO) e os canais específicos para exercício dos direitos do titular serão publicados em breve. Para questões relacionadas à privacidade e proteção de dados, entre em contato pela página de <Link to="/contato" className="font-semibold underline underline-offset-2 hover:text-blue-900">Contato</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
