import useSession from '../lib/auth/useSession'
import {useRouter} from 'next/router'
import Link from 'next/link'
import Copyright from './Copyright'
import Image from 'next/image'

export default function Navigation() {
  const router = useRouter()
  const {session} = useSession()
  const isAdmin = session?.user?.status === 'ADMIN' ? true : false

  return <>

    <div className="mt-4 d-none d-md-block">
      <Image src="/logo-silberpfoten.png" alt="SilberPfoten Logo" width="70" height="70" />
      <div className="mt-4">
        <Link href="/" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer"><i className={`${router.pathname === '/' ? 'bi-envelope-fill' : 'bi-envelope'} me-2`} style={{fontSize: 24}}></i><span className="d-none d-lg-inline">Neuigkeiten</span></div></Link>
        <Link href="/profile" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer"><i className={`${router.pathname === '/profile' ? 'bi-person-vcard-fill' : 'bi-person-vcard'} me-2`} style={{fontSize: 24}}></i><span className="d-none d-lg-inline">Meine Daten</span></div></Link>
        <Link href="https://silberpfoten.de/foerdern/spenden/" target="_blank" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer"><i className={`bi bi-box2-heart me-2`} style={{fontSize: 24}}></i><span className="d-none d-lg-inline">Spenden/Patenschaft</span></div></Link>
        <div className="text-secondary mt-4 border-top">
          <Link href="/signout" className="text-decoration-none"><div className="cursor-pointer text-secondary d-block h4 fw-light mt-3"><i className="bi bi-box-arrow-left me-2" style={{fontSize: 24}} /><span className="d-none d-lg-inline">Abmelden</span></div></Link>
        </div>

        {session?.user?.status === 'ADMIN' ? <>
          <div className="fw-bold mt-4">Administration</div>
          <Link href="/admin/users" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer mt-3"><i className={`${router.pathname === '/admin/users' ? 'bi-people-fill' : 'bi-people'} me-2`} style={{fontSize: 24}}></i><span className="d-none d-lg-inline">Benutzer</span></div></Link>
          <Link href="/admin/messages" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer mt-3"><i className={`${router.pathname === '/admin/messages' ? 'bi-envelope-fill' : 'bi-envelope'} me-2`} style={{fontSize: 24}}></i><span className="d-none d-lg-inline">Nachrichten</span></div></Link>
          <Link href="/admin/cases" className="text-decoration-none"><div className="text-dark d-block h4 fw-light cursor-pointer mt-3"><i className={`${router.pathname === '/admin/cases' ? 'bi-megaphone-fill' : 'bi-megaphone'} me-2`} style={{fontSize: 24}}></i><span className="d-none d-lg-inline">Suchaufträge</span></div></Link>
        </> : null}

      </div>
      
      <div className="d-none d-lg-block bg-light rounded-pill mt-5 py-2 px-3 cursor-pointer">
        <div className="row align-items-center">
          <div className="col-10">
            <div className="p text-muted">Angemeldet als</div>
            <div className="h4 fw-bold">{session?.user?.firstname} {session?.user?.lastname}</div>
          </div>
        </div>
      </div>
      
      <div className="d-none d-lg-block mt-4 py-2 px-3">
        <div className="row">
          <div className="col-12">
            <Copyright />
          </div>
        </div>
      </div>

    </div>
  </>
}