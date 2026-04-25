import { Link } from 'react-router-dom'

export default function PortalPage() {
  return (
    <>
      <div className="flex flex-col gap-10">
        {/* Hero Section */}
        <div className="flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-2xl items-center justify-center p-8 text-center relative overflow-hidden shadow-lg" style={{backgroundImage: 'linear-gradient(rgba(16, 25, 34, 0.7), rgba(16, 25, 34, 0.85)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAvrg76OoqUuwtsnZhovaESl6RBx22obbzLNJW3hDqhHrqke65ZiOG6jvNCRGnnQOiik4wopiX9wKgJllA3SsbXvjfJ-3PWQDOVOw7T9cmMjvo2EwPK6NxG9GHMM_wrAlcG22uKGBsRsW8NOsb6Vd27oOOOrx2ZNHKcCwSHTKbERXcA4wOv8Dsud8Nsy7aP09poqUtfQz4QXsWfa9LFJqMsNrIgCPUjcrJjXfMuo-MA3CCY5W3Gd2gtl7FLWC7Uu0MZG41DxwgA7nE")'}}>
          <div className="z-10 flex flex-col gap-4 max-w-3xl">
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.033em]">
              Bem-vindo ao Portal Educacional
            </h1>
            <p className="text-slate-200 text-base md:text-lg font-normal leading-relaxed mt-2">
              Acesso rápido, seguro e unificado aos recursos educacionais para alunos, pais, professores e gestores da rede municipal.
            </p>
          </div>
        </div>

        {/* Profiles Section */}
        <div className="flex flex-col gap-8 mb-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">Escolha o seu perfil de acesso</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Selecione abaixo para acessar os serviços e materiais específicos.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Estudantes Card */}
            <Link className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 h-[380px]" to="#">
              <div className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA8SgQLMHUyoC6R3xXUM00VEkRmErXDAKLtLX41jRUEUWs0hFVft6WPR0iyI0RrRpyoZmZVmaLbIPkjzyi-tHiTviS4paPsjl-fExcWZcs47ypUToQORIhclwr3xJ7hlkjg4rGU2Lv0bdk18fvyzvs0Mt-dmLmdvhhqK1wPgk3wsjJSmqw6U7w6ityMoCmztSwbrZ2YTHxmlUtPalwSx1p6vbIGr1fUnYd6QPq8k44s-6zkYTlS-X96gEe_JgKe1VysyMb4A9vVYEI")'}}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10 opacity-90"></div>
              <div className="relative z-20 flex flex-col h-full justify-end p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-md flex items-center justify-center mb-6 text-white border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <h3 className="text-white text-2xl font-bold leading-tight mb-2">Estudantes</h3>
                <p className="text-slate-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Materiais didáticos, atividades, notas e boletins online de forma simplificada.
                </p>
              </div>
            </Link>
            
            {/* Pais e Responsáveis Card */}
            <Link className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 h-[380px]" to="#">
              <div className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBCCxegX9l16tx3qT_jKDsPHdTtoGMdBoUgobHzDUyISJGsLWb1EvqsAOXzCeIdUsLuic45ChfxdvKbvomGmLFYoevGqTxfmTOX3kxosYuDHMJBRptpBhrOIq5UCr3qxq81d3CNCl7JaVDrzIAbZcXnPAVe2X5IZ_oD7pK8MK7a7EDOEIanHkU1Wkv9ChLk9QVi5kTpyL93fahadr5AhxbgeovVotPyBPmSZa2XfGs_RsoQWTvtbmyrlfzbuzcKUxlTP6-LiaWMNKw")'}}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10 opacity-90"></div>
              <div className="relative z-20 flex flex-col h-full justify-end p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-md flex items-center justify-center mb-6 text-white border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">family_restroom</span>
                </div>
                <h3 className="text-white text-2xl font-bold leading-tight mb-2">Pais e Responsáveis</h3>
                <p className="text-slate-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Acompanhamento escolar, comunicados diretos e controle de frequência.
                </p>
              </div>
            </Link>
            
            {/* Professores Card */}
            <Link className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 h-[380px]" to="#">
              <div className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDKlntHROANmahFo1zZR9k4ncohTemaAgcWN8FU3EW68kTTufKloaDen0cllSOL4C8bB1RNgKhmi1cy2KKBrMskmFPOp3w4aiRiHfYSRGNOGXH1TyX-H9mqOAFP5B48hNezM_rWS7QZWh6GZoKH0TyotfLujAMuas4bzCoey1QoWKAchgnz4MR2PEjGIEbrShwnHucoTn5I053GkJkgl5UkypTcRbdR3ryctbu-Yn08skKc70qgu9rjxTCaWf4uN_4tX5G1JEh9bdo")'}}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10 opacity-90"></div>
              <div className="relative z-20 flex flex-col h-full justify-end p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-md flex items-center justify-center mb-6 text-white border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">co_present</span>
                </div>
                <h3 className="text-white text-2xl font-bold leading-tight mb-2">Professores</h3>
                <p className="text-slate-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Lançamento de notas, diário de classe digital e planejamento escolar.
                </p>
              </div>
            </Link>
            
            {/* Gestores Card */}
            <Link className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 h-[380px]" to="/admin/login">
              <div className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4qAXwZ9fNnufoBbASuAIAA0mETyEhu1Bw3OGtidNWvS-ClPljwSjQes37KDWjn8Ke2EKs698eDZh5fWAIaHv2CudnSbks2QH2pmwz_McP0zx7qV6iNYlcKn08irwjDtUqVrZMOkJFbtw2rtRkBVvQosX0MJoS1wg-tbgs3wh4G95AXwau0r4hl5x9oXc16U8hqEtRP3-KOpGCkBGrsn5AnintqcKObXKPw_1h7wKbZ_ln8SaF79fz5RNxWb1zLeGmYl6hdCGn2jw")'}}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10 opacity-90"></div>
              <div className="relative z-20 flex flex-col h-full justify-end p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-md flex items-center justify-center mb-6 text-white border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">analytics</span>
                </div>
                <h3 className="text-white text-2xl font-bold leading-tight mb-2">Gestores</h3>
                <p className="text-slate-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Painéis de indicadores em tempo real, relatórios gerenciais e gestão documental.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
