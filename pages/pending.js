import React from 'react'
import Copyright from '../components/Copyright'
import Image from 'next/image'

export default function Pending() {
  
  return <>

    <div className="container mt-5">
      <div className="row">
        <div className="col-12 text-center">
          <Image src="/logo-silberpfoten.png" alt="SilberPfoten Logo" width="70" height="70" />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12 text-center">
          <div className="fw-bold h3">Warten auf Freischaltung</div>
        </div>
      </div>
    </div>

    <div className="container mt-2">
      <div className="row mb-1">
        <div className="col-12 text-center">
          Dein Profil wird überprüft. <br/>
          Sobald wir dich freigeschaltet haben, wirst du informiert.
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