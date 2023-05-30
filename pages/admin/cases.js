import React, {useEffect, useState} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import {useRouter} from 'next/router'
import slugify from 'slugify'
import useSession from '../../lib/auth/useSession'
import Wrapper from '../../components/Wrapper'
import Error from '../../components/Error'
import Loading from '../../components/Loading'
import SessionExpired from '../../components/SessionExpired'
import dynamic from 'next/dynamic'
import ReactHtmlParser from 'react-html-parser'

import 'react-quill/dist/quill.snow.css'
import Link from 'next/link'

export default function Home() {
  const {mutate} = useSWRConfig()
  const {data: messages, error: messagesError} = useSWR(`/api/admin/cases`, (url) => fetch(url).then(r => r.json()))
  const {session} = useSession()

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
      <Wrapper>

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
          <div className="row mt-2">
            <div className="col-12">
              <div className="p-3 bg-light rounded">
                <div className="row">
                  <div className="col-6 fw-bold border-end">Betreff</div>
                  <div className="col-3 fw-bold border-end">Status</div>
                  <div className="col-3 fw-bold">Erstellt am</div>
                </div>
              </div>
            </div>
          </div>
          {messages.filter(m => m.message_type === 'case').map(message => <React.Fragment key={message.message_id}>
          <div className="row">
            <div className="col-12">
              <Link href={`/admin/case/${message.message_id}/${slugify(message.subject, {lower: true})}`} className="text-decoration-none text-dark">
              <div className="px-3 py-1">
                <div className="row align-items-center">
                  <div className="col-6 border-end">{message.subject}</div>
                  <div className="col-3 border-end">
                    {!message.accepted_case_users ? <span className="fw-normal text-success">Bedarf für Hilfe vorhanden</span> : null}
                    {message.accepted_case_users?.length > 0 ? <span className="fw-normal text-success">{message.accepted_case_users?.length} Bewerber</span> : null}
                  </div>
                  <div className="col-3">{new Date(message.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr</div>
                </div>
              </div>
              </Link>
            </div>
          </div>
          </React.Fragment>)}
        </div>

      </Wrapper>
    </>
  )
}
