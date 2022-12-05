import React from 'react'
import Footer from './Footer'
import Header from './Header'
import Navigation from './Navigation'
import Link from 'next/link'

export default function Wrapper({children}) {

  return <React.Fragment>
    <Header />

    <div className="container">
      <div className="row">
        <div className="col-12 col-md-2 col-lg-3 d-none d-md-block text-md-center text-lg-start"><Navigation /></div>
        <div className="col-12 col-md-10 col-lg-9 border-md-start">
            <div className="row"> {/* Dieser Hack ist da, um die Breite auf 100% zu bekommen ".container > row > col > row > container (children) "*/}
              {children}
            </div>
          <div style={{marginTop: 100}}>&nbsp;</div>
        </div>
      </div>
    </div>

    <Footer />
  </React.Fragment>
}