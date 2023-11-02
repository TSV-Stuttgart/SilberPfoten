import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import FreestandingFooter from '../components/FreestandingFooter'
import FreestandingHeader from '../components/FreestandingHeader'

export async function getServerSideProps(context) {

  return {
    props: {
      query: context.query,
    }
  }
}

export default function Newsletter({query}) {
  const {token} = query

  const [tokenHandling, setTokenHandling] = useState(false)
  const [noticeText, setNoticeText] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  if (!token) {
    return <Error 
      icon={<i className="bi bi-exclamation-triangle-fill text-white" style={{fontSize: 100}} />}
      title={<span className="text-uppercase">Kein Token angegeben</span>}
      description={<span>Der Link ist leider nicht mehr gültig. <Link href="/"><a>Zurück zur Startseite</a></Link></span>}
      reload={false}
    />
  }

  const deleteUserNewsletter = async () => {

    setTokenHandling(true)

    const deleteUserNewsletterRequest = await fetch(`/api/deactivateNewsletter?token=${token}`, {method: 'DELETE'})

    if (deleteUserNewsletterRequest.status === 200) {
      setSuccess(true)
      setTokenHandling(false)
      setNoticeText('Erfolgreich von Newsletter abgemeldet und Account gelöscht')
    }
    else {
      setError(true)
      setTokenHandling(false)
      setNoticeText('Etwas ist schief gelaufen')
    }
  }

  if (tokenHandling) return <Loading />

  if (success) {
    return <Notice 
        icon={<i className="bi bi-patch-exclamation-fill text-white" style={{fontSize: 100}} />}
        title={<span className="text-uppercase">{noticeText}</span>}
        description={<span></span>}
        reload={false}
        hrefTitle={<>&laquo; zurück zur Startseite</>}
        href={"/"}
      />
  }

  if (error) {
    return <Error 
      icon={<i className="bi bi-exclamation-triangle-fill text-white" style={{fontSize: 100}} />}
      title={<span className="text-uppercase">Ups etwas ist schief gelaufen</span>}
      description={''}
      reload={false}
    />
  }

  return (
    <>
      <FreestandingHeader />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4 text-right">
            <div className="fw-bold h4 mt-4">Für eine Abmeldung vom Newsletter ist es nötig, deinen Account vollständig zu löschen. Möchtest du das tun?</div>
            <button className="btn btn-primary w-100 mt-4" onClick={() => deleteUserNewsletter()}>Von Newsletter abmelden und Account unwiderruflich löschen</button>
          </div>
        </div>
      </div>

      <FreestandingFooter />
    </>
  )
}