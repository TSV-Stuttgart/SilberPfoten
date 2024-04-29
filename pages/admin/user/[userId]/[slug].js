import React from 'react'
import useSWR from 'swr'
import {useRouter} from 'next/router'
import Error from '../../../../components/Error'
import Loading from '../../../../components/Loading'
import AdminWrapper from '../../../../components/AdminWrapper'
import NavigationHeader from '../../../../components/NavigationHeader'
import useSession from '../../../../lib/auth/useSession'

export default function Members({userId}) {
  const router = useRouter()
  const {session} = useSession()
  const {data: member, error} = useSWR(router.query.userId ? `/api/admin/user/${router.query.userId}` : null, (url) => fetch(url).then(r => r.json()))

  if (error) return <Error />
  if (!member && !error) return <Loading />

  if (!session) {
    router.push('/signin')

    return
  }
  
  return <>
    <AdminWrapper>

      <NavigationHeader 
        goBack={`/admin/users`} 
        title={`Benutzer`}
      />

      <div className="container mt-3">
        <div className="row">
          <div className="col">
            <div className="fw-bold h3">{member.lastname}, {member.firstname}</div>
          </div>
        </div>
      </div>

      <div className="container mt-2">
        <div className="row">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Nachname</span>
            <span className="bg-light px-2 rounded">Vorname</span>
          </div>
          <div className="col-12 p">{member.lastname}, {member.firstname}</div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Geschlecht</span>
          </div>
          <div className="col-12 p">{member.gender}</div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">E-Mail</span>
          </div>
          <div className="col-12 p"><a href={`mailto:${member.email}`}>­{member.email}</a></div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Geburtsdatum</span>
          </div>
          <div className="col-12 p">{member.birthdate}</div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Telefon</span>
          </div>
          <div className="col-12 p">{member.phone}</div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Mobil</span>
          </div>
          <div className="col-12 p">{member.mobile || "-"}</div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Anschrift</span>
          </div>
          <div className="col-12 p">{member.street} {member.street_number}, {member.zipcode} {member.city}</div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Job</span>
          </div>
          <div className="col-12 p">{member.job}</div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Erfahrungen mit Tieren</span>
          </div>
          <div className="col-12 p text-break">{member.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
            {e === 'dog' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Hund</span> : null}
            {e === 'cat' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Katze</span> : null}
            {e === 'bird' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Vogel</span> : null}
            {e === 'small_animal' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
            {e === 'other' ? <span className="bg-light me-1 rounded px-2 small text-secondary">{member.experience_with_animal_other}</span> : null}
          </React.Fragment>)}</div>
        </div>
        <div className="row mt-2">
          <div className="col-12 small">
            <span className="bg-light px-2 rounded me-1">Angebotene Tätigkeiten</span>
          </div>
          <div className="col-12 p text-break">{member.support_activity?.split(',').map(e => <React.Fragment key={e}>
            {e === 'go_walk' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Gassi gehen</span> : null}
            {e === 'veterinary_trips' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Tierarztfahrten</span> : null}
            {e === 'animal_care' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Hilfe bei der Tierpflege</span> : null}
            {e === 'events' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Hilfe bei Veranstaltungen</span> : null}
            {e === 'baking_cooking' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Backen und Kochen</span> : null}
            {e === 'creative_workshop' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Kreativworkshops</span> : null}
            {e === 'public_relation' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Öffentlichkeitsarbeit</span> : null}
            {e === 'light_office_work' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Leichte Büroarbeiten</span> : null}
            {e === 'graphic_work' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Grafische Arbeiten</span> : null}
          </React.Fragment>)}</div>
        </div>
      </div>

      {member?.length > 0 ? <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="bg-light rounded p-2">
                <div className="row">
                  <div className="col-1 border-end fw-bold">#</div>
                  <div className="col-3 border-end fw-bold">Name</div>
                  <div className="col-5 border-end fw-bold">Erfahrungen mit Tieren</div>
                  <div className="col-1 text-center fw-bold">Aktiv</div>
                  <div className="col-2 text-end fw-bold">Erstellt am</div>
                </div>
              </div>
            </div>
          </div>
          {members?.map(member => <div className="row" key={`${member.user_id}`}>
            <div className="col-12">
              <div className="px-2 py-1">
                <div className="row mb-1">
                  <div className="col-1">{member.user_id}</div>
                  <div className="col-3">{member.lastname}, {member.firstname}</div>
                  <div className="col-5 text-break">{member.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
                    {e === 'dog' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Hund</span> : null}
                    {e === 'cat' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Katze</span> : null}
                    {e === 'bird' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Vogel</span> : null}
                    {e === 'small_animal' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
                    {e === 'other' ? <span className="bg-light me-1 rounded px-2 small text-secondary">{member.experience_with_animal_other}</span> : null}
                  </React.Fragment>)}</div>
                  <div className="col-1 text-center">{member.activated_at ? <i className="bi bi-patch-check-fill text-secondary"></i> : null}</div>
                  <div className="col-2 text-end">{new Date(member.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})}</div>
                </div>
              </div>
            </div>
          </div>)}
        </div>
      </> : null}

    </AdminWrapper>
  </>
}