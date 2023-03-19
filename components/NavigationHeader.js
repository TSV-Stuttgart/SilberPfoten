import Link from 'next/link'

export default function NavigationHeader({goBack, title}) {  
  return <>
    <div className="container-fluid bg-white border-bottom py-2 d-print-none">
      <div className="row align-items-center">
        <div className="col-2 col-md-1 text-start">
          <Link href={goBack}><i className="bi bi-arrow-left-short" style={{fontSize: 28}}></i></Link>
        </div>
        <div className="col-10 col-md-11 text-start"><span className="fw-bold h3">{title}</span></div>
        {/* <div className="col-2 text-end"><i className="bi bi-three-dots-vertical" style={{fontSize: 24}}></i></div> */}
      </div>
    </div>
  </>
}