import React, {useEffect, useState} from 'react'
import {useSWRConfig} from 'swr'
import {useRouter} from 'next/router'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Wrapper from '../components/Wrapper'
import useSession from '../lib/auth/useSession'

export default function Profile() {
  const {session} = useSession()
  const router = useRouter()
  const {emailSuccess} = router.query

  const {mutate} = useSWRConfig()
  
  const member = session?.user

  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formBirthdate, setFormBirthdate] = useState('')
  const [formJobTitle, setFormJobTitle] = useState('')
  const [formStreet, setFormStreet] = useState('')
  const [formStreetNumber, setFormStreetNumber] = useState('')
  const [formZipcode, setFormZipcode] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formSupportingActivity, setFormSupportingActivity] = useState([])
  const [formExperienceWithAnimal, setFormExperienceWithAnimal] = useState([])
  const [formExperienceWithAnimalOther, setFormExperienceWithAnimalOther] = useState('')

  const [isSavedSuccess, setIsSavedSuccess] = useState(false)
  const [isEmailChangeStarted, setIsEmailChangeStarted] = useState(false)
  const [isEmailChangedSuccess, setIsEmailChangedSuccess] = useState(false)

  //const [focusOut, setFocusOut] = useState(false)
  //const [formAutoCompleteValues, setFormAutoCompleteValues] = useState('')
  //const [placeId, setPlaceId] = useState('')
  //const [coordLat, setCoordLat] = useState('')
  //const [coordLon, setCoordLon] = useState('')

  useEffect(() => {
    setFormEmail(member?.email || '')
    setFormPhone(member?.phone || '')
    setFormBirthdate(member?.birthdate || '')
    setFormJobTitle(member?.job || '')
    setFormStreet(member?.street || '')
    setFormStreetNumber(member?.street_number || '')
    setFormZipcode(member?.zipcode || '')
    setFormCity(member?.city || '')
    setFormSupportingActivity(member?.support_activity.split(',') || [])
    setFormExperienceWithAnimal(member?.experience_with_animal?.split(',') || [])
    setFormExperienceWithAnimalOther(member?.experience_with_animal_other || '')
    //setCoordLat(member?.lat)
    //setCoordLon(member?.lon)
    if (emailSuccess === '1') setIsEmailChangedSuccess(true)
  }, [member, emailSuccess])

  //useEffect(() => {

  //  if (focusOut && formStreet && formStreetNumber && formZipcode && formCity) {
  //    searchAddress(`${formStreet},${formStreetNumber},${formZipcode},${formCity}`)
  //  }
  //  else {
  //    setFocusOut(false)
  //  }

  //}, [formStreet, formStreetNumber, formZipcode, formCity, focusOut])

  //const searchAddress = async (value) => {
  //  const location = await (await fetch(`https://nominatim.openstreetmap.org/search/${value}?format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=5&email=info@silberpfoten.de`)).json()

  //  setFormAutoCompleteValues(location)
  //  setFocusOut(false)
  //}

  //const resetCoords = () => {
  //  setPlaceId('')
  //}

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsEmailChangeStarted(false)
    setIsEmailChangedSuccess(false)

    const updateRequest = await fetch(`/api/profile`, {
      method: 'PATCH', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: formEmail,
        phone: formPhone,
        birthdate: formBirthdate,
        job: formJobTitle,
        street: formStreet,
        streetNumber: formStreetNumber,
        zipcode: formZipcode,
        city: formCity,
        support_activity: formSupportingActivity,
        experience_with_animal: formExperienceWithAnimal,
        experience_with_animal_other: formExperienceWithAnimalOther,
      })
    })

    if (updateRequest.status === 200) {
      mutate(`/api/auth/session`)
      setIsSavedSuccess(true)

      const data = await updateRequest.json()
      if (data.changeEmail) {
        setIsEmailChangeStarted(true)
        window.scrollTo(0, 0)
      }

      return
    }

    else if (updateRequest.status === 500) {
      return <Error />
    }
  }

  if (!member) return <Loading />

  if (!session) {
    router.push('/signin')

    return
  }

  const handleAccountDeletion = async (wrongInput = false) => {
    const confirmed = prompt(`'Möchtest du wirklich deinen Account vollständig und unwiderruflich löschen? Falls ja, bestätige mit "JETZT LÖSCHEN"' ${wrongInput ? 'Falsche Eingabe' : ''}`, [])

    if (confirmed === 'JETZT LÖSCHEN') {
      const deleteUserRequest = await fetch(`/api/profile`, {method: 'DELETE'})

      if (deleteUserRequest.status === 200) {

        router.push(`/signin`)
      }

    }
    else if (confirmed !== null) {
      handleAccountDeletion(true)
    }
  }

  return <>
    <Wrapper>

      <div className="container mt-3">
        <div className="row">
          <div className="col">
            <div className="fw-bold h3">
              {member.lastname}, {member.firstname}
              <span className="ms-2">(
                {member.gender === 'male' ? <>Herr</> : null} 
                {member.gender === 'female' ? <>Frau</> : null} 
                {member.gender === 'diverse' ? <>Divers</> : null} 
              )</span>
            </div>
          </div>
        </div>
      </div>

      <form className="container mt-2" onSubmit={(e) => handleSubmit(e)}>
        <div className="row mt-3">
          <div className="col-12">
            <span className="small">E-Mail</span>
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-12">
            <input type="email" name="email" className="form-control" placeholder="E-Mail-Adresse" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
            {isEmailChangeStarted
              ? <div className="ms-0">
                  <span className="form-text text-warning fw-bold">
                    <i className="bi bi-hourglass"></i> E-Mail Änderung muss separat in der E-Mail, die wir dir soeben gesandt haben, bestätigt werden.
                  </span>
                </div>
              : null
              }
              {isEmailChangedSuccess
              ? <div className="ms-0">
                  <span className="form-text text-success fw-bold">
                    <i className="bi bi-check-lg"></i>Deine E-Mail-Adresse wurde erfolgreich geändert. Verwende diese ab jetzt um dich einzuloggen.
                  </span>
                </div>
              : null
              }
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <span className="small">Telefon</span>
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-12">
            <input type="tel" name="phone" className="form-control" placeholder="Telefon" minLength="10" maxLength="20" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <span className="small">Geburtsdatum</span>
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-12">
            <input type="date" name="birthdate" className="form-control" placeholder="Geburtsdatum" value={formBirthdate} onChange={(e) => setFormBirthdate(e.target.value)} max={new Date().toISOString().slice(0,10)} required />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <span className="small">Beruf</span>
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-12">
            <input type="text" name="jobtitle" className="form-control" placeholder="Beruf" value={formJobTitle} onChange={(e) => setFormJobTitle(e.target.value)} required />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <span className="small">Anschrift</span>
          </div>
        </div>

        <div className="row mt-1">
          <div className="col-9">
            <input type="text" name="street" className="form-control" placeholder="Strasse" value={formStreet} onChange={(e) => setFormStreet(e.target.value)} required />
          </div>
          <div className="col-3">
            <input type="text" name="streetnumber" className="form-control" placeholder="Hausnr." value={formStreetNumber} onChange={(e) => setFormStreetNumber(e.target.value)} required />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-4">
            <input type="text" name="zipcode" className="form-control" placeholder="PLZ" value={formZipcode} onChange={(e) => setFormZipcode(e.target.value)} required />
          </div>
          <div className="col-8">
            <input type="text" name="city" className="form-control" placeholder="Stadt" value={formCity} onChange={(e) => setFormCity(e.target.value)} required />
          </div>
        </div>

        {/*<div className="row mt-1">
          <div className="col-9">
            <input type="text" name="street" className="form-control" placeholder="Strasse" value={formStreet} onChange={(e) => { setFormStreet(e.target.value); resetCoords() }} onBlur={() => setFocusOut(true)} required />
          </div>
          <div className="col-3">
            <input type="text" name="streetnumber" className="form-control" placeholder="Hausnr." value={formStreetNumber} onChange={(e) => { setFormStreetNumber(e.target.value); resetCoords() }} onBlur={() => setFocusOut(true)} required />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-4">
            <input type="text" name="zipcode" className="form-control" placeholder="PLZ" value={formZipcode} onChange={(e) => { setFormZipcode(e.target.value); resetCoords() }} onBlur={() => setFocusOut(true)} required />
          </div>
          <div className="col-8">
            <input type="text" name="city" className="form-control" placeholder="Stadt" value={formCity} onChange={(e) => { setFormCity(e.target.value); resetCoords() }} onBlur={() => setFocusOut(true)} required />
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

        <div className="row justify-content-center mt-4">
          <div className="col-12">
            <div className="mt-3 ms-1 fw-bold">Folgende unterstützende Tätigkeiten<br/>kann ich anbieten</div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('go_walk') ? [...formSupportingActivity, ...['go_walk']] : formSupportingActivity.filter(i => i !== 'go_walk'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('go_walk') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Gassi gehen</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('veterinary_trips') ? [...formSupportingActivity, ...['veterinary_trips']] : formSupportingActivity.filter(i => i !== 'veterinary_trips'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('veterinary_trips') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Tierarztfahrten</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('animal_care') ? [...formSupportingActivity, ...['animal_care']] : formSupportingActivity.filter(i => i !== 'animal_care'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('animal_care') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Hilfe bei der Tierpflege</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('events') ? [...formSupportingActivity, ...['events']] : formSupportingActivity.filter(i => i !== 'events'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('events') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Hilfe bei Veranstaltungen</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('baking_cooking') ? [...formSupportingActivity, ...['baking_cooking']] : formSupportingActivity.filter(i => i !== 'baking_cooking'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('baking_cooking') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Backen und Kochen</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('creative_workshop') ? [...formSupportingActivity, ...['creative_workshop']] : formSupportingActivity.filter(i => i !== 'creative_workshop'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('creative_workshop') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Kreativworkshops</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('public_relation') ? [...formSupportingActivity, ...['public_relation']] : formSupportingActivity.filter(i => i !== 'public_relation'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('public_relation') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Öffentlichkeitsarbeit</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('light_office_work') ? [...formSupportingActivity, ...['light_office_work']] : formSupportingActivity.filter(i => i !== 'light_office_work'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('light_office_work') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Leichte Büroarbeiten</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
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
            <div className="mt-3 ms-1 fw-bold">Ich habe Erfahrung mit folgenden Tierarten</div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('dog') ? [...formExperienceWithAnimal, ...['dog']] : formExperienceWithAnimal.filter(i => i !== 'dog'))}>
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('dog') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Hund</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('cat') ? [...formExperienceWithAnimal, ...['cat']] : formExperienceWithAnimal.filter(i => i !== 'cat'))}>
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('cat') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Katze</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('small_animal') ? [...formExperienceWithAnimal, ...['small_animal']] : formExperienceWithAnimal.filter(i => i !== 'small_animal'))}>
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('small_animal') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Kleintiere</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('bird') ? [...formExperienceWithAnimal, ...['bird']] : formExperienceWithAnimal.filter(i => i !== 'bird'))}>
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('bird') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Vögel</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
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
        <div className="row justify-content-end">
          <div className="col-12 col-md-6 col-lg-4 text-end">
            {/*{isSavedSuccess
              ? <button className="btn btn-primary w-100 mt-4" disabled>Erfolgreich gespeichert <i className="bi bi-check"></i></button>
              : <>
                { !placeId && formAutoCompleteValues
                  ? <button className="btn btn-primary w-100 mt-4" type="submit" disabled>Änderungen speichern</button>
                  : <button className="btn btn-primary w-100 mt-4" type="submit">Änderungen speichern</button>
                }
                </>   
            }*/}
            
            {isSavedSuccess
              ? <button className="btn btn-primary w-100 mt-4" disabled>Erfolgreich gespeichert <i className="bi bi-check"></i></button>
              : <button className="btn btn-primary w-100 mt-4" type="submit">Änderungen speichern</button>
            }
          </div>
        </div>
        <div className="row justify-content-center mt-5">
          <div className="col-12">
            <div className="bg-white border border-danger rounded p-2">
              <div className="fw-bold">Account löschen?</div>
              <div className="fw-normal">Hier kannst du deinen Account vollständig und unwiderruflich löschen.</div>
              <button className="btn btn-danger px-4 mt-4" onClick={() => handleAccountDeletion()}>Account löschen</button>
            </div>
          </div>
        </div>
      </form>

    </Wrapper>
  </>
}