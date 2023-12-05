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
  const {data: users, error} = useSWR(`/api/admin/users?filter=newsletter`, (url) => fetch(url).then(r => r.json()))
  
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false)
  const [isSendingNewsletterTo, setIsSendingNewsletterTo] = useState('')
  const [success, setSuccess] = useState('')
  const [updateCounter, setUpdateCounter] = useState('')
  const [pauseSending, setPauseSending] = useState(false)
  const [weAreBlocked, setWeAreBlocked] = useState(false)
  const [filter, setFilter] = useState('without_bounce')

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  if (error) return <Error />
  if (!users && !error) return <Loading />

  if (!session) {
    router.push('/signin')

    return
  }

  const sendNewsletter = async () => {

    setIsSendingNewsletter(true)
    setPauseSending(false)

    let counter = 0

    let finalUsers = []
    if (filter === 'with_bounce') {

      finalUsers = users?.filter(u => u.email && u.newsletter_bounced)
    }
    else {

      finalUsers = users?.filter(u => u.email && !u.newsletter_bounced)
    }

    /// filter bei users für deaktivated newsletter
    for (const user of finalUsers) {

      counter++
      setUpdateCounter(counter)
      setIsSendingNewsletterTo(`Email:${user.email} Vorname:${user.firstname} Nachname:${user.lastname} UserId:${user.user_id}`)

      await new Promise(r => setTimeout(r, 1000))
      
      if(pauseSending) break

      const sendNewsletter = await fetch(`/api/admin/user/newsletter`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.user_id,
          email: user.email,
        })
      })

      if (sendNewsletter.status === 535) {
        setPauseSending(true)
        setWeAreBlocked(true)
        break
      }
    }

    setSuccess(true)
    setIsSendingNewsletter(false)   
  }
  
  return <>
  
    <Wrapper>

      <div className="container mt-3">
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="fw-bold h3">Mitglieder Newsletter noch nicht gesendet</div>
          </div>
          <div className="col-12 col-md-6 text-end">
            <div className="fw-bold h3">
              <div className="btn-group" role="group" aria-label="Basic example">
                <button onClick={() => setFilter('without_bounce')} type="button" className="btn btn-light">Mitglieder ohne Bounce {users.filter(u => u.email && !u.newsletter_bounced).length > 0 ? <span className="small bg-secondary text-white fw-bold rounded px-2">{users.filter(u => u.email && !u.newsletter_bounced).length}</span> : null}</button>
                <button onClick={() => setFilter('with_bounce')} type="button" className="btn btn-light">Mitglieder mit Bounce {users.filter(u => u.email && u.newsletter_bounced).length > 0 ? <span className="small bg-secondary text-white fw-bold rounded px-2">{users.filter(u => u.email && u.newsletter_bounced).length}</span> : null}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
        {isSendingNewsletter && !pauseSending && !weAreBlocked ? 
          <>
            <div className="col-12">Sending to: {isSendingNewsletterTo} ({updateCounter})</div>
          </>
        : null}
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
        {pauseSending ? 
          <>
            <div className="col-12">
              {weAreBlocked ? <span className="text-danger">Pausiert!</span> : null}
            </div>
          </>
        : null }
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
        {weAreBlocked ? 
          <>
            <div className="col-12">
              Sending: {updateCounter ? <>{success ? <>Successfully sent</> : <>Not successfully sent</>}</> : <>Not started</>}
              {weAreBlocked ? <span className="text-danger">Wir wurden geblockt E-Mails zu versenden!!!</span> : null}
            </div>
          </>
        : null }
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
        {!isSendingNewsletter 
          ? <div className="col-3"><button onClick={() => sendNewsletter()} type="button" className="btn btn-light">Starte mit Newsletter Versand</button></div>
          : <div className="col-3"><button onClick={() => setPauseSending(true)} type="button" className="btn btn-light">Pausiere den Newsletter Versand</button></div>
        }
        </div>
      </div>
      
      <h3 className="mt-3">Mitglieder mit E-Mail</h3>
      {users?.filter(u => filter === 'with_bounce' ? u.email && u.newsletter_bounced : u.email && !u.newsletter_bounced)?.length > 0 ? <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="bg-light rounded p-2">
                <div className="row">
                  <div className="col-1 border-end fw-bold">#</div>
                  <div className="col-3 border-end fw-bold">Name</div>
                  <div className="col-7 fw-bold">E-Mail</div>
                  <div className="col-1 text-end"></div>
                </div>
              </div>
            </div>
          </div>
          {users?.filter(u => filter === 'with_bounce' ? u.email && u.newsletter_bounced : u.email && !u.newsletter_bounced)?.map(user => <div className="row" key={`${user.user_id}`}>
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
                  {/* // new Date(user.activated_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'}) : <>nein</>} */}
                  <div className="col-7">
                    {user.email}
                    {/* {new Date(user.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})} */}
                  </div>
                  <div className="col-1 text-end">
                      
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

      <h3 className="mt-3">Mitglieder ohne E-Mail</h3>
      {users?.filter(u => !u.email)?.length > 0 ? <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="bg-light rounded p-2">
                <div className="row">
                  <div className="col-1 border-end fw-bold">#</div>
                  <div className="col-3 border-end fw-bold">Name</div>
                  <div className="col-7 fw-bold">E-Mail</div>
                  <div className="col-1 text-end"></div>
                </div>
              </div>
            </div>
          </div>
          {users?.filter(u => !u.email)?.map(user => <div className="row" key={`${user.user_id}`}>
            <div className="col-12">
              <div className="px-2 py-1">
                <div className="row mb-1">
                  <div className="col-1">{user.user_id}</div>
                  <div className="col-3">
                    <Link href={`/user/${user.user_id}/${slugify(`${user.lastname}-${user.firstname}`, {lower: true})}`}>
                      <div className="text-secondary">{user.lastname}, {user.firstname} {user.status === 'ADMIN' ? <i className="bi bi-person-fill-gear ms-1" style={{fontSize: 16}}></i> : null}</div>
                    </Link>
                    {/* {user.activated_at ? <i className="ms-1 bi bi-patch-check-fill text-secondary"></i> : null} */}
                  </div>
                  {/* // new Date(user.activated_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'}) : <>nein</>} */}
                  <div className="col-7">
                    {user.email}
                    {/* {new Date(user.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})} */}
                  </div>
                  <div className="col-1 text-end">
                      
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