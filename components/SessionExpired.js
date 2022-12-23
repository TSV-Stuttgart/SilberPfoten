import Link from "next/link"

export default function SessionExpired() {
  
  return <>
    <div className="container-fluid bg-primary vh-100">
      <div className="row align-items-center h-100">
        <div className="col-12 text-center">
          <i className="bi bi-hourglass-bottom text-white" style={{fontSize: 100}}></i>
          <div className="h1 text-white fw-normal">Deine Sitzung ist abgelaufen!</div>
          <div className="h2 text-white fw-lighter">Bitte melde dich neu an.</div>
          <Link href="signin"><div className="mt-4 h2 text-white h2 fw-lighter cursor-pointer">Anmelden</div></Link>
        </div>
      </div>
    </div>
  </>
}