import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import useSWR, {useSWRConfig} from 'swr'
import Error from '../../components/Error'
import Loading from '../../components/Loading'
import AdminWrapper from '../../components/AdminWrapper'
import slugify from 'slugify'
import useSession from '../../lib/auth/useSession'
import UserListElement from '../../components/UserListElement'

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

export default function Users() {
  const {mutate} = useSWRConfig()
  const {session} = useSession()
  const router = useRouter()
  const [formFilter, setFormFilter] = useState('active')
  const {data: users, error} = useSWR(`/api/admin/users?filter=${formFilter}`, (url) => fetch(url).then(r => r.json()))
  const {data: pendingUsers, error: pendingError} = useSWR(`/api/admin/users?filter=pending`, (url) => fetch(url).then(r => r.json()))
  const {data: blockedUsers, error: blockedError} = useSWR(`/api/admin/users?filter=blocked`, (url) => fetch(url).then(r => r.json()))
  const {data: deactivatedUsers, error: deactivatedError} = useSWR(`/api/admin/users?filter=deactivated`, (url) => fetch(url).then(r => r.json()))

  const [usersSortOrder, setUsersSortOrder] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedStatus, setSelectedStatus] = useState([])
  const [selectedAnimals, setSelectedAnimals] = useState([])
  const [selectedActivities, setSelectedActivities] = useState([])
  
  const [lastSelectedZipcode, setLastSelectedZipcode] = useState('')
  const [selectedZipcode, setSelectedZipcode] = useState('')
  const [selectedSearchRadius, setSelectedSearchRadius] = useState('')
  const [searchLat, setSearchLat] = useState('')
  const [searchLon, setSearchLon] = useState('')

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  useEffect(() => {
    if (router.query.refMenu) {
      setFormFilter(router.query.refMenu)
    }
  }, [router.query.refMenu])

  useEffect(() => {
    const findLocation = async () => {

      if (lastSelectedZipcode === selectedZipcode) return

      const location = await (await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${selectedZipcode}&country=germany&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=1&email=info@silberpfoten.de`)).json()

      if (location.length > 0) {
        setSearchLat(location[0].lat)
        setSearchLon(location[0].lon)
      }
      setLastSelectedZipcode(selectedZipcode)
    }
    
    if (selectedZipcode && selectedSearchRadius && selectedZipcode.length === 5 && selectedSearchRadius.length > 0) {
      findLocation()
    }

  }, [selectedZipcode, selectedSearchRadius, lastSelectedZipcode])

  const handleActivation = async (userId) => {
    await fetch(`/api/admin/user/activation?userId=${userId}`)
  
    mutate(`/api/admin/users?filter=active`)
    mutate(`/api/admin/users?filter=pending`)
    mutate(`/api/admin/users?filter=blocked`)
    mutate(`/api/admin/users?filter=deactivated`)
  }

  const handleDeactivation = async (userId) => {
    await fetch(`/api/admin/user/deactivation?userId=${userId}`)
  
    mutate(`/api/admin/users?filter=active`)
    mutate(`/api/admin/users?filter=pending`)
    mutate(`/api/admin/users?filter=blocked`)
    mutate(`/api/admin/users?filter=deactivated`)
  }

  const handleBlock = async (userId) => {
    await fetch(`/api/admin/user/block?userId=${userId}`)
  
    mutate(`/api/admin/users?filter=active`)
    mutate(`/api/admin/users?filter=pending`)
    mutate(`/api/admin/users?filter=blocked`)
    mutate(`/api/admin/users?filter=deactivated`)
  }

  const handleUnblock = async (userId) => {
    await fetch(`/api/admin/user/unblock?userId=${userId}`)
  
    mutate(`/api/admin/users?filter=active`)
    mutate(`/api/admin/users?filter=pending`)
    mutate(`/api/admin/users?filter=blocked`)
    mutate(`/api/admin/users?filter=deactivated`)
  }

  const handleDelete = async (userId) => {
    const confirmed = confirm('Soll der Benutzer wirklich gelöscht werden?')

    if (confirmed) {

      await fetch(`/api/admin/user/delete?userId=${userId}`)
    
      mutate(`/api/admin/users?filter=active`)
      mutate(`/api/admin/users?filter=pending`)
      mutate(`/api/admin/users?filter=blocked`)
      mutate(`/api/admin/users?filter=deactivated`)
    }
  }

  const exportUsersAsCSV = () => {

    const csv = getFilteredSortedUsers()?.map(user => {
      return `${user.user_id || '-'};${user.firstname || '-'};${user.lastname || '-'};${user.email || '-'};${user.zipcode || '-'};${user.city || '-'};${user.experience_with_animal || '-'};${user.experience_with_animal_other || '-'};${user.activated_at || '-'};${user.blocked_at || '-'};${user.deactivated_at || '-'}`
    }).join('\n')

    let csvContent = "data:text/csv;charset=utf-8," 

    csvContent += 'ID;Vorname;Nachname;E-Mail;PLZ;Ort;Erfahrungen mit Tieren;Erfahrungen mit Tieren (andere);Aktiviert am;Gesperrt am;Deaktiviert am\n'
    csvContent += csv

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "mitglieder.csv")
    document.body.appendChild(link)
    link.click()
  }

  const getFilteredSortedUsers = () => {
    
    return users.filter(u => 
      (
        u.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastname.toLowerCase().includes(searchQuery.toLowerCase())
      ) && 
      (
        selectedStatus.length === 0 || selectedStatus.includes(u.status)
      ) &&
      (
        selectedAnimals.length === 0 || selectedAnimals.some(r => u.experience_with_animal.includes(r))
      ) &&
      (
        selectedActivities.length === 0 || selectedActivities.some(r => u.support_activity.includes(r))
      ) &&
      (
        selectedZipcode.length != 5 || !searchLat || !searchLon || !selectedSearchRadius ||
        (getDistanceFromLatLonInKm(searchLat, searchLon, u.lat, u.lon) <= selectedSearchRadius)
      )
    )?.sort((a,b) => {
      if (usersSortOrder === 'firstnameAsc') { if (b.firstname < a.firstname) { return 1 } else { return -1 } }
      else if (usersSortOrder === 'firstnameDesc') { if (b.firstname > a.firstname) { return 1 } else { return -1 } }
      else if (usersSortOrder === 'lastnameAsc') { if (b.lastname < a.lastname) { return 1 } else { return -1 } }
      else if (usersSortOrder === 'lastnameDesc') { if (b.lastname > a.lastname) { return 1 } else { return -1 } }
      else if (usersSortOrder === 'zipAsc') { if (b.zipcode < a.zipcode) { return 1 } else { return -1 } }
      else if (usersSortOrder === 'zipDesc') { if (b.zipcode > a.zipcode) { return 1 } else { return -1 } }
      else if (usersSortOrder === 'locationAsc') { if (b.city < a.city) { return 1 } else { return -1 } }
      else if (usersSortOrder === 'locationDesc') { if (b.city > a.city) { return 1 } else { return -1 } }
    })
  }


  if (error) return <Error />
  if (!users && !error) return <Loading />
  if (!pendingUsers && !pendingError) return <Loading />
  if (!blockedUsers && !blockedError) return <Loading />
  if (!deactivatedUsers && !deactivatedError) return <Loading />

  if (!session) {
    router.push('/signin')

    return
  }
  
  return <>
  
    <AdminWrapper 
      sidebarOptions={
        {
          filter: true,
          filterOptions: {
            statusValues: {
              status: ['ADMIN', 'USER'],
              selectedStatus,
              setSelectedStatus
            },
            animalValues: {
              animals: ['dog', 'cat', 'bird', 'small_animal'],
              selectedAnimals,
              setSelectedAnimals
            },
            activityValues: {
              activities: [
                'go_walk', 
                'veterinary_trips', 
                'animal_care', 
                'events', 
                'baking_cooking', 
                'creative_workshop', 
                'public_relation', 
                'light_office_work', 
                'graphic_work'
              ],
              selectedActivities,
              setSelectedActivities
            },
            radiusValues: {
              selectedZipcode,
              setSelectedZipcode,
              selectedSearchRadius,
              setSelectedSearchRadius
            }
          }
        }
      }
    >

      <div className="container mt-3">
        <div className="row">
          <div className="col-12 col-md-4">
            <div className="fw-bold h3">Mitglieder</div>
          </div>
          <div className="col-12 col-md-8 text-end">
            <div className="fw-bold h3">
              <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className={`btn btn-light ${formFilter === 'active' ? 'active' : ''}`} onClick={() => setFormFilter('active')}>Aktive Mitglieder</button>
                <button type="button" className={`btn btn-light ${formFilter === 'pending' ? 'active' : ''}`} onClick={() => setFormFilter('pending')}>Nicht bestätigt {pendingUsers.length > 0 ? <span className="small bg-secondary text-white fw-bold rounded px-2">{pendingUsers.length}</span> : null}</button>
                <button type="button" className={`btn btn-light ${formFilter === 'deactivated' ? 'active' : ''}`} onClick={() => setFormFilter('deactivated')}>Deaktiviert</button>
                <button type="button" className={`btn btn-light ${formFilter === 'blocked' ? 'active' : ''}`} onClick={() => setFormFilter('blocked')}>Gesperrt</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
          <div className="col-6">
            <input type="text" className="form-control" placeholder="Suchen" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="col-6">
            <select className="form-select" onChange={(e) => setUsersSortOrder(e.target.value)}>
              <option value="">Sortieren nach</option>
              <option value="firstnameAsc">Vorname aufsteigend</option>
              <option value="firstnameDesc">Vorname absteigend</option>
              <option value="lastnameAsc">Nachname aufsteigend</option>
              <option value="lastnameDesc">Nachname absteigend</option>
              <option value="zipAsc">PLZ aufsteigend</option>
              <option value="zipDesc">PLZ absteigend</option>
              <option value="locationAsc">Ort aufsteigend</option>
              <option value="locationDesc">Ort absteigend</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
          <div className="col-6 d-flex align-items-center">
            <div className="fw-semibold mb-0">
              Mitglieder: <span className="small bg-secondary text-white fw-bold rounded px-2">{users.length}</span>
            </div>
          </div>
          <div className="col-6 text-end">
            <button type="button" className={`btn btn-light`} onClick={() => exportUsersAsCSV()}>
              <i class="bi bi-filetype-csv"></i>
              <span className="ps-1">CSV Export</span>
            </button>
          </div>
        </div>
      </div>

      {getFilteredSortedUsers()?.map(user => <UserListElement
        key={user.user_id}
        id={user.user_id}
        name={`${user.lastname}, ${user.firstname}`}
        status={user.status}
        animals={user.experience_with_animal}
        animalsOther={user.experience_with_animal_other}
        activities={user.support_activity}
        phone={user.phone || user.mobile || null}
        email={user.email}
        adress={`${user.zipcode} ${user.city}`}
        targetHref={`/admin/user/${user.user_id}/${slugify(`${user.lastname}-${user.firstname}`, {lower: true})}?refMenu=${formFilter}`}
        navigationElements={[
          //{title: 'Bearbeiten', href: `/admin/user/${user.user_id}/${slugify(`${user.lastname}-${user.firstname}`, {lower: true})}`},
          user.activated_at && !user.deactivated_at ? {title: 'Deaktivieren', onClick: () => handleDeactivation(user.user_id)} : null,
          !user.activated_at && !user.blocked_at ? {title: 'Aktivieren', onClick: () => handleActivation(user.user_id)} : null,
          user.activated_at && !user.deactivated_at ? {title: 'Sperren', onClick: () => handleBlock(user.user_id)} : null,
          !user.activated_at && !user.blocked_at ? {title: <>Ablehnen &amp; Sperren</>, onClick: () => handleBlock(user.user_id)} : null,
          user.blocked_at ? {title: 'Sperre aufheben', onClick: () => handleUnblock(user.user_id)} : null,
          user.deactivated_at ? {title: 'Benutzer können sich selbst deaktivieren. Daher kann der Admin den Status nicht revidieren.', onClick: () => false} : null,
          {title: 'Löschen', onClick: () => handleDelete(user.user_id)}
        ]}
      />)}

    </AdminWrapper>
  </>
}