import useSession from '../lib/auth/useSession'

export default function Header() {
  const {session} = useSession()
  const getCurrentHours = new Date().getHours()
  
  return <>
    <div className="container-fluid d-block d-md-none d-print-none bg-white border-bottom py-2 user-select-none">
      <div className="row align-items-center">
        {/* <div className="col-2">
          <div className="col-2 text-center"><i className="bi-person-circle text-primary" style={{fontSize: 30}}></i></div>
        </div> */}
        <div className="col-7">
          <span className="small"><i className="fas fa-hand-peace fa-fw me-1" />
            {getCurrentHours >= 5 && getCurrentHours <= 11 ? <>Moin,</> : null}
            {getCurrentHours >= 12 && getCurrentHours <= 13 ? <>Mahlzeit,</> : null}
            {getCurrentHours >= 14 && getCurrentHours <= 17 ? <>Hi,</> : null}
            {getCurrentHours >= 18 && getCurrentHours <= 22 ? <>N&apos;abend,</> : null}
            {getCurrentHours >= 22 && getCurrentHours <= 4 ? <>Hi,</> : null}
          </span>
          <span className="ms-1 small">{session?.user.firstname}</span>
        </div>
        <div className="col-3 text-end">
          {/* <i className="bi-person-circle text-primary" style={{fontSize: 30}}></i> */}
          {/* <img src="/images/logo-kitamia.svg" alt="Kitamia Logo" style={{width:50}} /> */}
        </div>
      </div>
    </div>
  </>
}