import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import useSWR, {useSWRConfig} from 'swr'
import Error from '../../components/Error'
import Loading from '../../components/Loading'
import Wrapper from '../../components/Wrapper'
import slugify from 'slugify'
import Link from 'next/link'
import useSession from '../../lib/auth/useSession'

export default function Users() {
  const {mutate} = useSWRConfig()
  const {session} = useSession()
  const router = useRouter()
  const [formFilter, setFormFilter] = useState('active')
  const {data: users, error} = useSWR(`/api/admin/users?filter=${formFilter}`, (url) => fetch(url).then(r => r.json()))
  const {data: pendingUsers, error: pendingError} = useSWR(`/api/admin/users?filter=pending`, (url) => fetch(url).then(r => r.json()))
  const {data: blockedUsers, error: blockedError} = useSWR(`/api/admin/users?filter=blocked`, (url) => fetch(url).then(r => r.json()))
  const {data: deactivatedUsers, error: deactivatedError} = useSWR(`/api/admin/users?filter=deactivated`, (url) => fetch(url).then(r => r.json()))

  const [usersSortOrder, setUsersSortOrder] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  const handleActivation = async (userId) => {
    await fetch(`/api/admin/user/activation?userId=${userId}`)
  
    mutate(`/api/admin/users?filter=active`)
    mutate(`/api/admin/users?filter=pending`)
    mutate(`/api/admin/users?filter=blocked`)
    mutate(`/api/admin/users?filter=deactivated`)

    setFormFilter('active')
  }

  const handleDeactivation = async (userId) => {
    await fetch(`/api/admin/user/deactivation?userId=${userId}`)
  
    mutate(`/api/admin/users?filter=active`)
    mutate(`/api/admin/users?filter=pending`)
    mutate(`/api/admin/users?filter=blocked`)
    mutate(`/api/admin/users?filter=deactivated`)
  }

  const handleBlock = async (userId) => {
    await fetch(`/api/admin/user/block?userId=${userId}`)
  
    mutate(`/api/admin/users?filter=active`)
    mutate(`/api/admin/users?filter=pending`)
    mutate(`/api/admin/users?filter=blocked`)
    mutate(`/api/admin/users?filter=deactivated`)
  }

  const handleUnblock = async (userId) => {
    await fetch(`/api/admin/user/unblock?userId=${userId}`)
  
    mutate(`/api/admin/users?filter=active`)
    mutate(`/api/admin/users?filter=pending`)
    mutate(`/api/admin/users?filter=blocked`)
    mutate(`/api/admin/users?filter=deactivated`)
  }

  const handleDelete = async (userId) => {
    const confirmed = confirm('Soll der Benutzer wirklich gelöscht werden?')

    if (confirmed) {

      await fetch(`/api/admin/user/delete?userId=${userId}`)
    
      mutate(`/api/admin/users?filter=active`)
      mutate(`/api/admin/users?filter=pending`)
      mutate(`/api/admin/users?filter=blocked`)
      mutate(`/api/admin/users?filter=deactivated`)
    }
  }

  const exportUsersAsCSV = () => {

    const csv = users.map(user => {
      return `${user.user_id};${user.firstname};${user.lastname};${user.email};${user.zipcode};${user.city};${user.experience_with_animal};${user.experience_with_animal_other};${user.activated_at};${user.blocked_at};${user.deactivated_at}`
    }).join('\n')

    let csvContent = "data:text/csv;charset=utf-8," 

    csvContent += 'ID;Vorname;Nachname;E-Mail;PLZ;Ort;Erfahrungen mit Tieren;Erfahrungen mit Tieren (andere);Aktiviert am;Gesperrt am;Deaktiviert am\n'
    csvContent += csv

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "mitglieder.csv")
    document.body.appendChild(link)
    link.click()
  }

  if (error) return <Error />
  if (!users && !error) return <Loading />
  if (!pendingUsers && !pendingError) return <Loading />
  if (!blockedUsers && !blockedError) return <Loading />
  if (!deactivatedUsers && !deactivatedError) return <Loading />

  if (!session) {
    router.push('/signin')

    return
  }
  
  return <>
  
    <Wrapper>

      <div className="container mt-3">
        <div className="row">
          <div className="col-12 col-md-4">
            <div className="fw-bold h3">Mitglieder</div>
          </div>
          <div className="col-12 col-md-8 text-end">
            <div className="fw-bold h3">
              <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className={`btn btn-light ${formFilter === 'active' ? 'active' : ''}`} onClick={() => setFormFilter('active')}>Aktive Mitglieder</button>
                <button type="button" className={`btn btn-light ${formFilter === 'pending' ? 'active' : ''}`} onClick={() => setFormFilter('pending')}>Nicht bestätigt {pendingUsers.length > 0 ? <span className="small bg-secondary text-white fw-bold rounded px-2">{pendingUsers.length}</span> : null}</button>
                <button type="button" className={`btn btn-light ${formFilter === 'deactivated' ? 'active' : ''}`} onClick={() => setFormFilter('deactivated')}>Deaktiviert</button>
                <button type="button" className={`btn btn-light ${formFilter === 'blocked' ? 'active' : ''}`} onClick={() => setFormFilter('blocked')}>Gesperrt</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
          <div className="col-6">
            <input type="text" className="form-control" placeholder="Suchen" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="col-6">
            <select className="form-select" onChange={(e) => setUsersSortOrder(e.target.value)}>
              <option value="">Sortieren nach</option>
              <option value="firstnameAsc">Vorname aufsteigend</option>
              <option value="firstnameDesc">Vorname absteigend</option>
              <option value="lastnameAsc">Nachname aufsteigend</option>
              <option value="lastnameDesc">Nachname absteigend</option>
              <option value="zipAsc">PLZ aufsteigend</option>
              <option value="zipDesc">PLZ absteigend</option>
              <option value="locationAsc">Ort aufsteigend</option>
              <option value="locationDesc">Ort absteigend</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
          <div className="col-12 text-end">
            <button type="button" className={`btn btn-light`} onClick={() => exportUsersAsCSV()}>
              <i class="bi bi-filetype-csv"></i>
              <span className="ps-1">CSV Export</span>
            </button>
          </div>
        </div>
      </div>

      {users?.length > 0 ? <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="bg-light rounded p-2">
                <div className="row">
                  <div className="col-1 border-end fw-bold">#</div>
                  <div className="col-3 border-end fw-bold">Name</div>
                  <div className="col-5 border-end fw-bold">Erfahrungen mit Tieren</div>
                  <div className="col-2 fw-bold">Adresse</div>
                  <div className="col-1 text-end"></div>
                </div>
              </div>
            </div>
          </div>
          {users?.sort((a,b) => {
            if (usersSortOrder === 'firstnameAsc') { if (b.firstname < a.firstname) { return 1 } else { return -1 } }
            else if (usersSortOrder === 'firstnameDesc') { if (b.firstname > a.firstname) { return 1 } else { return -1 } }
            else if (usersSortOrder === 'lastnameAsc') { if (b.lastname < a.lastname) { return 1 } else { return -1 } }
            else if (usersSortOrder === 'lastnameDesc') { if (b.lastname > a.lastname) { return 1 } else { return -1 } }
            else if (usersSortOrder === 'zipAsc') { if (b.zipcode < a.zipcode) { return 1 } else { return -1 } }
            else if (usersSortOrder === 'zipDesc') { if (b.zipcode > a.zipcode) { return 1 } else { return -1 } }
            else if (usersSortOrder === 'locationAsc') { if (b.city < a.city) { return 1 } else { return -1 } }
            else if (usersSortOrder === 'locationDesc') { if (b.city > a.city) { return 1 } else { return -1 } }
          })?.map(user => <div className="row" key={user.user_id}>
            <div className="col-12">
              <div className="px-2 py-1">
                <div className="row mb-1">
                  <div className="col-1">{user.user_id}</div>
                  <div className="col-3">
                    <Link href={`/admin/user/${user.user_id}/${slugify(`${user.lastname}-${user.firstname}`, {lower: true})}`}>
                      <div className="text-secondary">{user.lastname}, {user.firstname} {user.status === 'ADMIN' ? <i className="bi bi-person-fill-gear ms-1" style={{fontSize: 16}}></i> : null}</div>
                    </Link>
                    {/* {user.activated_at ? <i className="ms-1 bi bi-patch-check-fill text-secondary"></i> : null} */}
                  </div>
                  <div className="col-5 text-break">{user.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
                    {e === 'dog' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Hund</span> : null}
                    {e === 'cat' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Katze</span> : null}
                    {e === 'bird' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Vogel</span> : null}
                    {e === 'small_animal' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
                    {e === 'other' ? <span className="bg-light me-1 rounded px-2 small text-secondary">{user.experience_with_animal_other}</span> : null}
                  </React.Fragment>)}</div>
                  {/* // new Date(user.activated_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'}) : <>nein</>} */}
                  <div className="col-2">
                    {user.zipcode} {user.city}
                    {/* {new Date(user.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})} */}
                  </div>
                  <div className="col-1 text-end">
                      <div className="dropdown">
                        <i className="bi bi-three-dots-vertical text-secondary cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false"></i>
                        <ul className="dropdown-menu">
                          {user.activated_at && !user.deactivated_at ? <>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleDeactivation(user.user_id)}>Deaktivieren</div></li>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleBlock(user.user_id)}>Sperren</div></li>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleDelete(user.user_id)}>Löschen</div></li>
                          </> : null}
                          {!user.activated_at && !user.blocked_at ? <>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleActivation(user.user_id)}>Aktivieren</div></li>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleBlock(user.user_id)}>Ablehnen &amp; Sperren</div></li>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleDelete(user.user_id)}>Löschen</div></li>
                          </> : null}
                          {user.blocked_at ? <>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleUnblock(user.user_id)}>Sperre aufheben &amp; Aktivieren</div></li>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleDelete(user.user_id)}>Löschen</div></li>
                          </> : null}
                          {user.deactivated_at ? <>
                            <div className="dropdown-item">Benutzer können sich selbst deaktivieren. Daher kann der Admin den Status nicht revidieren.</div>
                            <li><div className="dropdown-item cursor-pointer" onClick={() => handleDelete(user.user_id)}>Löschen</div></li>
                            {/* <li><div className="dropdown-item cursor-pointer" onClick={() => handleUnblock(user.user_id)}>Sperre aufheben &amp; Aktivieren</div></li> */}
                          </> : null}
                        </ul>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>)}
        </div>
      </> : <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="p">Keine weiteren Einträge</div>
            </div>
          </div>
        </div>
      </>}

    </Wrapper>
  </>
}