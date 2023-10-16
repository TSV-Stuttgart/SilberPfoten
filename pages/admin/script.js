import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import useSWR, {useSWRConfig} from 'swr'
import Error from '../../components/Error'
import Loading from '../../components/Loading'
import Wrapper from '../../components/Wrapper'
import slugify from 'slugify'
import Link from 'next/link'
import useSession from '../../lib/auth/useSession'

export default function Users() {
  const {mutate} = useSWRConfig()
  const {session} = useSession()
  const router = useRouter()
  const {data: users, error} = useSWR(`/api/admin/users?filter=nocoords`, (url) => fetch(url).then(r => r.json()))
  
  const [isUpdatingCoords, setIsUpdatingCoords] = useState(false)
  const [isUpdatingCoordsOf, setIsUpdatingCoordsOf] = useState('')
  const [success, setSuccess] = useState('')
  const [updateCounter, setUpdateCounter] = useState('')
  const [updateCounterMax, setUpdateCounterMax] = useState('')

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  if (error) return <Error />
  if (!users && !error) return <Loading />

  if (!session) {
    router.push('/signin')

    return
  }

  const updateCoords = async (amount) => {

    setIsUpdatingCoords(true)
    setUpdateCounterMax(amount)

    let counterUpdates = 0
    for (const user of users) {
      counterUpdates++

      if(counterUpdates > amount) break

      setUpdateCounter(counterUpdates)
      setIsUpdatingCoordsOf(user.user_id)

      const location = await (await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${user.zipcode}&country=germany&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=1&email=info@silberpfoten.de`)).json()
      
      await new Promise(r => setTimeout(r, 1000))

      if (!location || location.length < 1 || !location[0].lat || !location[0].lon) continue

      const updateUserCoords = await fetch(`/api/admin/user/coords`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zipcode: user.zipcode,
          lat: location[0].lat,
          lon: location[0].lon,
        })
      })

      mutate(`/api/admin/users?filter=nocoords`)
      
    }

    if(counterUpdates > amount) setSuccess(true)
    else setSuccess(false)

    setIsUpdatingCoords(false)   

  }
  
  return <>
  
    <Wrapper>

      <div className="container mt-3">
        <div className="row">
          <div className="col-12 col-md-4">
            <div className="fw-bold h3">Mitglieder ohne Koordinaten</div>
          </div>
          <div className="col-12 col-md-8 text-end">
            <div className="fw-bold h3">
              <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className="btn btn-light">Ohne Koordinaten {users.length > 0 ? <span className="small bg-secondary text-white fw-bold rounded px-2">{users.length}</span> : null}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
        {isUpdatingCoords ? <>
            <div className="col-12">Updating: UserId: {isUpdatingCoordsOf} ({updateCounter}/{updateCounterMax})</div>
            </>
        : <>
        <div className="col-12">Updating: {updateCounterMax ? <>{success ? <>Successfully updated</> : <>Not successfully updated</>}</> : <>Not started</>}</div>
        </>
        }
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
        {!isUpdatingCoords ? <>
            <div className="col-3"><button onClick={() => updateCoords(1)} type="button" className="btn btn-light">Koordinaten für 1 User</button></div>
            <div className="col-3"><button onClick={() => updateCoords(10)} type="button" className="btn btn-light">Koordinaten für 10 User</button></div>
            <div className="col-3"><button onClick={() => updateCoords(100)} type="button" className="btn btn-light">Koordinaten für 100 User</button></div>
            <div className="col-3"><button onClick={() => updateCoords(1000)} type="button" className="btn btn-light">Koordinaten für 1000 User</button></div>
            </>
        : <>
        <div className="col-3"><button type="button" className="btn btn-light" disabled>Koordinaten für 1 User</button></div>
        <div className="col-3"><button type="button" className="btn btn-light" disabled>Koordinaten für 10 User</button></div>
        <div className="col-3"><button type="button" className="btn btn-light" disabled>Koordinaten für 100 User</button></div>
        <div className="col-3"><button type="button" className="btn btn-light" disabled>Koordinaten für 1000 User</button></div>
        </>
        }
        </div>
      </div>

      {users?.length > 0 ? <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="bg-light rounded p-2">
                <div className="row">
                  <div className="col-1 border-end fw-bold">#</div>
                  <div className="col-3 border-end fw-bold">Name</div>
                  <div className="col-7 fw-bold">Adresse</div>
                  <div className="col-1 text-end"></div>
                </div>
              </div>
            </div>
          </div>
          {users?.map(user => <div className="row" key={`${user.user_id}`}>
            <div className="col-12">
              <div className="px-2 py-1">
                <div className="row mb-1">
                  <div className="col-1">{user.user_id}</div>
                  <div className="col-3">
                    <Link href={`/user/${user.user_id}/${slugify(`${user.lastname}-${user.firstname}`, {lower: true})}`}>
                      <div className="text-secondary">{user.lastname}, {user.firstname} {user.status === 'ADMIN' ? <i className="bi bi-person-fill-gear ms-1" style={{fontSize: 16}}></i> : null}</div>
                    </Link>
                    {/* {user.activated_at ? <i className="ms-1 bi bi-patch-check-fill text-secondary"></i> : null} */}
                  </div>
                  {/* // new Date(user.activated_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'}) : <>nein</>} */}
                  <div className="col-7">
                    {user.street} {user.street_number}, {user.zipcode} {user.city}
                    {/* {new Date(user.created_at).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})} */}
                  </div>
                  <div className="col-1 text-end">
                      
                  </div>
                </div>
              </div>
            </div>
          </div>)}
        </div>
      </> : <>
        <div className="container mt-2">
          <div className="row mb-1">
            <div className="col-12">
              <div className="p">Keine weiteren Einträge</div>
            </div>
          </div>
        </div>
      </>}

    </Wrapper>
  </>
}