export default function Error() {
  
  return <>
    <div className="container-fluid bg-primary vh-100">
      <div className="row align-items-center h-100">
        <div className="col-12 text-center">
          <i className="bi bi-emoji-frown text-white" style={{fontSize: 100}}></i>
          <div className="h1 text-white fw-normal">Ups, da ist etwas schief gelaufen</div>
          {/* <div className="h2 text-white fw-lighter">Bitte schliesse die App und öffne sie erneut.</div> */}
        </div>
      </div>
    </div>
  </>
}