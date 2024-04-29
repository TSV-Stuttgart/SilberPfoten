import React, {useEffect, useState} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import slugify from 'slugify'
import useSession from '../../lib/auth/useSession'
import AdminWrapper from '../../components/AdminWrapper'
import Error from '../../components/Error'
import Loading from '../../components/Loading'
import 'react-quill/dist/quill.snow.css'
import Link from 'next/link'

export default function Home() {
  const {mutate} = useSWRConfig()
  const {data: messages, error: messagesError} = useSWR(`/api/admin/cases`, (url) => fetch(url).then(r => r.json()))
  const {session} = useSession()

  const [formZipcode, setFormZipcode] = useState('')

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  if (!session) return <Loading />

  const deleteMessage = async (messageId) => {
    await fetch(`/api/admin/message?messageId=${messageId}`, {method: 'DELETE'})
  
    mutate(`/api/messages`)
  }

  if (messagesError) return <Error />
  if (!messages && !messagesError) return <Loading />

  return (
    <>
      <AdminWrapper>

        <div className="container mt-3 mb-3">
          <div className="row">
            <div className="col-7">
              <div className="fw-bold h3">Suchaufträge</div>
            </div>
            <div className="col-5 text-end">
              <div className="btn-group" role="group">
                <Link href="/admin/case/add" className="btn btn-secondary">Neuer Suchauftrag</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-1 mb-3">
          <div className="row mt-0 mb-1">
            <div className="col-4 fw-bold"><span className="align-middle">Filtern nach:</span></div>
          </div>
          <div className="row mt-0">
            <div className="col-4 fw-bold">
              <input type="text" name="formSubject" className="form-control" placeholder="PLZ" value={formZipcode} onChange={(e) => setFormZipcode(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="container mb-3">
          <div className="row mt-2">
            <div className="col-12">
              <div className="p-3 bg-light rounded">
                <div className="row">
                  <div className="col-1 fw-bold border-end">PLZ</div>
                  <div className="col-6 fw-bold border-end">Betreff</div>
                  <div className="col-3 fw-bold border-end">Status</div>
                  <div className="col-2 fw-bold">Erstellt am</div>
                </div>
              </div>
            </div>
          </div>
          {messages.filter(m => m.message_type === 'case' && m.zipcode.startsWith(formZipcode)).map(message => <React.Fragment key={message.message_id}>
          <div className="row">
            <div className="col-12">
              <Link href={`/admin/case/${message.message_id}/${slugify(message.subject, {lower: true})}`} className="text-decoration-none text-dark">
              <div className="px-3 py-1">
                <div className="row align-items-center">
                  <div className="col-1 border-end">{message.zipcode}</div>
                  <div className="col-6 border-end">{message.subject}</div>
                  <div className="col-3 border-end">
                    {!message.accepted_case_users ? <span className="fw-normal text-success">Bedarf für Hilfe vorhanden</span> : null}
                    {message.accepted_case_users?.length > 0 ? 
                      <>
                        <span className="fw-normal text-success">{message.accepted_case_users?.length} Bewerber<br/></span> 
                        (<span className="fw-normal">{message.accepted_case_users.filter(acu => acu.accepted_at)?.length} akzeptiert, </span>
                        <span className="fw-normal">{message.accepted_case_users.filter(acu => !acu.accepted_at && !acu.rejected_at)?.length} wartend</span>)
                      </>	
                    : null}
                  </div>
                  <div className="col-2">{new Date(message.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr</div>
                </div>
              </div>
              </Link>
            </div>
          </div>
          </React.Fragment>)}
        </div>

      </AdminWrapper>
    </>
  )
}
