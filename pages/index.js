import React, {useEffect, useState} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import {useRouter} from 'next/router'
import useSession from '../lib/auth/useSession'
import Wrapper from '../components/Wrapper'
import Error from '../components/Error'
import Loading from '../components/Loading'
import SessionExpired from '../components/SessionExpired'
import dynamic from 'next/dynamic'
import ReactHtmlParser from 'react-html-parser'

import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), {ssr: false})

export default function Home() {
  const router = useRouter()
  const {mutate} = useSWRConfig()
  const {data: messages, error: messagesError} = useSWR(`/api/messages`, (url) => fetch(url).then(r => r.json()))
  const {session} = useSession()

  const [formDescription, setFormDescription] = useState('')
  const [formMessageType, setFormMessageType] = useState('message')
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
  const [formShowMessageForm, setFormShowMessageForm] = useState(false)
  
  const [formSupportingActivity, setFormSupportingActivity] = useState([])
  const [formExperienceWithAnimal, setFormExperienceWithAnimal] = useState([])
  const [formExperienceWithAnimalOther, setFormExperienceWithAnimalOther] = useState('')

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  const deleteMessage = async (messageId) => {
    await fetch(`/api/admin/message?messageId=${messageId}`, {method: 'DELETE'})
  
    mutate(`/api/messages`)
  }

  const acceptCase = async (messageId) => {
    await fetch(`/api/message/accept?messageId=${messageId}`, {method: 'POST'})
  
    mutate(`/api/messages`)
  }

  const cancelAcceptedCase = async (messageId) => {
    await fetch(`/api/message/accept?messageId=${messageId}`, {method: 'DELETE'})
  
    mutate(`/api/messages`)
  }

  if (messagesError) return <Error />
  if (!messages && !messagesError) return <Loading />
  if (!session) {
    router.push('/signin')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postRequest = await fetch(`/api/admin/message`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: formMessageType,
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
      })
    })

    if (postRequest.status === 200) {
      mutate(`/api/messages`)

      setFormShowMessageForm(false)
    }

    else if (postRequest.status === 500) {
      return <Error />
    }
  }

  return (
    <>
      <Wrapper>

        <div className="container mt-3">
          <div className="row">
            <div className="col-7">
              <div className="fw-bold h3">Nachrichten</div>
            </div>
            <div className="col-5 text-end">
              <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className="btn btn-secondary" onClick={() => setFormShowMessageForm(true)}>Neue Nachricht</button>
              </div>
            </div>
          </div>
        </div>

        {formShowMessageForm ? <>
        <form className="container mt-3" onSubmit={(e) => handleSubmit(e)}>
          <div className="row">
            <div className="col-12">
              <div className="p-2">
                <div className="row align-items-center">
                  <div className="col-1 text-center">
                    <i className="bi bi-pencil-fill" style={{fontSize:18}}></i>
                  </div>
                  <div className="col-11">
                    <span className="p">Welche Art Nachricht möchtest du verfassen?</span>
                  </div>
                </div>
                <div className="row mt-1 align-items-center">
                  <div className="col-11 offset-1">
                    <div className="btn-group" role="group" aria-label="Basic example">
                      <button type="button" className={`btn btn-light ${formMessageType === 'message' ? 'active' : ''}`} onClick={() => setFormMessageType('message')}>Nachricht</button>
                      <button type="button" className={`btn btn-light ${formMessageType === 'case' ? 'active' : ''}`} onClick={() => setFormMessageType('case')}>Suchauftrag</button>
                    </div>
                  </div>
                </div>
                {formMessageType === 'case' ? <>
                <div className="row mt-3">
                  <div className="col-12 col-md-3 offset-md-1">
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
                  <div className="col-12 col-md-8 offset-md-1">
                    <span className="p small ms-1">Straße</span>
                    <input type="text" className="form-control" placeholder="Musterstraße" value={formStreet} onChange={(e) => setFormStreet(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-3">
                    <span className="p small ms-1">Hausnummer</span>
                    <input type="tel" className="form-control" placeholder="28" value={formStreetNumber} onChange={(e) => setFormStreetNumber(e.target.value)} required />
                  </div>
                </div>
                <div className="row mt-1">
                  <div className="col-12 col-md-3 offset-md-1">
                    <span className="p small ms-1">Postleitzahl</span>
                    <input type="tel" className="form-control" placeholder="70199" value={formZipcode} onChange={(e) => setFormZipcode(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-8">
                    <span className="p small ms-1">Stadt</span>
                    <input type="text" className="form-control" placeholder="Musterstadt" value={formCity} onChange={(e) => setFormCity(e.target.value)} required />
                  </div>
                </div>
                <div className="row mt-1">
                  <div className="col-12 col-md-4 offset-md-1">
                    <span className="p small ms-1">E-Mail</span>
                    <input type="email" className="form-control" placeholder="max@mustermann.de" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-3">
                    <span className="p small ms-1">Telefon</span>
                    <input type="tel" className="form-control" placeholder="+49 711 123 456 67" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12 col-md-3 offset-md-1">
                    <span className="p small ms-1">Suchradius in Kilometern</span>
                    <input type="number" className="form-control" placeholder="10" value={formSearchRadius} onChange={(e) => setFormSearchRadius(e.target.value)} required />
                  </div>
                </div>



                <div className="row mt-4">
                  <div className="col-12 col-md-11 offset-md-1">
                    <span className="p small ms-1">Benötigte Tätigkeiten</span>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('go_walk') ? [...formSupportingActivity, ...['go_walk']] : formSupportingActivity.filter(i => i !== 'go_walk'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('go_walk') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Gassi gehen</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('veterinary_trips') ? [...formSupportingActivity, ...['veterinary_trips']] : formSupportingActivity.filter(i => i !== 'veterinary_trips'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('veterinary_trips') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Tierarztfahrten</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('animal_care') ? [...formSupportingActivity, ...['animal_care']] : formSupportingActivity.filter(i => i !== 'animal_care'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('animal_care') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Hilfe bei der Tierpflege</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('events') ? [...formSupportingActivity, ...['events']] : formSupportingActivity.filter(i => i !== 'events'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('events') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Hilfe bei Veranstaltungen</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('baking_cooking') ? [...formSupportingActivity, ...['baking_cooking']] : formSupportingActivity.filter(i => i !== 'baking_cooking'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('baking_cooking') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Backen und Kochen</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('creative_workshop') ? [...formSupportingActivity, ...['creative_workshop']] : formSupportingActivity.filter(i => i !== 'creative_workshop'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('creative_workshop') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Kreativworkshops</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('public_relation') ? [...formSupportingActivity, ...['public_relation']] : formSupportingActivity.filter(i => i !== 'public_relation'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('public_relation') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Öffentlichkeitsarbeit</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('light_office_work') ? [...formSupportingActivity, ...['light_office_work']] : formSupportingActivity.filter(i => i !== 'light_office_work'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('light_office_work') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Leichte Büroarbeiten</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('graphic_work') ? [...formSupportingActivity, ...['graphic_work']] : formSupportingActivity.filter(i => i !== 'graphic_work'))}>
                        <div className="col-2 text-center"><i className={formSupportingActivity.includes('graphic_work') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start">Grafische Arbeiten</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row justify-content-center mt-4">
                  <div className="col-12 col-md-11 offset-md-1">
                    <span className="p small ms-1">Benötigte Erfahrungen mit Tierarten</span>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center">
                        <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('dog') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('dog') ? [...formExperienceWithAnimal, ...['dog']] : formExperienceWithAnimal.filter(i => i !== 'dog'))}>Hund</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center">
                        <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('cat') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('cat') ? [...formExperienceWithAnimal, ...['cat']] : formExperienceWithAnimal.filter(i => i !== 'cat'))}>Katze</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center">
                        <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('small_animal') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('small_animal') ? [...formExperienceWithAnimal, ...['small_animal']] : formExperienceWithAnimal.filter(i => i !== 'small_animal'))}>Kleintiere</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center">
                        <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('bird') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('bird') ? [...formExperienceWithAnimal, ...['bird']] : formExperienceWithAnimal.filter(i => i !== 'bird'))}>Vögel</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-light rounded p-2">
                      <div className="row cursor-pointer align-items-center">
                        <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('other') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                        <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('other') ? [...formExperienceWithAnimal, ...['other']] : formExperienceWithAnimal.filter(i => i !== 'other'))}>Sonstiges</div>
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
                </> : null}
                <div className="row mt-3 align-items-center">
                  <div className="col-12 col-md-11 offset-md-1">
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
                <div className="row mt-4 align-items-center justify-content-end">
                  <div className="col-6 col-md-8 col-lg-9 offset-1 text-end">
                    <span className="text-decoration-underline cursor-pointer" onClick={() => setFormShowMessageForm(false)}>Abbrechen</span>
                  </div>
                  <div className="col-5 col-md-3 col-lg-2 text-end">
                    <button type="submit" className="btn btn-secondary">Veröffentlichen</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        </> : null}

        {messages.map(message => <React.Fragment key={message.message_id}>
        <div className="container mt-3">
          <div className="row">
            <div className="col-12">
              <div className={`border-bottom pb-4 p-2 ${message.message_type === 'case' ? 'bg-light rounded-3' : ''}`}>
                <div className="row">
                  <div className="col-11 offset-1">
                    <span className="small">
                      {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
                    </span>
                  </div>
                </div>
                <div className="row align-items-center">
                  <div className="col-1 text-center">
                    {message.message_type === 'message' ? <i className="bi bi-info-circle-fill text-info" style={{fontSize:18}}></i> : null}
                    {message.message_type === 'case' ? <i className="bi bi-search-heart" style={{fontSize:18, color: '#748da6'}}></i> : null}
                  </div>
                  <div className="col-8">
                    {message.message_type === 'message' ? <span className="p fw-bold">Information</span> : null}
                    {message.message_type === 'case' ? <span className="p fw-bold rounded bg-white px-1">Suchauftrag in {message.zipcode} {message.city}</span> : null}
                  </div>
                  <div className="col-3 text-end">
                    <div className="dropdown">
                      <i className="bi bi-three-dots-vertical text-secondary cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false"></i>
                      <ul className="dropdown-menu">
                        <li><div className="dropdown-item cursor-pointer" onClick={() => deleteMessage(message.message_id)}>Nachricht löschen</div></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-11 offset-1">
                    <span className="small fw-light">Beschreibung</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-11 offset-1 ">
                    {ReactHtmlParser(message.message_text)}
                  </div>
                </div>
                {message.message_type === 'case' ? <>
                <div className="row mt-4">
                  <div className="col-11 offset-1 ">
                    <span className="fw-light">Erfahrung mit folgenden Tierarten</span>
                    <div className="text-break">{message.experience_with_animal?.split(',').map(e => <React.Fragment key={e}>
                      {e === 'dog' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Hund</span> : null}
                      {e === 'cat' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Katze</span> : null}
                      {e === 'bird' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Vogel</span> : null}
                      {e === 'small_animal' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Kleintiere</span> : null}
                      {e === 'other' ? <span className="bg-white me-1 rounded px-2 small text-secondary">{message.experience_with_animal_other}</span> : null}
                    </React.Fragment>)}</div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-11 offset-1 ">
                    <span className="fw-light">Benötigte Tätigkeiten</span>
                    <div className="text-break">{message.support_activity?.split(',').map(e => <React.Fragment key={e}>
                      {e === 'go_walk' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Gassi gehen</span> : null}
                      {e === 'veterinary_trips' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Tierarztfahrten</span> : null}
                      {e === 'animal_care' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Hilfe bei der Tierpflege</span> : null}
                      {e === 'events' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Hilfe bei Veranstaltungen</span> : null}
                      {e === 'baking_cooking' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Backen und Kochen</span> : null}
                      {e === 'creative_workshop' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Kreativworkshops</span> : null}
                      {e === 'public_relation' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Öffentlichkeitsarbeit</span> : null}
                      {e === 'light_office_work' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Leichte Büroarbeiten</span> : null}
                      {e === 'graphic_work' ? <span className="bg-white me-1 rounded px-2 small text-secondary">Grafische Arbeiten</span> : null}
                    </React.Fragment>)}</div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-11 offset-1 ">
                    <span className="fw-light">Kontaktdaten</span>
                    <div className="small">Die vollen Kontaktangaben werden dir angezeigt wenn du als Helfer akzeptiert wirst.</div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-11 offset-1 ">
                    Adresse: ****, 73760 Ostfildern
                  </div>
                </div>
                <div className="row mt-2 align-items-center">
                  <div className="col-12 text-end">
                    <div className="btn-group me-2" role="group">
                      {message?.accepted_case_memers?.includes(session.user.user_id) ? 
                        <button type="button" className={`btn btn-info`} onClick={() => cancelAcceptedCase(message.message_id)}><i className="bi bi-hearts text-dark"></i> Doch keine Hilfe anbieten</button> :
                        <button type="button" className={`btn btn-info`} onClick={() => acceptCase(message.message_id)}><i className="bi bi-hearts text-danger"></i> Hilfe anbieten</button>
                      }
                    </div>
                  </div>
                </div>
                <div className="row mt-2 align-items-center">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="">Angebotene Helfer</div>
                  </div>
                </div>
                <div className="row mt-2 align-items-center">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="bg-white rounded p-2">
                      <div className="row">
                        <div className="col-1 border-end fw-bold">#</div>
                        <div className="col-3 border-end fw-bold">Name</div>
                        <div className="col-5 border-end fw-bold">Erfahrungen mit Tieren</div>
                        <div className="col-2 text-end fw-bold">Optionen</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-1 align-items-center">
                  <div className="col-12 col-md-11 offset-md-1">
                    <div className="p-2">
                      <div className="row">
                        <div className="col-1 border-end">12</div>
                        <div className="col-3 border-end">Bolognese, Francesca</div>
                        <div className="col-5 border-end">pill1, pill2</div>
                        <div className="col-2 text-end">...</div>
                      </div>
                    </div>
                  </div>
                </div>
                </> : null}
              </div>
            </div>
          </div>
        </div>
        </React.Fragment>)}

      </Wrapper>
    </>
  )
}
