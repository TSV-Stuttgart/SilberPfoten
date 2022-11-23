import FreestandingFooter from '../../../../components/FreestandingFooter'
import FreestandingHeader from '../../../../components/FreestandingHeader'
import Link from 'next/link'

export default function SignupVerifyErrorExpired() {
  
  return (<>
  
    <FreestandingHeader />

    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <div className="">
            <div className="p fw-bold">Verifizierungscode abgelaufen</div>
            <div className="p mt-2">Dein Verifizierungscode ist abgelaufen. <br/>Registriere dich erneut und gebe den Verifizierungscode ein.</div>
            <Link href="/signup"><a className="btn btn-primary mt-4">Noch ein Versuch ...</a></Link>
          </div>
        </div>
      </div>
    </div>

    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <Link href="/"><a className="p">Registrierung abbrechen</a></Link>
        </div>
      </div>
    </div>

    <FreestandingFooter />

  </>)
}