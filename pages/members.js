import React from 'react'
import useSWR from 'swr'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Wrapper from '../components/Wrapper'
import logger from '../lib/logger'
import getToken from '../lib/auth/getToken'
import slugify from 'slugify'
import Link from 'next/link'

export async function getServerSideProps(context) {

  try {
    const token = await getToken(context.req)

    if (!token) {
      logger.info(`members | user | unauthorized`)

      return {
        redirect: {
          destination: `/signin`,
          statusCode: 302,
        },
      }
    }
    
    return {props: {}}

  } catch(e) {
    logger.info(`members | error | ${e}`)

    return {props: {}}
  }
}

export default function Members() {
  const {data: members, error} = useSWR(`/api/members`, (url) => fetch(url).then(r => r.json()))

  if (error) return <Error />
  if (!members && !error) return <Loading />
  
  return <>
    <Wrapper>

      <div className="container mt-3">
        <div className="row">
          <div className="col">
            <div className="fw-bold h3">Mitglieder</div>
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
                  <div className="col-1 text-center fw-bold">Aktiv</div>
                  <div className="col-2 text-end fw-bold">Erstellt am</div>
                </div>
              </div>
            </div>
          </div>
          {members?.map(member => <div className="row" key={`${member.user_id}`}>
            <div className="col-12">
              <div className="px-2 py-1">
                <div className="row mb-1">
                  <div className="col-1">{member.user_id}</div>
                  <div className="col-3"><Link href={`/member/${member.user_id}/${slugify(`${member.lastname}-${member.firstname}`, {lower: true})}`}><a className="text-secondary">{member.lastname}, {member.firstname}</a></Link></div>
                  <div className="col-5 text-break">{member.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
                    {e === 'dog' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Hund</span> : null}
                    {e === 'cat' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Katze</span> : null}
                    {e === 'bird' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Vogel</span> : null}
                    {e === 'small_animal' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
                    {e === 'other' ? <span className="bg-light me-1 rounded px-2 small text-secondary">{member.experience_with_animal_other}</span> : null}
                  </React.Fragment>)}</div>
                  <div className="col-1 text-center">{member.activated_at ? <i className="bi bi-patch-check-fill text-secondary"></i> : null}</div>
                  {/* // new Date(member.activated_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'}) : <>nein</>} */}
                  <div className="col-2 text-end">{new Date(member.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})}</div>
                </div>
              </div>
            </div>
          </div>)}
        </div>
      </> : null}

    </Wrapper>
  </>
}