import React, {useState} from 'react'
import {useRouter} from 'next/router'
import dynamic from 'next/dynamic'
import useSession from '../../../lib/auth/useSession'
import Wrapper from '../../../components/Wrapper'
import Error from '../../../components/Error'
import Loading from '../../../components/Loading'
import NavigationHeader from '../../../components/NavigationHeader'

import 'react-quill/dist/quill.snow.css'
import Link from 'next/link'

const ReactQuill = dynamic(() => import('react-quill'), {ssr: false})

export default function Home() {
  const router = useRouter()
  const {session} = useSession()

  const [formSubject, setFormSubject] = useState('')
  const [formDescription, setFormDescription] = useState('')

  if (!session) return <Loading />

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postRequest = await fetch(`/api/admin/message`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'message',
        subject: formSubject,
        description: formDescription,
      })
    })

    if (postRequest.status === 200) {
      router.push('/admin/messages')
    }

    else if (postRequest.status === 500) {
      return <Error />
    }
  }

  return (
    <>
      <Wrapper>

        <NavigationHeader
          goBack="/admin/messages"
          title="Nachrichten"
        />

        <form onSubmit={(e) => handleSubmit(e)}>

          <div className="container mt-3 mb-3">
            <div className="row">
              <div className="col-6">
                <div className="fw-bold h3">Neue Nachricht</div>
              </div>
              <div className="col-6">
                <div className="btn-group float-end" role="group">
                  <Link href="/admin/messages" className="btn btn-secondary">Abbrechen</Link>
                  <button className="btn btn-success text-white" type="submit">Veröffentlichen</button>
                </div>
              </div>
            </div>
          </div>

          <div className="container mt-3">
            <div className="row mt-3 align-items-center">
              <div className="col-12">
                <span className="p small ms-1">Betreff</span>
                <input type="text" name="formSubject" className="form-control mt-2" placeholder="" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} required />
              </div>
            </div>
            <div className="row mt-3 align-items-center">
              <div className="col-12">
                <span className="p small ms-1">Beschreibung</span>
                <ReactQuill 
                  theme="snow" 
                  modules={{toolbar: [['bold', 'italic', 'underline']]}}
                  formats={['bold', 'italic', 'underline']} 
                  value={formDescription} 
                  onChange={setFormDescription}
                />
              </div>
            </div>
          </div>
        </form>

      </Wrapper>
    </>
  )
}
