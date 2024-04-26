import Footer from './Footer'
import AdminSidebar from './AdminSidebar'
import Header from './Header'
import FreestandingFooter from './FreestandingFooter'
import Navigation from './Navigation'

export default function AdminWrapper({children, sidebarOptions = null}) {

  return <>
    <Header />

    <div className="container-fluid vh-100">
      <div className="row">
        <div className={`d-none d-md-block col-md-4 col-lg-3 col-xl-2 border-start bg-light vh-100 overflow-auto d-print-none`}>
          <Navigation />
        </div>
        <div className={`col-12 ${sidebarOptions ? 'col-md-8 col-lg-6 col-xl-8' : 'col-md-8 col-lg-9 col-xl-10'} border-md-start vh-100 overflow-auto`}>
          <div className="px-xl-5 mx-xl-5">
            {children}

            <FreestandingFooter />
          </div>
        </div>
        {sidebarOptions ? <>
        <div className={`d-none d-md-block col-md-4 col-lg-3 col-xl-2 border-start vh-100 overflow-auto p-0 d-print-none`}>
          <AdminSidebar
            sidebarOptions={sidebarOptions}
          />
        </div>
        </> : null}
      </div>
    </div>

    <Footer />
  </>
}