import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Wrapper from '../components/Wrapper'
import useSession from '../lib/auth/useSession'

export default function Profile() {
  const token = useSession()
  const router = useRouter()
  
  const member = token?.session?.user

  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formBirthdate, setFormBirthdate] = useState('')
  const [formJobTitle, setFormJobTitle] = useState('')
  const [formSupportingActivity, setFormSupportingActivity] = useState([])
  const [formExperienceWithAnimal, setFormExperienceWithAnimal] = useState([])
  const [formExperienceWithAnimalOther, setFormExperienceWithAnimalOther] = useState('')

  useEffect(() => {
    setFormEmail(member?.email || '')
    setFormPhone(member?.phone || '')
    setFormBirthdate(member?.birthdate || '')
    setFormJobTitle(member?.job || '')
    setFormSupportingActivity(member?.support_activity.split(',') || [])
    setFormExperienceWithAnimal(member?.experience_with_animal?.split(',') || [])
    setFormExperienceWithAnimalOther(member?.experience_with_animal_other)
  }, [member])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const updateRequest = await fetch(`/api/profile`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: formPhone,
        birthdate: formBirthdate,
        job: formJobTitle,
        support_activity: formSupportingActivity,
        experience_with_animal: formExperienceWithAnimal,
        experience_with_animal_other: formExperienceWithAnimalOther,
      })
    })

    if (updateRequest.status === 200) {
      router.push(`/`)
    }

    else if (updateRequestResponse.status === 500) {
      return <Error />
    }
  }

  if (!member) return <Loading />
  
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
            {formEmail}
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
            <input type="text" name="jobtitle" className="form-control" placeholder="Beruf" value={formJobTitle} onChange={(e) => setFormJobTitle(e.target.value)} />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <span className="small">Anschrift</span>
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-12">
            {member.street} {member.street_number}, {member.zipcode} {member.city}
          </div>
        </div>
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
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('dog') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('dog') ? [...formExperienceWithAnimal, ...['dog']] : formExperienceWithAnimal.filter(i => i !== 'dog'))}>Hund</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('cat') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('cat') ? [...formExperienceWithAnimal, ...['cat']] : formExperienceWithAnimal.filter(i => i !== 'cat'))}>Katze</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('small_animal') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('small_animal') ? [...formExperienceWithAnimal, ...['small_animal']] : formExperienceWithAnimal.filter(i => i !== 'small_animal'))}>Kleintiere</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-12">
            <div className="bg-light rounded p-2">
              <div className="row cursor-pointer align-items-center">
                <div className="col-2 text-center"><i className={formExperienceWithAnimal.includes('bird') ? `bi bi-check-circle-fill text-success` : `bi bi-circle text-secondary`} style={{fontSize: 14}}></i></div>
                <div className="col-10 border-start" onClick={() => setFormExperienceWithAnimal(!formExperienceWithAnimal.includes('bird') ? [...formExperienceWithAnimal, ...['bird']] : formExperienceWithAnimal.filter(i => i !== 'bird'))}>Vögel</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
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
        <div className="row justify-content-end">
          <div className="col-12 col-md-6 col-lg-4 text-end">
            <button className="btn btn-primary w-100 mt-4" type="submit">Änderungen speichern</button>
          </div>
        </div>
      </form>

    </Wrapper>
  </>
}