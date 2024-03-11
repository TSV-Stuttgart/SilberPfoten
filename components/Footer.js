import {useState} from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import {Offcanvas} from 'react-bootstrap'
import useSession from '../lib/auth/useSession'
import Copyright from './Copyright'

export default function Footer() {
  const router = useRouter()
  const {session} = useSession()
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const handleCloseOffcanvas = () => setShowOffcanvas(false)
  const handleShowOffcanvas = () => setShowOffcanvas(true)

  return <>
    <div className="container-fluid d-block d-md-none d-print-none bg-white fixed-bottom border-top py-2">
      <div className="row align-items-center">
        <div className="col text-center"><Link href="/"><i className={`${router.pathname === '/' ? 'bi-envelope-fill' : 'bi-envelope'} text-dark user-select-none`} style={{fontSize: 24}}></i></Link></div>
        <div className="col text-center"><i className="bi-list text-dark cursor-pointer user-select-none" style={{fontSize: 24}} onClick={handleShowOffcanvas}></i></div>
      </div>
    </div>

    <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="end">
      <Offcanvas.Header closeButton>
        <img src="/logo-silberpfoten.png" alt="SilberPfoten Logo" style={{width:50}} />
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="">
          <div className="mt-4">
            <Link href="/" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer"><i className={`${router.pathname === '/' ? 'bi-envelope-fill' : 'bi-envelope'} me-2`} style={{fontSize: 24}}></i><span>Neuigkeiten</span></div></Link>
            <Link href="/profile" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer"><i className={`${router.pathname === '/profile' ? 'bi-person-vcard-fill' : 'bi-person-vcard'} me-2`} style={{fontSize: 24}}></i><span>Meine Daten</span></div></Link>
            <Link href="https://silberpfoten.de/foerdern/spenden/" target="_blank" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer"><i className={`bi bi-box2-heart me-2`} style={{fontSize: 24}}></i><span>Spenden/Patenschaft</span></div></Link>
            <div className="text-secondary mt-4 border-top">
              <Link href="/signout" className="text-decoration-none"><div className="cursor-pointer text-secondary d-block h4 fw-light mt-3"><i className="bi bi-box-arrow-left me-2" style={{fontSize: 24}} /><span>Abmelden</span></div></Link>
            </div>

            {session?.user?.status === 'ADMIN' ? <>
              <div className="fw-bold mt-4">Administration</div>
              <Link href="/admin/users" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer mt-3"><i className={`${router.pathname === '/admin/users' ? 'bi-people-fill' : 'bi-people'} me-2`} style={{fontSize: 24}}></i><span>Benutzer</span></div></Link>
              <Link href="/admin/messages" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer mt-3"><i className={`${router.pathname === '/admin/messages' ? 'bi-envelope-fill' : 'bi-envelope'} me-2`} style={{fontSize: 24}}></i><span>Nachrichten</span></div></Link>
              <Link href="/admin/cases" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer mt-3"><i className={`${router.pathname === '/admin/cases' ? 'bi-megaphone-fill' : 'bi-megaphone'} me-2`} style={{fontSize: 24}}></i><span>Suchaufträge</span></div></Link>
            </> : null}
          </div>
          
          <div className="bg-light rounded-pill mt-5 py-2 px-3 cursor-pointer">
            <div className="row align-items-center">
              <div className="col-10">
                <div className="p text-muted">Angemeldet als</div>
                <div className="h4 fw-bold">{session?.user?.firstname} {session?.user?.lastname}</div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Copyright />
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  </>
}