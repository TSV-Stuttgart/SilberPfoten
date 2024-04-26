import React, {useState} from 'react'

const statusNames = {
  'ADMIN': 'Admin',
  'USER': 'User',
}

const animalNames = {
  'dog': 'Hund',
  'cat': 'Katze',
  'bird': 'Vogel',
  'small_animal': 'Kleintiere',
}

const activityNames = {
  'go_walk': 'Gassi gehen',
  'veterinary_trips': 'Tierarztfahrten',
  'animal_care': 'Hilfe bei der Tierpflege',
  'events': 'Hilfe bei Veranstaltungen',
  'baking_cooking': 'Backen und Kochen',
  'creative_workshop': 'Kreativworkshops',
  'public_relation': 'Öffentlichkeitsarbeit',
  'light_office_work': 'Leichte Büroarbeiten',
  'graphic_work': 'Grafische Arbeiten',
}

export default function Filter({filterOptions}) {

  const handleReset = () => {
    filterOptions.statusValues.setSelectedStatus([])
    filterOptions.animalValues.setSelectedAnimals([])
    filterOptions.activityValues.setSelectedActivities([])
    filterOptions.radiusValues.setSelectedZipcode('')
    filterOptions.radiusValues.setSelectedSearchRadius('')
    setStatusIsEditable(false)
    setAnimalsIsEditable(false)
    setActivitiesIsEditable(false)
    setRadiusIsEditable(false)
  }

  const {status, selectedStatus, setSelectedStatus} = filterOptions.statusValues
  const {animals, selectedAnimals, setSelectedAnimals} = filterOptions.animalValues
  const {activities, selectedActivities, setSelectedActivities} = filterOptions.activityValues
  const {
    selectedZipcode, 
    setSelectedZipcode,
    selectedSearchRadius,
    setSelectedSearchRadius,
  } = filterOptions.radiusValues


  const [statusIsEditable, setStatusIsEditable] = useState(false)
  const [animalsIsEditable, setAnimalsIsEditable] = useState(false)
  const [activitiesIsEditable, setActivitiesIsEditable] = useState(false)
  const [radiusIsEditable, setRadiusIsEditable] = useState(false)

  return <>

    <div className="container">
      <div className="row mt-3 align-items-center">
        <div className="col-12 text-end">
          <div className="btn-group">
            <button type="button" className="btn btn-light" onClick={(e) => handleReset()}>Filter zurücksetzen</button>
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <div className="px-3 fw-bold">Erweiterte Suche</div>
        </div>
      </div>
    </div>

    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="mt-2 py-2 px-3 border-bottom">
            <div className="row align-items-center">
              <div className="col-7 fw-bold">
                Status
              </div>
              <div className="col-5 text-end">
                {!statusIsEditable ?
                  <span className="btn btn-light py-0" onClick={() => setStatusIsEditable(true)}>Bearbeiten</span> :
                  <span className="btn btn-success py-0 text-white" onClick={() => setStatusIsEditable(false)}>Erledigt</span>
                }
              </div>
            </div>
            {status && !statusIsEditable && selectedStatus.length > 0 ? <>
            <div className="row mt-2">
              <div className="col-12 fw-bold">
                {status?.filter(value => selectedStatus?.includes(value)).map(value => <React.Fragment key={value}>
                  <div className="float-start me-1 mb-1">
                    <span className={`rounded cursor-pointer px-1 bg-light`} onClick={() => setSelectedStatus(selectedStatus.filter(selectedStatusName => selectedStatusName !== value))}>
                      {statusNames[value]} <i className="fa-thin fa-circle-x ms-1"></i>
                    </span>
                  </div>
                </React.Fragment>)}
              </div>
            </div>
            </> : null}
            {statusIsEditable ? <>
            <div className="row align-items-center">
              <div className="col-12">
                <div className="mt-2">
                  <div className="border overflow-auto rounded" style={{height: 150}}>
                    <div className="text-center fw-bold py-2 border-bottom">Status zuweisen</div>
                    {status.map(value => <React.Fragment key={value}>
                      <div className="clearfix d-flex align-items-center cursor-pointer my-2" onClick={() => !selectedStatus.includes(value) ? setSelectedStatus([...selectedStatus.filter(selectedStatusName => selectedStatusName !== value), value]) : setSelectedStatus(selectedStatus.filter(selectedStatusName => selectedStatusName !== value))}>
                        {selectedStatus?.includes(value) ? 
                          <div className="float-start ms-3 me-3"><i class="bi-check"></i></div> :
                          <div className="float-start ms-3 me-3"><i className="bi-check text-white"></i></div>
                        }
                        <div className="float-start">{statusNames[value]}</div>
                      </div>
                    </React.Fragment>)}
                  </div>
                </div>
              </div>
            </div>
            </> : null}
          </div>
        </div>
      </div>
    </div>

    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="mt-2 py-2 px-3 border-bottom">
            <div className="row align-items-center">
              <div className="col-7 fw-bold">
                Tiere
              </div>
              <div className="col-5 text-end">
                {!animalsIsEditable ?
                  <span className="btn btn-light py-0" onClick={() => setAnimalsIsEditable(true)}>Bearbeiten</span> :
                  <span className="btn btn-success py-0 text-white" onClick={() => setAnimalsIsEditable(false)}>Erledigt</span>
                }
              </div>
            </div>
            {animals && !animalsIsEditable && selectedAnimals.length > 0 ? <>
            <div className="row mt-2">
              <div className="col-12 fw-bold">
                {animals?.filter(value => selectedAnimals?.includes(value)).map(value => <React.Fragment key={value}>
                  <div className="float-start me-1 mb-1">
                    <span className={`rounded cursor-pointer px-1 bg-light`} onClick={() => setSelectedAnimals(selectedAnimals.filter(selectedAnimalName => selectedAnimalName !== value))}>
                      {animalNames[value]} <i className="fa-thin fa-circle-x ms-1"></i>
                    </span>
                  </div>
                </React.Fragment>)}
              </div>
            </div>
            </> : null}
            {animalsIsEditable ? <>
            <div className="row align-items-center">
              <div className="col-12">
                <div className="mt-2">
                  <div className="border overflow-auto rounded" style={{height: 150}}>
                    <div className="text-center fw-bold py-2 border-bottom">Tiere zuweisen</div>
                    {animals.map(value => <React.Fragment key={value}>
                      <div className="clearfix d-flex align-items-center cursor-pointer my-2" onClick={() => !selectedAnimals.includes(value) ? setSelectedAnimals([...selectedAnimals.filter(selectedAnimalName => selectedAnimalName !== value), value]) : setSelectedAnimals(selectedAnimals.filter(selectedAnimalName => selectedAnimalName !== value))}>
                        {selectedAnimals?.includes(value) ? 
                          <div className="float-start ms-3 me-3"><i class="bi-check"></i></div> :
                          <div className="float-start ms-3 me-3"><i className="bi-check text-white"></i></div>
                        }
                        <div className="float-start">{animalNames[value]}</div>
                      </div>
                    </React.Fragment>)}
                  </div>
                </div>
              </div>
            </div>
            </> : null}
          </div>
        </div>
      </div>
    </div>

    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="mt-2 py-2 px-3 border-bottom">
            <div className="row align-items-center">
              <div className="col-7 fw-bold">
                Aktivitäten
              </div>
              <div className="col-5 text-end">
                {!activitiesIsEditable ?
                  <span className="btn btn-light py-0" onClick={() => setActivitiesIsEditable(true)}>Bearbeiten</span> :
                  <span className="btn btn-success py-0 text-white" onClick={() => setActivitiesIsEditable(false)}>Erledigt</span>
                }
              </div>
            </div>
            {activities && !activitiesIsEditable && selectedActivities.length > 0 ? <>
            <div className="row mt-2">
              <div className="col-12 fw-bold">
                {activities?.filter(value => selectedActivities?.includes(value)).map(value => <React.Fragment key={value}>
                  <div className="float-start me-1 mb-1">
                    <span className={`rounded cursor-pointer px-1 bg-light`} onClick={() => setSelectedActivities(selectedActivities.filter(selectedActivityName => selectedActivityName !== value))}>
                      {activityNames[value]} <i className="fa-thin fa-circle-x ms-1"></i>
                    </span>
                  </div>
                </React.Fragment>)}
              </div>
            </div>
            </> : null}
            {activitiesIsEditable ? <>
            <div className="row align-items-center">
              <div className="col-12">
                <div className="mt-2">
                  <div className="border overflow-auto rounded" style={{height: 150}}>
                    <div className="text-center fw-bold py-2 border-bottom">Tiere zuweisen</div>
                    {activities.map(value => <React.Fragment key={value}>
                      <div className="clearfix d-flex align-items-center cursor-pointer my-2" onClick={() => !selectedActivities.includes(value) ? setSelectedActivities([...selectedActivities.filter(selectedActivityName => selectedActivityName !== value), value]) : setSelectedActivities(selectedActivities.filter(selectedActivityName => selectedActivityName !== value))}>
                        {selectedActivities?.includes(value) ? 
                          <div className="float-start ms-3 me-3"><i class="bi-check"></i></div> :
                          <div className="float-start ms-3 me-3"><i className="bi-check text-white"></i></div>
                        }
                        <div className="float-start">{activityNames[value]}</div>
                      </div>
                    </React.Fragment>)}
                  </div>
                </div>
              </div>
            </div>
            </> : null}
          </div>
        </div>
      </div>
    </div>

    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="mt-2 py-2 px-3 border-bottom">
            <div className="row align-items-center">
              <div className="col-7 fw-bold">
                Suchradius
              </div>
              <div className="col-5 text-end">
                {!radiusIsEditable ?
                  <span className="btn btn-light py-0" onClick={() => setRadiusIsEditable(true)}>Bearbeiten</span> :
                  <span className="btn btn-success py-0 text-white" onClick={() => setRadiusIsEditable(false)}>Erledigt</span>
                }
              </div>
            </div>
            {!radiusIsEditable && selectedZipcode && selectedSearchRadius ? <>
            <div className="row mt-2">
              <div className="col-12">
                <div className="me-1 mb-2">
                  <span className={`rounded cursor-pointer px-1 bg-light`} onClick={() => setRadiusIsEditable(true)}>
                    PLZ: <span className="fw-bold">{selectedZipcode}</span> <i className="fa-thin fa-circle-x ms-1"></i>
                  </span>
                </div>
                <div className="me-1 mb-1">
                  <span className={`rounded cursor-pointer px-1 bg-light`} onClick={() => setRadiusIsEditable(true)}>
                    Umkreis: <span className="fw-bold">{selectedSearchRadius} km</span> <i className="fa-thin fa-circle-x ms-1"></i>
                  </span>
                </div>
              </div>
            </div>
            </> : null}
            {radiusIsEditable ? <>
            <div className="row align-items-center">
              <div className="col-12">
                <div className="mt-2">
                  <div className="border rounded">
                    <div className="text-center fw-bold py-2 border-bottom">Suchradius definieren</div>
                    <div className="mt-2 px-2 py-1">
                      <input type="text" className="form-control border" placeholder="PLZ eingeben" value={selectedZipcode} onChange={(e) => setSelectedZipcode(e.target.value)} />
                      <input type="number" step={0.1} className="form-control mt-2 mb-2" placeholder="Umkreis in km eingeben" value={selectedSearchRadius} onChange={(e) => setSelectedSearchRadius(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </> : null}
          </div>
        </div>
      </div>
    </div>

  </>
}