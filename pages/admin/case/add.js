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

const ReactQuill = dynamic(() => import('react-quill'), {ssr: false})

export default function AdminCaseAdd() {
  const router = useRouter()
  const {session, error: sessionError} = useSession()

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
  
  const [formSupportingActivity, setFormSupportingActivity] = useState([])
  const [formExperienceWithAnimal, setFormExperienceWithAnimal] = useState([])
  const [formExperienceWithAnimalOther, setFormExperienceWithAnimalOther] = useState('')

  if (!session && !sessionError) return <Loading />

  // if (!session) {
  //   console.log("session", session)
  //   // router.push('/signin')
    
  //   return
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postRequest = await fetch(`/api/admin/message`, {
      method: 'POST', 
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
      })
    })

    if (postRequest.status === 200) {
      router.push('/admin/cases')
    }

    else if (postRequest.status === 500) {
      return <Error />
    }
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
            <div className="row mt-1">
              <div className="col-12 col-md-6">
                <span className="p small ms-1">E-Mail</span>
                <input type="email" className="form-control" placeholder="max@mustermann.de" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
              </div>
              <div className="col-12 col-md-6">
                <span className="p small ms-1">Telefon</span>
                <input type="tel" className="form-control" placeholder="+49 711 123 456 67" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12 col-md-4">
                <span className="p small ms-1">Suchradius in Kilometern</span>
                <input type="number" className="form-control" placeholder="10" value={formSearchRadius} onChange={(e) => setFormSearchRadius(e.target.value)} required />
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
                  <div className="row cursor-pointer align-items-center">
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('dog') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('dog') ? [...formExperienceWithAnimal, ...['dog']] : formExperienceWithAnimal.filter(i => i !== 'dog'))}>Hund</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center">
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('cat') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('cat') ? [...formExperienceWithAnimal, ...['cat']] : formExperienceWithAnimal.filter(i => i !== 'cat'))}>Katze</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center">
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('small_animal') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('small_animal') ? [...formExperienceWithAnimal, ...['small_animal']] : formExperienceWithAnimal.filter(i => i !== 'small_animal'))}>Kleintiere</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <div className="bg-light rounded p-2">
                  <div className="row cursor-pointer align-items-center">
                    <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('bird') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                    <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('bird') ? [...formExperienceWithAnimal, ...['bird']] : formExperienceWithAnimal.filter(i => i !== 'bird'))}>Vögel</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
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
          </div>
        </form>

      </Wrapper>
    </>
  )
}
