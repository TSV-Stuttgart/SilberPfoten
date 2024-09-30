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

  const [errorMessage, setErrorMessage] = useState('')

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
	const [formAddress, setFormAddress] = useState('')
	const [addressNotFoundChooseInput, setAddressNotFoundChooseInput] = useState(false)
  const [formNotice, setFormNotice] = useState(false)
  const [formRecordNotice, setFormRecordNotice] = useState(false)
	
  const [formSupportingActivity, setFormSupportingActivity] = useState([])
  const [formExperienceWithAnimal, setFormExperienceWithAnimal] = useState([])
  const [formExperienceWithAnimalOther, setFormExperienceWithAnimalOther] = useState('')
  const [formBecameAwareThrough, setFormBecameAwareThrough] = useState([])
  const [formBecameAwareThroughOther, setFormBecameAwareThroughOther] = useState('')
  const [formAutoCompleteValues, setFormAutoCompleteValues] = useState('')  

  const [timeoutId, setTimeoutId] = useState(undefined)
  const [selectedAddress, setSelectedAddress] = useState('')

  useEffect(() => {

    setFormEmail(router.query.email || '')

  }, [router.query.email])

  useEffect(() => {

    if (formAddress && formAddress.length > 20 && formAddress.match(/\d{4}/gm)) {
      searchAddress(formAddress)
    }

  }, [formAddress])

  const searchAddress = async (value) => {

    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(undefined)
    }

		const locationTimeoutId = setTimeout(async () => {			
			const location = await (await fetch(`https://nominatim.openstreetmap.org/search?q=${value}&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=5&countrycodes=de&dedupe=1&email=info@silberpfoten.de`)).json()

			setFormAutoCompleteValues(location)
			setSelectedAddress('')

		}, 500)

    setTimeoutId(locationTimeoutId)
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
        street: addressNotFoundChooseInput ? formStreet : selectedAddress?.address?.road,
        street_number: addressNotFoundChooseInput ? formStreetNumber : selectedAddress?.address?.house_number,
        zipcode: addressNotFoundChooseInput ? formZipcode : selectedAddress?.address?.postcode,
        city: addressNotFoundChooseInput ? formCity : selectedAddress?.address?.municipality,
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

    else if (signupRequestResponse.status === 409) {
      setErrorMessage('Diese E-Mail Adresse gibt es bereits in unserem System. Du kannst dich einfach damit einloggen.')
      document.documentElement.scrollTop = 0
    }

    else if (signupRequestResponse.status === 400) {
      setErrorMessage('Du must mindestens 18 Jahre alt sein.')
      document.documentElement.scrollTop = 0
    }

    else if (signupRequestResponse.status === 500) {
      setErrorMessage(<>Dein Sicherheitsschlüssel ist abgelaufen (10 Minuten). <br/>Bitte versuche es erneut.</>)
      document.documentElement.scrollTop = 0
    }
  }

  return (<>

    <FreestandingHeader />

    {errorMessage ? <>
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <div className="border bg-light p-2">

            <div className="p fw-bold">Hups! Da ist etwas schief gelaufen &#129300;</div>
            <div className="p fw-normal mt-3">{errorMessage}</div>
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
            <input type="tel" name="phone" className="form-control mt-2" placeholder="Telefon" minLength="10" maxLength="20" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
            <div className="text-start mt-3 ms-1">Geburtsdatum</div>
            <input type="date" name="birthdate" className="form-control mt-1" placeholder="Geburtsdatum" value={formBirthdate} max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().slice(0,10)} onChange={(e) => setFormBirthdate(e.target.value)} required />
            <input type="text" name="jobtitle" className="form-control mt-2" placeholder="Beruf" value={formJobTitle} onChange={(e) => setFormJobTitle(e.target.value)} required />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mt-3 ms-1">Anschrift</div>
          </div>
        </div>

				{!addressNotFoundChooseInput ? <>
					<div className="row justify-content-center">
						<div className="col-12 col-md-6 col-lg-4 text-center">
							<input type="text" name="street" className="form-control mt-1" placeholder="Adresse" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} required />
							<div className="text-muted text-start ms-1 mt-1">Beispiel: Mustermann Straße 12, 12345 Musterstadt</div>
						</div>
					</div>
				</> : <>
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
				</>}

        {formAutoCompleteValues ?
          <div className="row justify-content-center mt-3">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="border rounded p-2 bg-light">
              {formAutoCompleteValues?.length > 0 ? <>
                <div className="p-1 fw-bold">Wähle deine Adresse</div>

                {formAutoCompleteValues.map(item => 
                  <div key={item.place_id} className={`border-bottom mb-1 py-2 px-2 cursor-pointer ${selectedAddress?.place_id == item.place_id ? 'bg-white rounded' : ''}`} 
                    onClick={(e) => setSelectedAddress(item)}>
                    <div className="fw-bold">
                      {item.address.road} {item.address.house_number}, {item.address.postcode} {item.address.municipality} {item.address.city}</div> 
                    <div className="small">({item.display_name})</div>
                  </div>)
                }
                </> : <>
									{!addressNotFoundChooseInput ? <>
										<div className="">
											<div className="">Keine gültige Adresse gefunden</div>
											<div className="fw-bold">
												<span className="cursor-pointer" onClick={() => setAddressNotFoundChooseInput(true)}>&raquo; Trotzdem verwenden</span>
											</div>
										</div>
									</> : <>
										<div className="">
											<div className="fw-bold">
												<span className="cursor-pointer" onClick={() => setAddressNotFoundChooseInput(false)}>&raquo; zurück zur Adress-Suche</span>
											</div>
										</div>
									</>}
								</>
              }
              </div> 
            </div> 
          </div>
          : null
        }

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
              <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('dog') ? [...formExperienceWithAnimal, ...['dog']] : formExperienceWithAnimal.filter(i => i !== 'dog'))}>
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('dog') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Hund</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('cat') ? [...formExperienceWithAnimal, ...['cat']] : formExperienceWithAnimal.filter(i => i !== 'cat'))}>
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('cat') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Katze</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('small_animal') ? [...formExperienceWithAnimal, ...['small_animal']] : formExperienceWithAnimal.filter(i => i !== 'small_animal'))}>
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('small_animal') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Kleintiere</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('bird') ? [...formExperienceWithAnimal, ...['bird']] : formExperienceWithAnimal.filter(i => i !== 'bird'))}>
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('bird') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Vögel</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
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
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mt-3 ms-1 fw-bold">Ich bin auf Silberpfoten aufmerksam geworden über</div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('facebook') ? [...formBecameAwareThrough, ...['facebook']] : formBecameAwareThrough.filter(i => i !== 'facebook'))}>
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('facebook') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Facebook</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('instagram') ? [...formBecameAwareThrough, ...['instagram']] : formBecameAwareThrough.filter(i => i !== 'instagram'))}>
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('instagram') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Instagram</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('internet') ? [...formBecameAwareThrough, ...['internet']] : formBecameAwareThrough.filter(i => i !== 'internet'))}>
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('internet') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Internet</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('press') ? [...formBecameAwareThrough, ...['press']] : formBecameAwareThrough.filter(i => i !== 'press'))}>
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('press') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Presse</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('friend') ? [...formBecameAwareThrough, ...['friend']] : formBecameAwareThrough.filter(i => i !== 'friend'))}>
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('friend') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Freunde/Familie/Bekannte</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center" onClick={() => setFormBecameAwareThrough(!formBecameAwareThrough.includes('other') ? [...formBecameAwareThrough, ...['other']] : formBecameAwareThrough.filter(i => i !== 'other'))}>
                <div className="col-2 text-center"><i className={formBecameAwareThrough.includes('other') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start">Sonstiges</div>
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
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mt-3 ms-1 fw-bold">Hinweise</div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12 col-md-6 col-lg-4">
            <ul className="" style={{listStyleType: 'decimal'}}>
              <li>Ich bin volljährig und daran interessiert, als ehrenamtlicher Helfer die Initiative SilberPfoten zu unterstützen.</li>
              <li>Es ist mir bewusst, dass der Umgang mit Tieren Gefahren in sich birgt, wie z. B. eine Salmonelleninfektion, Tollwutgefahr bei Bissverletzungen oder Hirnhautentzündung durch einen Zeckenbiss. Ich weiß auch,  dass ich mich vor bestimmten Gefahren durch Impfungen schützen kann.</li>
              <li>
                Mit meiner Unterschrift verpflichte ich mich, mich an die Weisungen des Projektleiters und   ggf. des jeweiligen Tierhalters zu halten und insbesondere folgende Punkte einzuhalten:
                <ul>
                  <li>Hunde während des Ausführens nicht von der Leine zu lassen</li>
                  <li>Ausschließlich eine Führleine von max. 2 m Länge zu verwenden</li>
                  <li>Beißkorb-Anordnungen und -Empfehlungen zu befolgen</li>
                  <li>Futter und Leckerlis nur nach Absprache zu verabreichen</li>
                  <li>Örtliche Anordnungen zur Entfernung von Hundekot zu beachten</li>
                  <li>Alle besonderen Vorkommnisse zu melden, vor allem Beißereien mit anderen Hunden,   etwaige Deckakte, Angriffe auf sowie Anspringen von Menschen, Entlaufen, Körper-,   Gesundheits- und Sachschäden und jeden Schadensfall,</li>
                  <li>Mit dem Tierhalter vereinbarte Termine einzuhalten bzw. diese so rechtzeitig wie möglich   abzusagen, sollte ich verhindert sein.</li>
                </ul>
              </li>
              <li>Es ist mir bekannt, dass ich bei nicht (rechtzeitig) erfolgter, nicht vollständiger oder unwahrer Schadensmeldung unter Umständen selbst hafte, wie auch bei Vorsatz und grober Fahrlässigkeit.</li>
              <li>Es ist mir bekannt, dass ich über eine private Haftpflichtversicherung verfügen muss, welche auch  das Hüten fremder Hunde als Risiko umfasst.</li>
              <li>Mir ist bekannt, dass Verstöße gegen Leinen- und Beißkorbzwang auch zu zivil- und strafrechtlichen Konsequenzen führen können.</li>
              <li>Mir ist bewusst, dass die Mitnahme von anderen Personen, insbesondere von Kindern und Jugendlichen, zu Einsätzen für SilberPfoten allein in meiner Verantwortung liegt und diese Personen die Tiere nicht führen und betreuen dürfen. Für eventuelle Schadensfälle in Zusammenhang mit diesen Personen  wird seitens der Initiative und ihres Trägers keinerlei Haftung übernommen.</li>
              <li>Mit der Zusendung von E-Mails, die im Zusammenhang mit SilberPfoten und seinem Träger,  dem Tierschutzverein Stuttgart u. U. e.V. stehen, bin ich einverstanden.</li>
              <li>Mir ist bekannt, dass im Rahmen der Initiative die Daten zwischen Helfern und Hilfesuchenden  ggf. ausgetauscht werden. Die Datenschutzhinweise unter https://silberpfoten.de/datenschutz/  habe ich zur Kenntnis genommen.</li>
              <li>Ich bin darüber informiert, dass ich mich jederzeit schriftlich von der Teilnahme an SilberPfoten abmelden kann. Ebenso hat der Projektleiter das Recht, mich ohne Angabe von Gründen von  der Initiative abzumelden.</li>
            </ul>

            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><input type="checkbox" className="mt-1" onChange={() => setFormNotice(!formNotice)} checked={formNotice ? 'checked' : ''} required /></div>
                <div className="col-10 border-start">Ich habe die Hinweise gelesen und akzeptiere diese</div>
              </div>
            </div>

            <div className="bg-light rounded p-2 mt-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><input type="checkbox" className="mt-1" onChange={() => setFormRecordNotice(!formRecordNotice)} checked={formRecordNotice ? 'checked' : ''} required /></div>
                <div className="col-10 border-start">Mit der Veröffentlichung etwaiger von mir in Zusammenhang mit den Aktivitäten von SilberPfoten gemachten Bild- und Tonaufnahmen zum Zweck der Öffentlichkeitsarbeit der Initiative bzw. ihres Trägers bin ich einverstanden.*</div>
              </div>
            </div>

            <div className="mt-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-12">*Da nicht auszuschließen ist, dass auf Bildaufnahmen z. B. von Aktionen, Festen oder Veranstaltungen der Initiative und  ihres Trägers ehrenamtliche Helfer zu sehen sind, ist dieses Einverständnis zur rechtlichen Absicherung der Initiative notwendig.  Ohne das Einverständnis kann die Registrierung leider nicht berücksichtigt werden. Wir bitten um Dein Verständnis.</div>
              </div>
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
          <Link href="/"><div className="p">Vorgang abbrechen</div></Link>
        </div>
      </div>
    </div>

    <FreestandingFooter />

  </>)
}