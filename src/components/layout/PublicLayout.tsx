import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function PublicLayout() {
  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
