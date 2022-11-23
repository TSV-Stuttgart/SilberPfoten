import FreestandingFooter from '../components/FreestandingFooter'
import FreestandingHeader from '../components/FreestandingHeader'
import jwt from 'jsonwebtoken'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import {useRouter} from 'next/router'

export async function getServerSideProps() {
  const csrf = jwt.sign({}, process.env.JWT_SECRET, {expiresIn: '10m'})

  return {
    props: {
      csrf,
    }
  }
}

export default function Registrieren({csrf}) {
  const router = useRouter()
  const [formError, setFormError] = useState(false)
  const [formGender, setFormGender] = useState('')
  const [formFirstname, setFormFirstname] = useState('')
  const [formLastname, setFormLastname] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formBirthdate, setFormBirthdate] = useState('')
  const [formJobTitle, setFormJobTitle] = useState('')
  const [formStreet, setFormStreet] = useState('')
  const [formStreetNumber, setFormStreetNumber] = useState('')
  const [formZipcode, setFormZipcode] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formAutoCompleteValues, setFormAutoCompleteValues] = useState('')
  const [autoCompleteTimeoutId, setAutoCompleteTimeoutId] = useState(undefined)
  const [autoCompleteIsLoading, setAutoCompleteIsLoading] = useState(false)
  const [formSupportingActivity, setFormSupportingActivity] = useState([])
  const [formExperienceWithAnimal, setFormExperienceWithAnimal] = useState([])
  const [formExperienceWithAnimalOther, setFormExperienceWithAnimalOther] = useState('')
  const [formBecameAwareThrough, setFormBecameAwareThrough] = useState([])
  const [formBecameAwareThroughOther, setFormBecameAwareThroughOther] = useState('')

  useEffect(() => {

    searchAddress(formStreet)
  }, [formStreet])

  const setAddress = (osmObject) => {
    console.log(osmObject)
    setFormStreet(osmObject.address.road || '')
    setFormStreetNumber(osmObject.address.house_number || '')
    setFormZipcode(osmObject.address.postcode || '')
    setFormCity(osmObject.address.village || '')

    setFormAutoCompleteValues('')
  }

  const searchAddress = async (value) => {

    if (formStreet && formStreetNumber && formZipcode && formCity) {
      return
    }
    
    if (value.length > 10) {
      setAutoCompleteIsLoading(true)
    }

    if (autoCompleteTimeoutId) {
      clearTimeout(autoCompleteTimeoutId)
    }

    const timeoutId = setTimeout(async () => {
      if (value.length > 10) {
        const locations = await (await fetch(`https://nominatim.openstreetmap.org/search/${value}?format=json&addressdetails=1&limit=5&email=info@silberpfoten.de`)).json()

        setFormAutoCompleteValues(locations)
        setAutoCompleteIsLoading(false)
      }
    }, 1000)

    setAutoCompleteTimeoutId(timeoutId)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const signupRequest = await fetch(`/api/signup`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        csrf,
        gender: formGender,
        firstname: formFirstname,
        lastname: formLastname,
        email: formEmail,
        phone: formPhone,
        birthdate: formBirthdate,
        job: formJobTitle,
        street: formStreet,
        street_number: formStreetNumber,
        zipcode: formZipcode,
        city: formCity,
        support_activity: formSupportingActivity,
        experience_with_animal: formExperienceWithAnimal,
        experience_with_animal_other: formExperienceWithAnimalOther,
        became_aware_through: formBecameAwareThrough,
        became_aware_through_other: formBecameAwareThroughOther,
      })
    })

    const signupRequestResponse = await signupRequest.json()

    if (signupRequestResponse.status === 200) {
      router.push(`/signup/verify/code?token=${signupRequestResponse.token}`)
    }

    else if (signupRequestResponse.status === 500) {
      setFormError(true)
      document.documentElement.scrollTop = 0
    }
  }

  return (<>

    <FreestandingHeader />

    {formError ? <>
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <div className="rounded bg-light p-2">
            <div className="p fw-bold">Hups! Da ist etwas schief gelaufen</div>
            <div className="p fw-normal mt-3">Dein Sicherheitsschlüssel ist abgelaufen (10 Minuten). <br/>Bitte versuche es erneut.</div>
          </div>
        </div>
      </div>
    </div>
    </> : null}

    <form onSubmit={(e) => handleSubmit(e)}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4 text-center">
            <div className="fw-bold mt-4 mb-4">Werde jetzt ehrenamtlicher Helfer</div>
            <select className="form-control" name="gender" value={formGender} onChange={(e) => setFormGender(e.target.value)} required autoFocus>
              <option value="">Keine Angabe</option>
              <option value="female">Frau</option>
              <option value="male">Herr</option>
              <option value="diverse">Divers</option>
            </select>
            <input type="text" name="firstname" className="form-control mt-2" placeholder="Vorname" value={formFirstname} onChange={(e) => setFormFirstname(e.target.value)} required />
            <input type="text" name="lastname" className="form-control mt-2" placeholder="Nachname" value={formLastname} onChange={(e) => setFormLastname(e.target.value)} required />
            <input type="email" name="email" className="form-control mt-3" placeholder="E-Mail" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
            <input type="tel" name="phone" className="form-control mt-2" placeholder="Telefon" minLength="10" maxLength="20" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            <div className="text-start mt-3 ms-1">Geburtsdatum</div>
            <input type="date" name="birthdate" className="form-control mt-1" placeholder="Geburtsdatum" value={formBirthdate} onChange={(e) => setFormBirthdate(e.target.value)} max={new Date().toISOString().slice(0,10)} required />
            <input type="text" name="jobtitle" className="form-control mt-2" placeholder="Beruf" value={formJobTitle} onChange={(e) => setFormJobTitle(e.target.value)} required />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mt-3 ms-1">Anschrift</div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-9 col-md-4 col-lg-3 text-center">
            <input type="text" name="street" className="form-control mt-1" placeholder="Strasse" value={formStreet} onChange={(e) => setFormStreet(e.target.value)} required />
          </div>
          <div className="col-3 col-md-2 col-lg-1 text-center">
            <input type="text" name="streetnumber" className="form-control mt-1" placeholder="Hausnr." value={formStreetNumber} onChange={(e) => setFormStreetNumber(e.target.value)} required />
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-4 col-md-2 col-lg-1 text-center">
            <input type="text" name="zipcode" className="form-control mt-1" placeholder="PLZ" value={formZipcode} onChange={(e) => setFormZipcode(e.target.value)} required />
          </div>
          <div className="col-8 col-md-4 col-lg-3 text-center">
            <input type="text" name="city" className="form-control mt-1" placeholder="Stadt" value={formCity} onChange={(e) => setFormCity(e.target.value)} required />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4 text-center">
            <div className="">
              {formAutoCompleteValues || autoCompleteIsLoading ? <>
              <div className="text-start border rounded-bottom p-2 bg-light">
                {autoCompleteIsLoading ? <div className="">Suchergebnise werden geladen...</div> : null}
                {formAutoCompleteValues && formAutoCompleteValues?.map(item => <div key={item.place_id} className="p-1" onClick={() => setAddress(item)}>{item.address.road} {item.address.house_number}, {item.address.postcode} {item.address.municipality} {item.address.city}</div>)}
              </div>
              </> : null}
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mt-3 ms-1 fw-bold">Folgende unterstützende Tätigkeiten<br/>kann ich anbieten</div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('go_walk') ? [...formSupportingActivity, ...['go_walk']] : formSupportingActivity.filter(i => i !== 'go_walk'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('go_walk') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Gassi gehen</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('veterinary_trips') ? [...formSupportingActivity, ...['veterinary_trips']] : formSupportingActivity.filter(i => i !== 'veterinary_trips'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('veterinary_trips') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Tierarztfahrten</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('animal_care') ? [...formSupportingActivity, ...['animal_care']] : formSupportingActivity.filter(i => i !== 'animal_care'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('animal_care') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Hilfe bei der Tierpflege</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('events') ? [...formSupportingActivity, ...['events']] : formSupportingActivity.filter(i => i !== 'events'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('events') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Hilfe bei Veranstaltungen</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('baking_cooking') ? [...formSupportingActivity, ...['baking_cooking']] : formSupportingActivity.filter(i => i !== 'baking_cooking'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('baking_cooking') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Backen und Kochen</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('creative_workshop') ? [...formSupportingActivity, ...['creative_workshop']] : formSupportingActivity.filter(i => i !== 'creative_workshop'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('creative_workshop') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Kreativworkshops</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('public_relation') ? [...formSupportingActivity, ...['public_relation']] : formSupportingActivity.filter(i => i !== 'public_relation'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('public_relation') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Öffentlichkeitsarbeit</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('light_office_work') ? [...formSupportingActivity, ...['light_office_work']] : formSupportingActivity.filter(i => i !== 'light_office_work'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('light_office_work') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Leichte Büroarbeiten</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormSupportingActivity(!formSupportingActivity.includes('graphic_work') ? [...formSupportingActivity, ...['graphic_work']] : formSupportingActivity.filter(i => i !== 'graphic_work'))}>
                <div className="col-2 text-center"><i className={formSupportingActivity.includes('graphic_work') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Grafische Arbeiten</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mt-3 ms-1 fw-bold">Ich habe Erfahrung mit folgenden Tierarten</div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('dog') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('dog') ? [...formExperienceWithAnimal, ...['dog']] : formExperienceWithAnimal.filter(i => i !== 'dog'))}>Hund</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('cat') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('cat') ? [...formExperienceWithAnimal, ...['cat']] : formExperienceWithAnimal.filter(i => i !== 'cat'))}>Katze</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('small_animal') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('small_animal') ? [...formExperienceWithAnimal, ...['small_animal']] : formExperienceWithAnimal.filter(i => i !== 'small_animal'))}>Kleintiere</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('bird') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('bird') ? [...formExperienceWithAnimal, ...['bird']] : formExperienceWithAnimal.filter(i => i !== 'bird'))}>Vögel</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
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
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mt-3 ms-1 fw-bold">Ich bin auf Silberpfoten aufmerksam geworden über</div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('facebook') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('facebook') ? [...formBecameAwareThrough, ...['facebook']] : formBecameAwareThrough.filter(i => i !== 'facebook'))}>Facebook</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('instagram') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('instagram') ? [...formBecameAwareThrough, ...['instagram']] : formBecameAwareThrough.filter(i => i !== 'instagram'))}>Instagram</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('internet') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('internet') ? [...formBecameAwareThrough, ...['internet']] : formBecameAwareThrough.filter(i => i !== 'internet'))}>Internet</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('press') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('press') ? [...formBecameAwareThrough, ...['press']] : formBecameAwareThrough.filter(i => i !== 'press'))}>Presse</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('friend') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('friend') ? [...formBecameAwareThrough, ...['friend']] : formBecameAwareThrough.filter(i => i !== 'friend'))}>Freunde/Familie/Bekannte</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('other') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('other') ? [...formBecameAwareThrough, ...['other']] : formBecameAwareThrough.filter(i => i !== 'other'))}>Sonstiges</div>
              </div>
              {formBecameAwareThrough.includes('other') ? <>
              <div className="row cursor-pointer align-items-center">
                <div className="col-12">
                  <input type="text" name="formBecameAwareThroughOther" className="form-control mt-2" placeholder="" value={formBecameAwareThroughOther} onChange={(e) => setFormBecameAwareThroughOther(e.target.value)} required />
                </div>
              </div>
              </> : null}
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4 text-end">
            <button className="btn btn-primary w-100 mt-4" type="submit">Absenden</button>
          </div>
        </div>
      </div>
    </form>

    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <Link href="/"><a className="p">Vorgang abbrechen</a></Link>
        </div>
      </div>
    </div>

    <FreestandingFooter />

  </>)
}