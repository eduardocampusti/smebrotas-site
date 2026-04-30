import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './guards/ProtectedRoute'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

// Páginas públicas
import HomePage from './pages/public/HomePage'
import NoticiasPage from './pages/public/NoticiasPage'
import ContatoPage from './pages/public/ContatoPage'
import SobrePage from './pages/public/SobrePage'
import EscolasPage from './pages/public/EscolasPage'
import ServicosPage from './pages/public/ServicosPage'
import ProgramasPage from './pages/public/ProgramasPage'
import TransparenciaPage from './pages/public/TransparenciaPage'
import AtosOficiaisPage from './pages/public/AtosOficiaisPage'
import PortalPage from './pages/public/PortalPage'
import NoticiaDetalhePage from './pages/public/NoticiaDetalhePage'
import EscolaDetalhePage from './pages/public/EscolaDetalhePage'

import ServicoDetalhePage from './pages/public/ServicoDetalhePage'
import OuvidoriaPage from './pages/public/OuvidoriaPage'
import AcessoInformacaoPage from './pages/public/AcessoInformacaoPage'
import ProtecaoDadosPage from './pages/public/ProtecaoDadosPage'
import MapaSitePage from './pages/public/MapaSitePage'

// Páginas administrativas
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import HomeEditorPage from './pages/admin/HomeEditorPage'
import NoticiasListPage from './pages/admin/NoticiasListPage'
import NoticiaEditorPage from './pages/admin/NoticiaEditorPage'
import ContatoEditorPage from './pages/admin/ContatoEditorPage'
import EscolasEditorPage from './pages/admin/EscolasEditorPage'
import ConfigPage from './pages/admin/ConfigPage'
import SobreEditorPage from './pages/admin/SobreEditorPage'
import ServicosListPage from './pages/admin/ServicosListPage'
import ServicoEditorPage from './pages/admin/ServicoEditorPage'
import ProgramasListPage from './pages/admin/ProgramasListPage'
import ProgramaEditorPage from './pages/admin/ProgramaEditorPage'
import ProgramaDetalhePage from './pages/public/ProgramaDetalhePage'
import TransparenciaListPage from './pages/admin/TransparenciaListPage'
import ArquivoEditorPage from './pages/admin/ArquivoEditorPage'
import IndicadorEditorPage from './pages/admin/IndicadorEditorPage'
import TransparenciaFundebPage from './pages/admin/TransparenciaFundebPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre" element={<SobrePage />} />
            <Route path="/escolas" element={<EscolasPage />} />
            <Route path="/escolas/:slug" element={<EscolaDetalhePage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/servicos/:slug" element={<ServicoDetalhePage />} />
            <Route path="/noticias" element={<NoticiasPage />} />
            <Route path="/noticias/:slug" element={<NoticiaDetalhePage />} />
            <Route path="/programas" element={<ProgramasPage />} />
            <Route path="/programas/:slug" element={<ProgramaDetalhePage />} />
            <Route path="/transparencia" element={<TransparenciaPage />} />
            <Route path="/transparencia/atos-oficiais" element={<AtosOficiaisPage />} />
            <Route path="/contato" element={<ContatoPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/ouvidoria" element={<OuvidoriaPage />} />
            <Route path="/acesso-a-informacao" element={<AcessoInformacaoPage />} />
            <Route path="/lgpd" element={<ProtecaoDadosPage />} />
            <Route path="/mapa-do-site" element={<MapaSitePage />} />
          </Route>

          {/* Login (sem layout) */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Rotas Administrativas (protegidas) */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/home" element={<HomeEditorPage />} />
            <Route path="/admin/noticias" element={<NoticiasListPage />} />
            <Route path="/admin/noticias/nova" element={<NoticiaEditorPage />} />
            <Route path="/admin/noticias/:id" element={<NoticiaEditorPage />} />
            <Route path="/admin/escolas" element={<EscolasEditorPage />} />
            <Route path="/admin/contato" element={<ContatoEditorPage />} />
            <Route path="/admin/config" element={<ConfigPage />} />
            <Route path="/admin/sobre" element={<SobreEditorPage />} />
            <Route path="/admin/servicos" element={<ServicosListPage />} />
            <Route path="/admin/servicos/novo" element={<ServicoEditorPage />} />
            <Route path="/admin/servicos/:id" element={<ServicoEditorPage />} />
            <Route path="/admin/programas" element={<ProgramasListPage />} />
            <Route path="/admin/programas/novo" element={<ProgramaEditorPage />} />
            <Route path="/admin/programas/:id" element={<ProgramaEditorPage />} />
            <Route path="/admin/transparencia" element={<TransparenciaListPage />} />
            <Route path="/admin/transparencia/fundeb" element={<TransparenciaFundebPage />} />
            <Route path="/admin/transparencia/arquivo/novo" element={<ArquivoEditorPage />} />
            <Route path="/admin/transparencia/arquivo/:id" element={<ArquivoEditorPage />} />
            <Route path="/admin/transparencia/indicador/novo" element={<IndicadorEditorPage />} />
            <Route path="/admin/transparencia/indicador/:id" element={<IndicadorEditorPage />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  )
}
