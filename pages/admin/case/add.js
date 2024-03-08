import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import useSession from '../../../lib/auth/useSession'
import Wrapper from '../../../components/Wrapper'
import Error from '../../../components/Error'
import NavigationHeader from '../../../components/NavigationHeader'
import 'react-quill/dist/quill.snow.css'
import Loading from '../../../components/Loading'
import slugify from 'slugify'
import {filesize} from 'filesize'
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

export default function AdminCaseAdd() {
  const router = useRouter()
  const {session, error: sessionError} = useSession()
  const {data: users, error} = useSWR(`/api/admin/users?filter=active`, (url) => fetch(url).then(r => r.json()))

  const [loading, setLoading] = useState(false)

  const [formSubject, setFormSubject] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formGender, setFormGender] = useState('')
  const [formFirstname, setFormFirstname] = useState('')
  const [formLastname, setFormLastname] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formStreet, setFormStreet] = useState('')
  const [formStreetNumber, setFormStreetNumber] = useState('')
  const [formZipcode, setFormZipcode] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formSearchRadius, setFormSearchRadius] = useState('')

  const [formUploads, setFormUploads] = useState([])
  
  const [formSupportingActivity, setFormSupportingActivity] = useState([])
  const [formExperienceWithAnimal, setFormExperienceWithAnimal] = useState([])
  const [formExperienceWithAnimalOther, setFormExperienceWithAnimalOther] = useState('')

  const [allDistancesOfUsers, setAllDistancesOfUsers] = useState([])

  //const [focusOut, setFocusOut] = useState(false)
  //const [formAutoCompleteValues, setFormAutoCompleteValues] = useState('')
  //const [placeId, setPlaceId] = useState('')
  //const [coordLat, setCoordLat] = useState('')
  //const [coordLon, setCoordLon] = useState('')

  useEffect(() => {

    const findLocation = async () => {
      const location = await (await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${formZipcode}&country=germany&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=1&email=info@silberpfoten.de`)).json()

      let distances = []
      for (const user of users?.filter(u => u.newsletter && !u.newsletter_deactivated && !u.newsletter_bounced && u.status === 'USER')) {

        if (user.lat === null || user.lon === null) {

          distances.push(9999999)
          continue
        }

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

  //const searchAddress = async (value) => {
  //  const location = await (await fetch(`https://nominatim.openstreetmap.org/search/${value}?format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=5&email=info@silberpfoten.de`)).json()

  //  setFormAutoCompleteValues(location)
  //  setFocusOut(false)
  //}

  //const resetCoords = () => {
  //  setPlaceId('')
  //}

  if (!session && !sessionError) return <Loading />
  if (!users && !error) return <Loading />
  if (loading) return <Loading />

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    const putRequest = await fetch(`/api/admin/message`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'case',
        subject: formSubject,
        description: formDescription,
        gender: formGender,
        lastname: formLastname,
        firstname: formFirstname,
        phone: formPhone,
        email: formEmail,
        street: formStreet,
        streetNumber: formStreetNumber,
        zipcode: formZipcode,
        city: formCity,
        searchRadius: formSearchRadius,
        supportActivity: formSupportingActivity,
        experienceWithAnimal: formExperienceWithAnimal,
        experienceWithAnimalOther: formExperienceWithAnimalOther,
        formUploads,
      })
    })

    if (putRequest.status === 200) {
      const data = await putRequest.json()
      router.push(`/admin/case/${data.body.caseId}/${slugify(data.body.subject, {lower: true})}`)
    }

    else if (putRequest.status === 500) {
      return <Error />
    }
  }

  const readAsDataURL = async (reader, upload) => {
    try {
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          resolve(e.target.result)
        }
  
        reader.readAsDataURL(upload)
      })
    } catch (e) {
      console.log(`error reading files`, e)
      reject(e)
    }
  }

  const handleUpload = async () => {
    const uploads = document.querySelector('input[type=file]').files

    setLoading(true)
    
    for (const upload of uploads) {      
      const reader = new FileReader()

      upload['id'] = self?.crypto?.randomUUID()
      upload['filename'] = slugify(upload.name, {lower: true})
      upload['base64'] = await readAsDataURL(reader, upload)
    }

    setFormUploads([...formUploads, ...Array.from(uploads)])

    setLoading(false)
  }

  const calculateUploadedTotalSize = () => {
    return formUploads?.reduce((accumulator, currentValue) => accumulator + currentValue?.size, 0)
  }

  return (
    <>
      <Wrapper>

        <NavigationHeader
          goBack="/admin/cases"
          title="Suchaufträge"
        />

        <form onSubmit={(e) => handleSubmit(e)}>

          <div className="container mt-3 mb-3">
            <div className="row">
              <div className="col-6">
                <div className="fw-bold h3">Neuer Suchauftrag</div>
              </div>
              <div className="col-6">
                <div className="btn-group float-end" role="group">
                  <Link href="/admin/messages" className="btn btn-secondary">Abbrechen</Link>
                  {calculateUploadedTotalSize() >= 10485760 || allDistancesOfUsers?.filter(d => d <= formSearchRadius)?.length > 500
                  ? <button className="btn btn-success text-white" type="submit" disabled>Veröffentlichen</button>
                  : <button className="btn btn-success text-white" type="submit">Veröffentlichen</button>
                  }
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

            <div className="row mt-3">
            {formUploads.length > 0 ? <>
              <div className="col-12">
                {/* max 10 mb upload */}
                {/* https://www.online-rechner.net/datenmenge/#Rechner */}
                {calculateUploadedTotalSize() >= 10485760 ? <>
                  <div className="mb-2 bg-danger rounded text-white p-2">
                    <div className="fw-bold">Maximal 10 MB erlaubt <span className="fw-normal">(Hochgeladen: {filesize(calculateUploadedTotalSize())})</span></div>
                    <div className="">Die hochgeladenen Dateien überschreiten das Limit von 10 MB.</div>
                  </div>
                </> : null}
                {formUploads.map(upload => <React.Fragment key={upload.id}>
                <div className="border mb-1 p-1 rounded">
                  <div className="row align-items-center">
                    <div className="col-2">
                      {upload.type === 'application/pdf' ? <div className="rounded border text-center pt-1 bg-light" style={{width: 50, height: 50}}><i className="bi bi-filetype-pdf" style={{fontSize: 24}}></i></div> : null}
                      {['image/png', 'image/jpeg', 'image/gif'].includes(upload.type) ? <div className="rounded border" style={{backgroundImage: `url(${upload.base64})`, backgroundSize: 'cover', backgroundPosition: 'center', width: 50, height: 50}}></div> : null}
                    </div>
                    <div className="col-6 border-end">{upload.filename}</div>
                    <div className="col-2 border-end">{filesize(upload.size)}</div>
                    <div className="col-2 text-center"><i className="bi bi-x-circle-fill cursor-pointer" style={{fontSize: 14}} onClick={() => setFormUploads([...formUploads.filter(u => u.id !== upload.id)])}></i></div>
                  </div>
                </div>
                </React.Fragment>)}
              </div>
            </> : null }
              <div className="col-12 align-items-center">
                <label className="d-block p-2 text-center cursor-pointer border rounded bg-light">
                  <i className="bi bi-cloud-arrow-up-fill" style={{fontSize: 20}}></i>
                  <input type="file" id="upload" name="upload" accept="image/png, image/jpeg, image/gif" multiple onChange={() => handleUpload()} style={{display: 'none'}} />
                  <div className="">Bilder hinzufügen</div>
                </label>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12 col-md-4">
                <span className="p small ms-1">Anrede</span>
                <select className="form-control" name="gender" value={formGender} onChange={(e) => setFormGender(e.target.value)} required autoFocus>
                  <option value="">Keine Angabe</option>
                  <option value="female">Frau</option>
                  <option value="male">Herr</option>
                  <option value="diverse">Divers</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <span className="p small ms-1">Nachname</span>
                <input type="text" className="form-control" placeholder="Mustermann" value={formFirstname} onChange={(e) => setFormFirstname(e.target.value)} required />
              </div>
              <div className="col-12 col-md-4">
                <span className="p small ms-1">Vorname</span>
                <input type="text" className="form-control" placeholder="Maxine" value={formLastname} onChange={(e) => setFormLastname(e.target.value)} required />
              </div>
            </div>

            <div className="row mt-1">
              <div className="col-12 col-md-9">
                <span className="p small ms-1">Straße</span>
                <input type="text" className="form-control" placeholder="Musterstraße" value={formStreet} onChange={(e) => setFormStreet(e.target.value)} required />
              </div>
              <div className="col-12 col-md-3">
                <span className="p small ms-1">Hausnummer</span>
                <input type="tel" className="form-control" placeholder="28" value={formStreetNumber} onChange={(e) => setFormStreetNumber(e.target.value)} required />
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12 col-md-4">
                <span className="p small ms-1">Postleitzahl</span>
                <input type="tel" className="form-control" placeholder="70199" value={formZipcode} onChange={(e) => setFormZipcode(e.target.value)} required />
              </div>
              <div className="col-12 col-md-8">
                <span className="p small ms-1">Stadt</span>
                <input type="text" className="form-control" placeholder="Musterstadt" value={formCity} onChange={(e) => setFormCity(e.target.value)} required />
              </div>
            </div>

            {/*<div className="row mt-1">
              <div className="col-12 col-md-9">
                <span className="p small ms-1">Straße</span>
                <input type="text" className="form-control" placeholder="Musterstraße" value={formStreet} onChange={(e) => { setFormStreet(e.target.value); resetCoords() }} onBlur={() => setFocusOut(true)} required />
              </div>
              <div className="col-12 col-md-3">
                <span className="p small ms-1">Hausnummer</span>
                <input type="tel" className="form-control" placeholder="28" value={formStreetNumber} onChange={(e) => { setFormStreetNumber(e.target.value); resetCoords() }} onBlur={() => setFocusOut(true)} required />
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12 col-md-4">
                <span className="p small ms-1">Postleitzahl</span>
                <input type="tel" className="form-control" placeholder="70199" value={formZipcode} onChange={(e) => { setFormZipcode(e.target.value); resetCoords() }} onBlur={() => setFocusOut(true)} required />
              </div>
              <div className="col-12 col-md-8">
                <span className="p small ms-1">Stadt</span>
                <input type="text" className="form-control" placeholder="Musterstadt" value={formCity} onChange={(e) => { setFormCity(e.target.value); resetCoords() }} onBlur={() => setFocusOut(true)} required />
              </div>
            </div>*/}
            
            {/*{formAutoCompleteValues ?
              <div className="border rounded-bottom p-2 bg-light mb-3">
              {formAutoCompleteValues?.length > 0 ? <>
                {!placeId 
                ? <div className="p-1 text-danger fw-bold"><i className="bi bi-info-circle-fill"></i> <small>Wähle die passendste Adresse aus:</small></div>
                : <div className="p-1 text-success"><i className="bi bi-info-circle-fill"></i> <small>Wähle die passendste Adresse aus:</small></div>
                }

                {formAutoCompleteValues.map(item => 
                  <div key={item.place_id} className={`p-1 cursor-pointer ${placeId && placeId != item.place_id ? 'text-muted' : null}`} 
                    onClick={(e) => { setPlaceId(`${item.place_id}`); setCoordLat(`${item.lat}`); setCoordLon(`${item.lon}`) }}>
                    {placeId == item.place_id ? <><i className="bi bi-check-lg"></i>&nbsp;</> : null} 
                    <strong>{item.address.road} {item.address.house_number}, {item.address.postcode} {item.address.municipality} {item.address.city}</strong> 
                    <small>({item.display_name})</small>
                  </div>)
                }
                </> : <div>Keine gültige Adresse gefunden</div>
              }
              </div> 
              : null
            }*/}

            <div className="row mt-1">
              <div className="col-12 col-md-6">
                <span className="p small ms-1">E-Mail</span>
                <input type="email" className="form-control" placeholder="max@mustermann.de" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <span className="p small ms-1">Telefon</span>
                <input type="tel" className="form-control" placeholder="+49 711 123 456 67" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12 col-md-4">
                <span className="p small ms-1">
                  <span>Suchradius in Kilometern </span>
                  <span className="fw-bold">({allDistancesOfUsers?.filter(d => d <= formSearchRadius)?.length} betreffende User) <br/></span>
                  {allDistancesOfUsers?.filter(d => d <= formSearchRadius)?.length > 500 ? <span className="fw-bold text-danger">Maximal 500 User möglich. Bitte Suchradius verkleinern!</span> : null}
                </span>
                <input type="number" className="form-control" placeholder="3" value={formSearchRadius} onChange={(e) => setFormSearchRadius(e.target.value)} required />
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12">
                <span className="p small ms-1">Benötigte Tätigkeiten</span>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('go_walk') ? [...formSupportingActivity, ...['go_walk']] : formSupportingActivity.filter(i => i !== 'go_walk'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('go_walk') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Gassi gehen</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('veterinary_trips') ? [...formSupportingActivity, ...['veterinary_trips']] : formSupportingActivity.filter(i => i !== 'veterinary_trips'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('veterinary_trips') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Tierarztfahrten</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('animal_care') ? [...formSupportingActivity, ...['animal_care']] : formSupportingActivity.filter(i => i !== 'animal_care'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('animal_care') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Hilfe bei der Tierpflege</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('events') ? [...formSupportingActivity, ...['events']] : formSupportingActivity.filter(i => i !== 'events'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('events') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Hilfe bei Veranstaltungen</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('baking_cooking') ? [...formSupportingActivity, ...['baking_cooking']] : formSupportingActivity.filter(i => i !== 'baking_cooking'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('baking_cooking') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Backen und Kochen</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('creative_workshop') ? [...formSupportingActivity, ...['creative_workshop']] : formSupportingActivity.filter(i => i !== 'creative_workshop'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('creative_workshop') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Kreativworkshops</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('public_relation') ? [...formSupportingActivity, ...['public_relation']] : formSupportingActivity.filter(i => i !== 'public_relation'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('public_relation') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Öffentlichkeitsarbeit</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('light_office_work') ? [...formSupportingActivity, ...['light_office_work']] : formSupportingActivity.filter(i => i !== 'light_office_work'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('light_office_work') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Leichte Büroarbeiten</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('graphic_work') ? [...formSupportingActivity, ...['graphic_work']] : formSupportingActivity.filter(i => i !== 'graphic_work'))}>
                    <div className="col-2 text-center"><i className={formSupportingActivity.includes('graphic_work') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Grafische Arbeiten</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row justify-content-center mt-4">
              <div className="col-12">
                <span className="p small ms-1">Benötigte Erfahrungen mit Tierarten</span>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('dog') ? [...formExperienceWithAnimal, ...['dog']] : formExperienceWithAnimal.filter(i => i !== 'dog'))}>
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('dog') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Hund</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('cat') ? [...formExperienceWithAnimal, ...['cat']] : formExperienceWithAnimal.filter(i => i !== 'cat'))}>
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('cat') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Katze</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('small_animal') ? [...formExperienceWithAnimal, ...['small_animal']] : formExperienceWithAnimal.filter(i => i !== 'small_animal'))}>
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('small_animal') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Kleintiere</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('bird') ? [...formExperienceWithAnimal, ...['bird']] : formExperienceWithAnimal.filter(i => i !== 'bird'))}>
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('bird') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Vögel</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('other') ? [...formExperienceWithAnimal, ...['other']] : formExperienceWithAnimal.filter(i => i !== 'other'))}>
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('other') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start">Sonstiges</div>
                  </div>
                  {formExperienceWithAnimal.includes('other') ? <>
                  <div className="row cursor-pointer align-items-center">
                    <div className="col-12">
                      <input type="text" name="formExperienceWithAnimalOther" className="form-control mt-2" placeholder="Tierart" value={formExperienceWithAnimalOther} onChange={(e) => setFormExperienceWithAnimalOther(e.target.value)} required />
                    </div>
                  </div>
                  </> : null}
                </div>
              </div>
            </div>
          </div>
        </form>

      </Wrapper>
    </>
  )
}
