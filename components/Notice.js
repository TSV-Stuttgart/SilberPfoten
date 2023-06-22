import Link from 'next/link'
import {useRouter} from 'next/router'

export default function Notice({icon, title, description, href, hrefTitle, reload}) {
  const router = useRouter()

  return <>
    <div className="container-fluid bg-primary vh-100">
      <div className="row align-items-center h-100">
        <div className="col-12 text-center">
          {icon ? icon : <i className="bi bi-heartbreak text-white" style={{fontSize: 100}} />}
          <div className="h1 text-white fw-normal">{title}</div>
          <div className="h2 text-white fw-lighter">{description}</div>
          {reload ? <div className="mt-4 h2 d-block text-white fw-lighter"><div onClick={() => window.location = window.location.href.split('?')[0]} className="text-white fw-lighter cursor-pointer text-decoration-underline">{hrefTitle}</div></div> : null}
          {href ? <div className="mt-4 h2 d-block text-white fw-lighter"><Link className="text-white fw-lighter cursor-pointer" href={href}>{hrefTitle}</Link></div> : null}
          {!href && !reload ? <div className="mt-4 h2 text-white fw-lighter cursor-pointer" onClick={() => router.back()}>&laquo; zurück</div> : null}
        </div>
      </div>
    </div>
  </>
}