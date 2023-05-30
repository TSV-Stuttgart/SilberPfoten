import React, {useState} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import {useRouter} from 'next/router'
import ReactHtmlParser from 'react-html-parser'
import useSession from '../../../lib/auth/useSession'
import Wrapper from '../../../components/Wrapper'
import Error from '../../../components/Error'
import Loading from '../../../components/Loading'
import NavigationHeader from '../../../components/NavigationHeader'
import Image from 'next/image'

export async function getServerSideProps(context) {

  return {
    props: {
      query: context.query
    },
  }
}

export default function Home({query}) {
  const router = useRouter()
  const {mutate} = useSWRConfig()
  const {data: message, error: messageError} = useSWR(`/api/message?messageId=${query.messageId}`, (url) => fetch(url).then(r => r.json()))
  const {session} = useSession()

  const [selectedMedia, setSelectedMedia] = useState(undefined)

  const acceptCase = async (messageId) => {
    await fetch(`/api/message/accept?messageId=${messageId}`, {method: 'POST'})
  
    mutate(`/api/message?messageId=${query.messageId}`)
  }

  const cancelAcceptedCase = async (messageId) => {
    await fetch(`/api/message/accept?messageId=${messageId}`, {method: 'DELETE'})
  
    mutate(`/api/message?messageId=${query.messageId}`)
  }

  const showMediaModal = (media) => {

    setSelectedMedia(media)

    const bootstrap = require('bootstrap')
    const modal = new bootstrap.Modal("#mediaModal")
    modal.show()
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
          goBack={`/`}
          title={`Neuigkeiten`}
        />

        <div className="modal fade" id="mediaModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5">{selectedMedia?.filename}</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body p-0">              
                {['png', 'jpeg', 'gif'].includes(selectedMedia?.mimetype) ? <div className="text-center">
                  <Image src={`data:image/webp;base64,${selectedMedia?.file}`} className="img-fluid" width={selectedMedia?.width} height={selectedMedia?.height} alt={selectedMedia?.filename} style={{objectFit: 'cover'}}></Image>
                </div> : null}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Schliessen</button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-3 mb-3">
          <div className="row">
            <div className="col-12">
              <div className="fw-bold h3 mb-0">{message.subject} {message.message_type === 'case' ? <>| {message.zipcode}</> : null}</div>
              <div className="fw-normal p mt-0">
                {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
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

        {message.message_type === 'case' ? <>
        {message.has_media?.length > 0 ? <>
        <div className="container mt-0">
          <div className="row mt-2">
            <div className="col-12">
              <div className="ms-1 fw-bold">Bilder</div>
              <div className="row">
                <div className="col-12">
                  <div className="border mb-1 p-1 rounded">
                    <div className="row align-items-center">
                      <div className="col">
                        {message.has_media?.map(media => <React.Fragment key={media.message_has_media_id}>
                        <div className="float-start p-1" onClick={() => showMediaModal(media)}>
                          {['png', 'jpeg', 'gif'].includes(media.mimetype) ? <Image src={`data:image/webp;base64,${media.thumbnail}`} className="rounded cursor-pointer" width="150" height="150" alt={media.filename} style={{objectFit: 'cover'}}></Image> : null}
                        </div>
                        </React.Fragment>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </> : null}

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
          <div className="row mt-3">
            <div className="col-12">
              <div className="">Die vollen Kontaktangaben werden dir angezeigt wenn du als Helfer akzeptiert wirst.</div>
            </div>
          </div>
          {message?.case_status && !message?.case_status?.accepted_at && !message?.case_status?.rejected_at ? <>
          <div className="row mt-3">
            <div className="col-12">
              <div className="bg-light p-2 rounded">
                <div className="row align-items-center">
                  <div className="col-2 border-end text-center"><i className="bi bi-info-circle-fill" style={{fontSize: 18}}></i></div>
                  <div className="col-10">
                    <div className="fw-bold">Du hast deine Hilfe angeboten - vielen Dank!</div>
                    <div className="fw-normal">Wir prüfen jetzt deine Anfrage und melden uns bei dir.</div>
                    <div className="fw-normal text-decoration-underline mt-2 cursor-pointer" onClick={() => cancelAcceptedCase(message.message_id)}>Hilfe stornieren</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </> : <>
            <button type="button" className="btn btn-success text-white mt-3" onClick={() => acceptCase(message.message_id)}><i className="bi bi-hearts text-white"></i> Hilfe anbieten</button>
          </>}

          {message?.case_status && message?.case_status?.accepted_at ? <>
          <div className="row mt-3">
            <div className="col-12">
              <div className="bg-light p-2 rounded">
                <div className="row align-items-center">
                  <div className="col-2 border-end text-center"><i className="bi bi-check-circle-fill text-success" style={{fontSize: 18}}></i></div>
                  <div className="col-10">
                    <div className="fw-bold">Danke für deine Hilfe</div>
                    <div className="fw-normal">Du bist aktiv an diesem Auftrag dran.</div>
                    <div className="fw-normal text-decoration-underline mt-2 cursor-pointer" onClick={() => cancelAcceptedCase(message.message_id)}>Hilfe stornieren</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </> : null}

        </div>
        </> : null}

      </Wrapper>
    </>
  )
}