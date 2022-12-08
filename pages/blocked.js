import React from 'react'
import Copyright from '../components/Copyright'

export default function Blocked() {
  
  return <>

    <div className="container mt-5">
      <div className="row">
        <div className="col-12 text-center">
          <img src="/logo-silberpfoten.png" alt="SilberPfoten Logo" style={{width:70}} />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12 text-center">
          <div className="fw-bold h3">Account gesperrt</div>
        </div>
      </div>
    </div>

    <div className="container mt-2">
      <div className="row mb-1">
        <div className="col-12 text-center">
          Dein Profil wurde gesperrt.
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12 text-center">
          <Copyright />
        </div>
      </div>
    </div>
  </>
}