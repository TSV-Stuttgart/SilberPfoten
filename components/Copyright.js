import Link from 'next/link'

export default function Copyright() {
  
  return <>
    <div className="small text-muted">
      Stolz <i className="bi bi-heart-fill text-danger" /> präsentiert von <Link href="https://www.silberpfoten.de"><a href="https://www.silberpfoten.de">SilberPfoten</a></Link><br/>
      Eine Initiative vom Tierschutzverein Stuttgart und Umgebung e.V.
    </div>
    <div className="small text-muted mt-2"><Link href="https://silberpfoten.de/datenschutz"><a>Datenschutz</a></Link> &bull; <Link href="https://silberpfoten.de/impressum"><a>Impressum</a></Link></div>
    <div className="small text-muted">Version: {process.env.NEXT_PUBLIC_VERSION}</div>
  </>
}