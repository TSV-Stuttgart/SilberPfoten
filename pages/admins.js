import React from 'react'
import useSWR from 'swr'
import {useRouter} from 'next/router'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Wrapper from '../components/Wrapper'
import useSession from '../lib/auth/useSession'

export default function Helpers() {
  const {session} = useSession()
  const router = useRouter()
  const {data: helpers, error} = useSWR(`/api/admin/admins`, (url) => fetch(url).then(r => r.json()))

  if (error) return <Error />
  if (!helpers && !error) return <Loading />

  if (!session) {
    router.push('/signin')
  }
  
  return <>
    <Wrapper>

      <div className="container mt-3 user-select-none">
        <div className="row">
          <div className="col">
            <div className="fw-bold h3">Admins</div>
          </div>
        </div>
      </div>

      {helpers?.length > 0 ? <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="bg-light rounded p-2">
                <div className="row">
                  <div className="col-10 border-end fw-bold">Name</div>
                  <div className="col-2 text-end fw-bold">Erstellt am</div>
                </div>
              </div>
            </div>
          </div>
          {helpers?.map(helper => <div className="row" key={`${helper.user_id}`}>
            <div className="col-12">
              <div className="px-2 py-1">
                <div className="row">
                  <div className="col-10">{helper.lastname}, {helper.firstname}</div>
                  <div className="col-2 text-end">{new Date(helper.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})}</div>
                </div>
              </div>
            </div>
          </div>)}
        </div>
      </> : null}

    </Wrapper>
  </>
}