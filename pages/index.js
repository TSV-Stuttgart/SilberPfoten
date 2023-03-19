import React from 'react'
import useSWR, {useSWRConfig} from 'swr'
import {useRouter} from 'next/router'
import slugify from 'slugify'
import Link from 'next/link'
import useSession from '../lib/auth/useSession'
import Wrapper from '../components/Wrapper'
import Error from '../components/Error'
import Loading from '../components/Loading'

export default function Home() {
  const router = useRouter()
  const {mutate} = useSWRConfig()
  const {data: messages, error: messagesError} = useSWR(`/api/messages`, (url) => fetch(url).then(r => r.json()))
  const {session} = useSession()

  const deleteMessage = async (messageId) => {
    await fetch(`/api/admin/message?messageId=${messageId}`, {method: 'DELETE'})
  
    mutate(`/api/messages`)
  }

  if (messagesError) return <Error />
  if (!messages && !messagesError) return <Loading />
  if (!session) {
    router.push('/signin')

    return
  }

  return (
    <>
      <Wrapper>

        <div className="container mt-3 mb-3">
          <div className="row">
            <div className="col-12">
              <div className="fw-bold h3">Nachrichten</div>
            </div>
          </div>
        </div>

        {messages.filter(m => m.message_type === 'case').length > 0 ? <div className="mt-3 mb-4">
          <div className="ms-4">Wir haben einen passenden Suchauftrag für dich!</div>
          {messages.filter(m => m.message_type === 'case').map(message => <React.Fragment key={message.message_id}>
          <Link href={`/message/${message.message_id}/${slugify(message.subject, {lower: true})}`} className="text-decoration-none text-secondary">
          <div className="container mt-2">
            <div className="row align-items-center">
              <div className="col-12">
                <div className="border p-2 rounded-3 bg-light">
                  <div className="row align-items-center">
                    <div className="col-2 text-center border-end">
                      <i className="bi bi-megaphone-fill text-danger" style={{fontSize:18}}></i>
                    </div>
                    <div className="col-10">
                      <div className="small">
                        {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
                      </div>
                      <div className="p fw-bold">{message.subject} | {message.zipcode}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Link>
          </React.Fragment>)}
        </div> : null}

        {messages.filter(m => m.message_type === 'message').map(message => <React.Fragment key={message.message_id}>
        <Link href={`/message/${message.message_id}/${slugify(message.subject, {lower: true})}`} className="text-decoration-none text-secondary">
        <div className="container mt-2">
          <div className="row align-items-center">
            <div className="col-12">
              <div className="border p-2 rounded-3">
                <div className="row align-items-center">
                  <div className="col-2 text-center border-end">
                    <i className="bi bi-envelope-fill" style={{fontSize:18, color: '#904684'}}></i>
                  </div>
                  <div className="col-10">
                    <div className="small">
                      {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
                    </div>
                    <div className="p fw-bold">{message.subject}</div>
                  </div>
                </div>
              </div>

              {/* {message.message_type === 'case' ? <>
              <div className="border-bottom pb-4 p-2 bg-light rounded-3">
                <div className="row">
                  <div className="col-11 offset-1">
                    <span className="small">
                      {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
                    </span>
                  </div>
                </div>
                <div className="row align-items-center">
                  <div className="col-1 text-center">
                    <i className="bi bi-search-heart" style={{fontSize:18, color: '#748da6'}}></i>
                  </div>
                  <div className="col-8">
                    <span className="p fw-bold rounded bg-white px-1">Suchauftrag in {message.zipcode} {message.city}</span>
                  </div>
                  <div className="col-3 text-end">
                    <div className="dropdown">
                      <i className="bi bi-three-dots-vertical text-secondary cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false"></i>
                      <ul className="dropdown-menu">
                        <li><div className="dropdown-item cursor-pointer" onClick={() => deleteMessage(message.message_id)}>Nachricht löschen</div></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-11 offset-1">
                    <span className="small fw-light">Beschreibung</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-11 offset-1 ">
                    {ReactHtmlParser(message.message_text)}
                  </div>
                </div>
                {message.message_type === 'case' ? <>
                <div className="row mt-4">
                  <div className="col-11 offset-1 ">
                    <span className="fw-light">Erfahrung mit folgenden Tierarten</span>
                    <div className="text-break">{message.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
                      {e === 'dog' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Hund</span> : null}
                      {e === 'cat' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Katze</span> : null}
                      {e === 'bird' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Vogel</span> : null}
                      {e === 'small_animal' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
                      {e === 'other' ? <span className="bg-white me-1 rounded px-2 small text-secondary">{message.experience_with_animal_other}</span> : null}
                    </React.Fragment>)}</div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-11 offset-1 ">
                    <span className="fw-light">Benötigte Tätigkeiten</span>
                    <div className="text-break">{message.support_activity?.split(',').map(e => <React.Fragment key={e}>
                      {e === 'go_walk' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Gassi gehen</span> : null}
                      {e === 'veterinary_trips' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Tierarztfahrten</span> : null}
                      {e === 'animal_care' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Hilfe bei der Tierpflege</span> : null}
                      {e === 'events' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Hilfe bei Veranstaltungen</span> : null}
                      {e === 'baking_cooking' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Backen und Kochen</span> : null}
                      {e === 'creative_workshop' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Kreativworkshops</span> : null}
                      {e === 'public_relation' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Öffentlichkeitsarbeit</span> : null}
                      {e === 'light_office_work' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Leichte Büroarbeiten</span> : null}
                      {e === 'graphic_work' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Grafische Arbeiten</span> : null}
                    </React.Fragment>)}</div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-11 offset-1 ">
                    <span className="fw-light">Kontaktdaten</span>
                    <div className="small">Die vollen Kontaktangaben werden dir angezeigt wenn du als Helfer akzeptiert wirst.</div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-11 offset-1 ">
                    Adresse: ****, 73760 Ostfildern
                  </div>
                </div>
                <div className="row mt-2 align-items-center">
                  <div className="col-12 text-end">
                    <div className="btn-group me-2" role="group">
                      {message?.accepted_case_members?.includes(session.user.user_id) ? 
                        <button type="button" className={`btn btn-info`} onClick={() => cancelAcceptedCase(message.message_id)}><i className="bi bi-hearts text-dark"></i> Doch keine Hilfe anbieten</button> :
                        <button type="button" className={`btn btn-info`} onClick={() => acceptCase(message.message_id)}><i className="bi bi-hearts text-danger"></i> Hilfe anbieten</button>
                      }
                    </div>
                  </div>
                </div>
                <div className="row mt-2 align-items-center">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="">Angebotene Helfer</div>
                  </div>
                </div>
                <div className="row mt-2 align-items-center">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-white rounded p-2">
                      <div className="row">
                        <div className="col-1 border-end fw-bold">#</div>
                        <div className="col-3 border-end fw-bold">Name</div>
                        <div className="col-5 border-end fw-bold">Erfahrungen mit Tieren</div>
                        <div className="col-2 text-end fw-bold">Optionen</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-1 align-items-center">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="p-2">
                      <div className="row">
                        <div className="col-1 border-end">12</div>
                        <div className="col-3 border-end">Bolognese, Francesca</div>
                        <div className="col-5 border-end">pill1, pill2</div>
                        <div className="col-2 text-end">...</div>
                      </div>
                    </div>
                  </div>
                </div>
                </> : null}
              </div>
              </> : null} */}

            </div>
          </div>
        </div>
        </Link>
        </React.Fragment>)}

      </Wrapper>
    </>
  )
}
