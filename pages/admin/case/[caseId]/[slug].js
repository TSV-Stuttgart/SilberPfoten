import React, {useEffect} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import {useRouter} from 'next/router'
import useSession from '../../../../lib/auth/useSession'
import Wrapper from '../../../../components/Wrapper'
import Error from '../../../../components/Error'
import Loading from '../../../../components/Loading'
import ReactHtmlParser from 'react-html-parser'
import NavigationHeader from '../../../../components/NavigationHeader'
import Link from 'next/link'
import slugify from 'slugify'

export async function getServerSideProps(context) {

  return {
    props: {
      query: context.query
    },
  }
}

export default function AdminCaseDetail({query}) {
  const router = useRouter()
  const {mutate} = useSWRConfig()
  const {data: message, error: messageError} = useSWR(`/api/admin/case?caseId=${query.caseId}`, (url) => fetch(url).then(r => r.json()))
  const {session} = useSession()

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  const deleteMessage = async () => {
    const confirmed = confirm("Wirklich löschen?")

    if (confirmed) {
      await fetch(`/api/admin/message?messageId=${query.caseId}`, {method: 'DELETE'})
      
      router.push('/admin/cases')
    }
  }

  const acceptUser = async (userId) => {
    await fetch(`/api/admin/case/accept?caseId=${query.caseId}&userId=${userId}`, {method: 'PATCH'})
    
    mutate(`/api/admin/case?caseId=${query.caseId}`)
  }

  const rejectUser = async (userId) => {
    await fetch(`/api/admin/case/reject?caseId=${query.caseId}&userId=${userId}`, {method: 'PATCH'})
    
    mutate(`/api/admin/case?caseId=${query.caseId}`)
  }

  if (messageError) return <Error />
  if (!message && !messageError) return <Loading />
  if (!session) {
    router.push('/signin')

    return
  }

  return (
    <>
      <Wrapper>

        <NavigationHeader
          goBack="/admin/cases"
          title="Suchaufträge"
        />

        <div className="container mt-3 mb-3">
          <div className="row">
            <div className="col-7">
              <div className="fw-bold h3 mb-0">{message.subject} {message.message_type === 'case' ? <>| {message.zipcode}</> : null}</div>
              <div className="fw-normal p mt-0">
                {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
              </div>
            </div>
            <div className="col-5 text-end">
              <div className="btn-group" role="group">
                <button className="btn btn-danger" onClick={() => deleteMessage()}>Löschen</button>
                <Link href={`/admin/case/edit/${query.caseId}/${slugify(message.subject, {lower: true})}`} className="btn btn-primary">Bearbeiten</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-2">
          <div className="row">
            <div className="col-12">
              {ReactHtmlParser(message.message_text)}
            </div>
          </div>
        </div>

        <div className="container mt-2">
          <div className="row mb-3">
            <div className="col-12 fw-bold">Daten zum Suchauftrag</div>
          </div>
          <div className="row">
            <div className="col-12 fw-bold">Anschrift</div>
            <div className="col-12">
              {message.zipcode} {message.city}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 fw-bold">Erfahrung mit folgenden Tierarten</div>
            <div className="col-12">
              <div className="text-break mt-1">{message.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
                {e === 'dog' ? <span className="bg-light me-1 rounded px-2 text-secondary">Hund</span> : null}
                {e === 'cat' ? <span className="bg-light me-1 rounded px-2 text-secondary">Katze</span> : null}
                {e === 'bird' ? <span className="bg-light me-1 rounded px-2 text-secondary">Vogel</span> : null}
                {e === 'small_animal' ? <span className="bg-light me-1 rounded px-2 text-secondary">Kleintiere</span> : null}
                {e === 'other' ? <span className="bg-light me-1 rounded px-2 text-secondary">{message.experience_with_animal_other}</span> : null}
              </React.Fragment>)}</div>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12 fw-bold">Benötigte Tätigkeiten</div>
            <div className="col-12">
              <div className="text-break mt-1">{message.support_activity?.split(',').map(e => <React.Fragment key={e}>
                {e === 'go_walk' ? <span className="bg-light me-1 rounded px-2 text-secondary">Gassi gehen</span> : null}
                {e === 'veterinary_trips' ? <span className="bg-light me-1 rounded px-2 text-secondary">Tierarztfahrten</span> : null}
                {e === 'animal_care' ? <span className="bg-light me-1 rounded px-2 text-secondary">Hilfe bei der Tierpflege</span> : null}
                {e === 'events' ? <span className="bg-light me-1 rounded px-2 text-secondary">Hilfe bei Veranstaltungen</span> : null}
                {e === 'baking_cooking' ? <span className="bg-light me-1 rounded px-2 text-secondary">Backen und Kochen</span> : null}
                {e === 'creative_workshop' ? <span className="bg-light me-1 rounded px-2 text-secondary">Kreativworkshops</span> : null}
                {e === 'public_relation' ? <span className="bg-light me-1 rounded px-2 text-secondary">Öffentlichkeitsarbeit</span> : null}
                {e === 'light_office_work' ? <span className="bg-light me-1 rounded px-2 text-secondary">Leichte Büroarbeiten</span> : null}
                {e === 'graphic_work' ? <span className="bg-light me-1 rounded px-2 text-secondary">Grafische Arbeiten</span> : null}
              </React.Fragment>)}</div>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-12 fw-bold">Helfer die sich gemeldet haben</div>
          </div>
          {message?.accepted_case_users?.map(caseUser => <React.Fragment key={caseUser.user_id}>
          <div className="row mt-3">
            <div className="col-7 fw-bold border-end">Name, Vorname</div>
            <div className="col-4 fw-bold">Status</div>
            <div className="col-1"></div>
          </div>
          <div className="row mt-1 align-items-center">
            <div className="col-7">
              {caseUser.lastname}, {caseUser.firstname}<br/>
              {caseUser.email}<br/>
              Mobil: {caseUser.mobile}<br/>
              Telefon: {caseUser.phone}
            </div>
            <div className="col-4">
              {caseUser.accepted_at ? <>Hilfe akzeptiert</> : null}
              {!caseUser.accepted_at && caseUser.rejected_at ? <>Hilfe abgelehnt</> : null}
              {!caseUser.accepted_at && !caseUser.rejected_at ? <span onClick={() => acceptUser(caseUser.user_id)}>Ausstehend</span> : null}
            </div>
            <div className="col-1">
              <div className="dropdown">
                <i className="bi bi-three-dots-vertical text-secondary cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false"></i>
                <ul className="dropdown-menu">
                  <li><div className="dropdown-item cursor-pointer" onClick={() => acceptUser(caseUser.user_id)}>Genehmigen</div></li>
                  <li><div className="dropdown-item cursor-pointer" onClick={() => rejectUser(caseUser.user_id)}>Ablehnen</div></li>
                </ul>
              </div>
            </div>
          </div>
          </React.Fragment>)}
        </div>

      </Wrapper>
    </>
  )
}
