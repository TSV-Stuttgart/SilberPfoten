import React from 'react'
import useSWR from 'swr'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Wrapper from '../components/Wrapper'
import logger from '../lib/logger'
import getToken from '../lib/auth/getToken'

export async function getServerSideProps(context) {

  try {
    const token = await getToken(context.req)

    if (!token) {
      logger.info(`helpers | user | unauthorized`)

      return {
        redirect: {
          destination: `/signin`,
          statusCode: 302,
        },
      }
    }
    
    return {props: {}}

  } catch(e) {
    logger.info(`helpers | error | ${e}`)

    return {props: {}}
  }
}

export default function Helpers() {
  const {data: helpers, error} = useSWR(`/api/helpers`, (url) => fetch(url).then(r => r.json()))

  if (error) return <Error />
  if (!helpers && !error) return <Loading />
  
  return <>
    <Wrapper>

      <div className="container mt-3 user-select-none">
        <div className="row">
          <div className="col">
            <div className="fw-bold h3">Helfer</div>
          </div>
        </div>
      </div>

      {helpers?.length > 0 ? <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="bg-light rounded p-2">
                <div className="row">
                  <div className="col-3 border-end fw-bold">Name</div>
                  <div className="col-3 border-end fw-bold">Erfahrungen mit Tieren</div>
                  <div className="col-3 text-end fw-bold">Aktiviert</div>
                  <div className="col-3 text-end fw-bold">Erstellt am</div>
                </div>
              </div>
            </div>
          </div>
          {helpers?.map(helper => <div className="row" key={`${helper.user_id}`}>
            <div className="col-12">
              <div className="px-2 py-1">
                <div className="row">
                  <div className="col-3">{helper.lastname}, {helper.firstname}</div>
                  <div className="col-3">{helper.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
                    {e === 'dog' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Hund</span> : null}
                    {e === 'cat' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Katze</span> : null}
                    {e === 'bird' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Vogel</span> : null}
                    {e === 'small_animal' ? <span className="bg-light me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
                    {e === 'other' ? <span className="bg-light me-1 rounded px-2 small text-secondary">{helper.experience_with_animal_other}</span> : null}
                  </React.Fragment>)}</div>
                  <div className="col-3 text-end"></div>
                  <div className="col-3 text-end">{new Date(helper.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'})}</div>
                </div>
              </div>
            </div>
          </div>)}
        </div>
      </> : null}

    </Wrapper>
  </>
}