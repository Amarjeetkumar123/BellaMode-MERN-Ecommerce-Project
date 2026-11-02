import './App.css'
import './styles/storefront.css'
import './styles/pages.css'
import './styles/account.css'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnnouncementBar from './components/AnnouncementBar'
import { PageLoader, TopLoader } from './components/Loaders'

function App() {
  const { pathname } = useLocation()
  // the dashboard keeps one wrapper so its side nav doesn't fade on every click
  const area = pathname.startsWith('/dashboard') ? '/dashboard' : pathname
  return (
    <>
      <TopLoader />
      <AnnouncementBar />
      <Navbar />
      <div className='wf-route' key={area}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </>
  )
}

export default App
