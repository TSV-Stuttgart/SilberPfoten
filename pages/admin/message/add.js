import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/router'
import dynamic from 'next/dynamic'
import useSession from '../../../lib/auth/useSession'
import AdminWrapper from '../../../components/AdminWrapper'
import Error from '../../../components/Error'
import Loading from '../../../components/Loading'
import NavigationHeader from '../../../components/NavigationHeader'
//import slugify from 'slugify'
import 'react-quill/dist/quill.snow.css'
import Link from 'next/link'
import useSWR from 'swr'

const ReactQuill = dynamic(() => import('react-quill'), {ssr: false})

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {

  var R = 6371 // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1)  // deg2rad below
  var dLon = deg2rad(lon2-lon1) 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  var d = R * c // Distance in km
  return d
}

const deg2rad = (deg) => {
  return deg * (Math.PI/180)
}

export default function Home() {
  const router = useRouter()
  const {session} = useSession()
  const {data: users, error} = useSWR(`/api/admin/users?filter=active`, (url) => fetch(url).then(r => r.json()))

  const [formSubject, setFormSubject] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const [formZipcode, setFormZipcode] = useState('')
  const [formSearchRadius, setFormSearchRadius] = useState('')
  const [allDistancesOfUsers, setAllDistancesOfUsers] = useState([])

  useEffect(() => {

    const findLocation = async () => {
      const location = await (await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${formZipcode}&country=germany&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=1&email=info@silberpfoten.de`)).json()

      let distances = []
      for (const user of users) {

        if (user.lat === null || user.lon === null) continue

        const distance = getDistanceFromLatLonInKm(location[0].lat, location[0].lon, user.lat, user.lon)
        distances.push(distance)
      }
      setAllDistancesOfUsers(distances.length > 0 ? distances : [9999999])
    }

    if (formZipcode.length === 5 && allDistancesOfUsers.length === 0 && formSearchRadius > 0) {
      findLocation()
    }
    else if (formZipcode.length !== 5 && allDistancesOfUsers.length > 0){
      setAllDistancesOfUsers([])
    }
 
  }, [formZipcode, users, formSearchRadius, allDistancesOfUsers])

  if (!session) return <Loading />

  const handleSubmit = async (e) => {
    e.preventDefault()

    const putRequest = await fetch(`/api/admin/message`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'message',
        subject: formSubject,
        description: formDescription,
        zipcode: formZipcode,
        searchRadius: formSearchRadius
      })
    })

    if (putRequest.status === 200) {
      router.push(`/admin/messages`)
      //const data = await putRequest.json()
      //router.push(`/admin/case/${data.body.caseId}/${slugify(data.body.subject, {lower: true})}`)
    }

    else if (putRequest.status === 500) {
      return <Error />
    }
  }

  return (
    <>
      <AdminWrapper>

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

          <div className="container mt-4">
            <div className="row mt-1">
              <div className="col-12 col-md-4 fw-bold">
              Empfänger einschränken (optional)
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-12 col-md-4">
                <span className="p small ms-1">Postleitzahl</span>
                <input type="tel" className="form-control" placeholder="XXXXX" value={formZipcode} onChange={(e) => setFormZipcode(e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <span className="p small ms-1">
                  <span>Empfänger Radius festlegen </span>
                  <span className="fw-bold">
                    (
                      {formZipcode.length === 5 && formSearchRadius > 0 
                        ? allDistancesOfUsers?.filter(d => d <= formSearchRadius)?.length 
                        : users?.length
                      } 
                      <span> betreffende User</span>
                    ) <br/>
                  </span>
                </span>
                <input type="number" step="0.1" className="form-control" placeholder="X" value={formSearchRadius} onChange={(e) => setFormSearchRadius(e.target.value)} />
              </div>
            </div>

          </div>
        </form>

      </AdminWrapper>
    </>
  )
}
