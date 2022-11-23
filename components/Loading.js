export default function Loading() {
  
  return <>
    <div className="container-fluid bg-primary vh-100">
      <div className="row align-items-center h-100">
        <div className="col-12 text-center">
          <div className="d-flex justify-content-center text-white">
            <div className="spinner-border" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <div className="h1 text-white fw-normal mt-3">Momentchen bitte ...</div>
        </div>
      </div>
    </div>
  </>
}