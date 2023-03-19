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

  const isAdmin = session?.user?.status === 'ADMIN' ? true : false

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
          <Link href="/" className="text-decoration-none"><div className="text-dark d-block h4 fw-light"><i className={`${router.pathname === '/' ? 'bi-envelope-fill' : 'bi-envelope'} me-2`} style={{fontSize: 24}}></i>Neuigkeiten</div></Link>
          <Link href="/profile" className="text-decoration-none"><div className="text-dark d-block h4 fw-light"><i className={`${router.pathname === '/profile' ? 'bi-person-vcard-fill' : 'bi-person-vcard'} me-2`} style={{fontSize: 24}}></i>Meine Daten</div></Link>
          <div className="text-secondary mt-4 pt-3 border-top">
            {/* {isAdmin ? <>
              <Link href="/helpers" className="text-decoration-none"><div className="mt-3 text-dark d-block h4 fw-light"><i className={`${router.pathname === '/helpers' ? 'bi bi-person-heart' : 'bi bi-person-heart'} me-2`} style={{fontSize: 24}} />Helfer</div></Link>
            </> : null} */}
            <Link href="/signout" className="text-secondary"><div className="d-block h4 fw-light text-decoration-none mt-3 cursor-pointer"><i className="bi bi-box-arrow-left me-2" />Abmelden</div></Link>
          </div>
          <div className="mt-3">
            <Copyright />
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  </>
}