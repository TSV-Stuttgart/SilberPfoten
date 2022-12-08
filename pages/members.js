import React, {useEffect, useState} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Wrapper from '../components/Wrapper'
import slugify from 'slugify'
import Link from 'next/link'

export default function Members() {
  const {mutate} = useSWRConfig()
  const [formFilter, setFormFilter] = useState('active')
  const {data: members, error} = useSWR(`/api/admin/members?filter=${formFilter}`, (url) => fetch(url).then(r => r.json()))
  const {data: pendingMembers, error: pendingError} = useSWR(`/api/admin/members?filter=pending`, (url) => fetch(url).then(r => r.json()))
  const {data: blockedMembers, error: blockedError} = useSWR(`/api/admin/members?filter=blocked`, (url) => fetch(url).then(r => r.json()))
  const {data: deactivatedMembers, error: deactivatedError} = useSWR(`/api/admin/members?filter=deactivated`, (url) => fetch(url).then(r => r.json()))

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  const handleActivation = async (memberId) => {
    await fetch(`/api/admin/member/activation?userId=${memberId}`)
  
    mutate(`/api/admin/members?filter=active`)
    mutate(`/api/admin/members?filter=pending`)
    mutate(`/api/admin/members?filter=blocked`)
    mutate(`/api/admin/members?filter=deactivated`)

    setFormFilter('active')
  }

  const handleDeactivation = async (memberId) => {
    await fetch(`/api/admin/member/deactivation?userId=${memberId}`)
  
    mutate(`/api/admin/members?filter=active`)
    mutate(`/api/admin/members?filter=pending`)
    mutate(`/api/admin/members?filter=blocked`)
    mutate(`/api/admin/members?filter=deactivated`)
  }

  const handleBlock = async (memberId) => {
    await fetch(`/api/admin/member/block?userId=${memberId}`)
  
    mutate(`/api/admin/members?filter=active`)
    mutate(`/api/admin/members?filter=pending`)
    mutate(`/api/admin/members?filter=blocked`)
    mutate(`/api/admin/members?filter=deactivated`)
  }

  const handleUnblock = async (memberId) => {
    await fetch(`/api/admin/member/unblock?userId=${memberId}`)
  
    mutate(`/api/admin/members?filter=active`)
    mutate(`/api/admin/members?filter=pending`)
    mutate(`/api/admin/members?filter=blocked`)
    mutate(`/api/admin/members?filter=deactivated`)
  }

  if (error) return <Error />
  if (!members && !error) return <Loading />
  if (!pendingMembers && !pendingError) return <Loading />
  if (!blockedMembers && !blockedError) return <Loading />
  if (!deactivatedMembers && !deactivatedError) return <Loading />
  
  return <>
    <Wrapper>

      <div className="container mt-3">
        <div className="row">
          <div className="col-4">
            <div className="fw-bold h3">Mitglieder</div>
          </div>
          <div className="col-8 text-end">
            <div className="fw-bold h3">
              <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className={`btn btn-light ${formFilter === 'active' ? 'active' : ''}`} onClick={() => setFormFilter('active')}>Aktive Mitglieder</button>
                <button type="button" className={`btn btn-light ${formFilter === 'pending' ? 'active' : ''}`} onClick={() => setFormFilter('pending')}>Nicht bestätigt {pendingMembers.length > 0 ? <span className="small bg-secondary text-white fw-bold rounded px-2">{pendingMembers.length}</span> : null}</button>
                <button type="button" className={`btn btn-light ${formFilter === 'deactivated' ? 'active' : ''}`} onClick={() => setFormFilter('deactivated')}>Deaktiviert</button>
                <button type="button" className={`btn btn-light ${formFilter === 'blocked' ? 'active' : ''}`} onClick={() => setFormFilter('blocked')}>Gesperrt</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {members?.length > 0 ? <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="bg-light rounded p-2">
                <div className="row">
                  <div className="col-1 border-end fw-bold">#</div>
                  <div className="col-3 border-end fw-bold">Name</div>
                  <div className="col-5 border-end fw-bold">Erfahrungen mit Tieren</div>
                  <div className="col-2 text-end fw-bold">Erstellt am</div>
                  <div className="col-1 text-end"></div>
                </div>
              </div>
            </div>
          </div>
          {members?.map(member => <div className="row" key={`${member.user_id}`}>
            <div className="col-12">
              <div className="px-2 py-1">
                <div className="row mb-1">
                  <div className="col-1">{member.user_id}</div>
                  <div className="col-3">
                    <Link href={`/member/${member.user_id}/${slugify(`${member.lastname}-${member.firstname}`, {lower: true})}`}>
                      <a className="text-secondary">{member.lastname}, {member.firstname}</a>
                    </Link>
                    {member.activated_at ? <i className="ms-1 bi bi-patch-check-fill text-secondary"></i> : null}
                  </div>
                  <div className="col-5 text-break">{member.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
                    {e === 'dog' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Hund</span> : null}
                    {e === 'cat' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Katze</span> : null}
                    {e === 'bird' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Vogel</span> : null}
                    {e === 'small_animal' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
                    {e === 'other' ? <span className="bg-light me-1 rounded px-2 small text-secondary">{member.experience_with_animal_other}</span> : null}
                  </React.Fragment>)}</div>
                  {/* // new Date(member.activated_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'}) : <>nein</>} */}
                  <div className="col-2 text-end">{new Date(member.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})}</div>
                  <div className="col-1 text-end">
                    <div className="dropdown">
                      <i className="bi bi-three-dots-vertical text-secondary cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false"></i>
                      <ul className="dropdown-menu">
                        {member.activated_at && !member.deactivated_at ? <>
                          <li><div className="dropdown-item cursor-pointer" onClick={() => handleDeactivation(member.user_id)}>Deaktivieren</div></li>
                          <li><div className="dropdown-item cursor-pointer" onClick={() => handleBlock(member.user_id)}>Sperren</div></li>
                        </> : null}
                        {!member.activated_at && !member.blocked_at ? <>
                          <li><div className="dropdown-item cursor-pointer" onClick={() => handleActivation(member.user_id)}>Aktivieren</div></li>
                          <li><div className="dropdown-item cursor-pointer" onClick={() => handleBlock(member.user_id)}>Ablehnen &amp; Sperren</div></li>
                        </> : null}
                        {member.blocked_at ? <>
                          <li><div className="dropdown-item cursor-pointer" onClick={() => handleUnblock(member.user_id)}>Sperre aufheben &amp; Aktivieren</div></li>
                        </> : null}
                        {member.deactivated_at ? <>
                          <div className="dropdown-item">Benutzer können sich selbst deaktivieren. Daher kann der Admin den Status nicht revidieren.</div>
                          {/* <li><div className="dropdown-item cursor-pointer" onClick={() => handleUnblock(member.user_id)}>Sperre aufheben &amp; Aktivieren</div></li> */}
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