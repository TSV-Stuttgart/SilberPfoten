import React, {useEffect, useState} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import {useRouter} from 'next/router'
import useSession from '../../../../lib/auth/useSession'
import AdminWrapper from '../../../../components/AdminWrapper'
import Error from '../../../../components/Error'
import Loading from '../../../../components/Loading'
import ReactHtmlParser from 'react-html-parser'
import NavigationHeader from '../../../../components/NavigationHeader'
import Image from 'next/image'

export async function getServerSideProps(context) {

  return {
    props: {
      query: context.query
    },
  }
}

export default function AdminmessageDetail({query}) {
  const router = useRouter()
  const {mutate} = useSWRConfig()
  const {data: message, error: messageError} = useSWR(`/api/admin/message?messageId=${query.messageId}`, (url) => fetch(url).then(r => r.json()))
  const {session} = useSession()

  const [selectedMedia, setSelectedMedia] = useState(undefined)

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  const deleteMessage = async () => {
    const confirmed = confirm("Wirklich löschen?")

    if (confirmed) {
      await fetch(`/api/admin/message?messageId=${query.messageId}`, {method: 'DELETE'})
      
      router.push('/admin/messages')
    }
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
      <AdminWrapper>

        <NavigationHeader
          goBack="/admin/messages"
          title="Nachrichten"
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
            <div className="col-7">
              <div className="fw-bold h3 mb-0">{message.subject} {message.message_type === 'message' ? <>| {message.zipcode}</> : null}</div>
              <div className="fw-normal p mt-0">
                {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
              </div>
            </div>
            <div className="col-5 text-end">
              <div className="btn-group" role="group">
                <button className="btn btn-danger" onClick={() => deleteMessage()}>Löschen</button>
                {/*<Link href={`/admin/message/edit/${query.messageId}/${slugify(message.subject, {lower: true})}`} className="btn btn-primary">Bearbeiten</Link>*/}
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-2">
          <div className="row">
            <div className="col-12">
              {ReactHtmlParser(message.message_text.replaceAll("<p><br></p>", ""))}
            </div>
          </div>
        </div>

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

      </AdminWrapper>
    </>
  )
}
