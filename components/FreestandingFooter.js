import Link from 'next/link'

export default function FreestandingFooter() {
  
  return <>
    <div className="container mt-4">
      <div className="row justify-content-center mt-5">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="text-center mt-5">
            <div className="small text-muted">
              Stolz <i className="bi bi-heart-fill text-danger" /> präsentiert von <Link href="https://www.silberpfoten.de">SilberPfoten</Link>
            </div>
            <div className="small text-muted"><Link href="https://silberpfoten.de/datenschutz">Datenschutz</Link> &bull; <Link href="https://silberpfoten.de/impressum">Impressum</Link></div>
            <div className="small text-muted">Version: {process.env.NEXT_PUBLIC_VERSION}</div>
          </div>
        </div>
      </div>
    </div>
  </>
}