import React from 'react'
import Link from 'next/link'

export default function UserListElement({id, name, status, animals, animalsOther, activities, phone, email, adress, targetHref, navigationElements}) {

  return <>
    <div className="container" id={id}>
      <div className="row">
        <div className="col-12">
          <div className="px-1 py-2 border-bottom">
            <div className="row">
              <div className="col-10">
                <div className="fw-bold">
                  <Link href={targetHref} className="text-secondary text-decoration-none">
                    <span><span className="text-muted">#{id}</span> {name}</span>
                  </Link>
                  {status === 'ADMIN' ? <i className="bi bi-person-fill-gear ms-1" style={{fontSize: 16}}></i> : null}
                </div>
                <div className="ps-3 mt-1">
                  <span className="">
                    {adress ? <span className="fw-normal"><i className="bi bi-geo-alt me-1"></i> {adress}</span> : null}
                  </span>
                </div>
                <div className="ps-3">
                  <span className="">
                    {email ? <span className="fw-normal"><i className="bi bi-envelope me-1"></i> {email}</span> : null}
                  </span>
                </div>
                <div className="ps-3">
                  <span className="">
                    {phone ? <span className="fw-normal"><i className="bi bi-telephone me-1"></i> {phone}</span> : null}
                  </span>
                </div>
                <div className="ps-3 mt-1">
                  {animals?.split(',').map(e => <React.Fragment key={e}>
                    {e === 'dog' ? <span className="bg-primary me-1 rounded px-2 small text-secondary">Hund</span> : null}
                    {e === 'cat' ? <span className="bg-primary me-1 rounded px-2 small text-secondary">Katze</span> : null}
                    {e === 'bird' ? <span className="bg-primary me-1 rounded px-2 small text-secondary">Vogel</span> : null}
                    {e === 'small_animal' ? <span className="bg-primary me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
                    {e === 'other' ? <span className="bg-primary me-1 rounded px-2 small text-secondary">{animalsOther}</span> : null}
                  </React.Fragment>)}
                </div>
                <div className="d-flex flex-wrap ps-3">
                  {activities?.split(',').map(e => <React.Fragment key={e}>
                    {e === 'go_walk' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Gassi gehen</span> : null}
                    {e === 'veterinary_trips' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Tierarztfahrten</span> : null}
                    {e === 'animal_care' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Hilfe bei der Tierpflege</span> : null}
                    {e === 'events' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Hilfe bei Veranstaltungen</span> : null}
                    {e === 'baking_cooking' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Backen und Kochen</span> : null}
                    {e === 'creative_workshop' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Kreativworkshops</span> : null}
                    {e === 'public_relation' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Öffentlichkeitsarbeit</span> : null}
                    {e === 'light_office_work' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Leichte Büroarbeiten</span> : null}
                    {e === 'graphic_work' ? <span className="bg-info me-1 mt-1 rounded px-2 small text-secondary text-nowrap">Grafische Arbeiten</span> : null}
                  </React.Fragment>)}
                </div>
              </div>
              <div className="col-2 text-end">
                {navigationElements?.length > 0 ? <>
                  <i className="bi bi-three-dots-vertical text-secondary cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false"></i>
                  <div className="dropdown">
                    <ul className="dropdown-menu">
                      {navigationElements.filter(el => el)?.map(navigation => <React.Fragment key={navigation.title}>
                        {navigation.href && !navigation.onClick ? <li><Link href={navigation.href} title={navigation.title} className="dropdown-item cursor-pointer">{navigation.title}</Link></li> : null}
                        {navigation.onClick && !navigation.href ? <li><div className="dropdown-item cursor-pointer" title={navigation.title} onClick={navigation.onClick}>{navigation.title}</div></li> : null}
                      </React.Fragment>)}
                    </ul>
                  </div>
                </> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}