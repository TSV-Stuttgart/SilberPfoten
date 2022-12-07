import React, { useState } from 'react'
import useSWR, {useSWRConfig} from 'swr'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Wrapper from '../components/Wrapper'
import slugify from 'slugify'
import Link from 'next/link'
import Copyright from '../components/Copyright'

export default function Pending() {
  
  return <>
    {/* <Wrapper> */}

      <div className="container mt-3">
        <div className="row">
          <div className="col-12 text-center">
            <img src="/logo-silberpfoten.png" alt="SilberPfoten Logo" style={{width:70}} />
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


    {/* </Wrapper> */}
  </>
}