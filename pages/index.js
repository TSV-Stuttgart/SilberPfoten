import React, {useState, useEffect, useMemo} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import {useRouter} from 'next/router'
import slugify from 'slugify'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import useSession from '../lib/auth/useSession'
import Wrapper from '../components/Wrapper'
import Error from '../components/Error'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'

// Dynamically import the map component, disable SSR
const MapComponent = dynamic(() => import('../components/CaseMap'), {
  ssr: false,
  loading: () => <p>Karte wird geladen...</p> // Optional loading indicator
});

// Helper function to obfuscate coordinates
const obfuscateCoordinates = (lat, lon, radiusMeters = 250) => {
  if (lat == null || lon == null) return { obfuscatedLat: null, obfuscatedLon: null };

  const earthRadius = 6371000; // Earth radius in meters

  // Convert radius from meters to radians
  const radiusRad = radiusMeters / earthRadius;

  // Random angle and distance
  const randomAngle = Math.random() * 2 * Math.PI;
  // Use sqrt(random) for uniform distribution within the circle area
  const randomDistanceRad = Math.sqrt(Math.random()) * radiusRad;

  // Convert original coordinates to radians
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;

  // Calculate new latitude
  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(randomDistanceRad) +
    Math.cos(latRad) * Math.sin(randomDistanceRad) * Math.cos(randomAngle)
  );

  // Calculate new longitude
  const newLonRad = lonRad + Math.atan2(
    Math.sin(randomAngle) * Math.sin(randomDistanceRad) * Math.cos(latRad),
    Math.cos(randomDistanceRad) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  // Convert back to degrees
  const obfuscatedLat = newLatRad * 180 / Math.PI;
  const obfuscatedLon = newLonRad * 180 / Math.PI;

  return { obfuscatedLat, obfuscatedLon };
};

export async function getServerSideProps(context) {

  const {token} = context.query

  let decryptedData
  if (token) {

    try {

      const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET)
      const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
      decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    
    } catch(e) {

      if (e.name === 'TokenExpiredError') {
        decryptedData = {type: 'TokenExpiredError'}
      }
    }

  }

  return {
    props: {
      query: context.query,
      tokenType: decryptedData ? decryptedData.type : null
    }
  }
}

export default function Home({query, tokenType}) {
  const router = useRouter()
  const {mutate} = useSWRConfig()
  const {data: messages, error: messagesError} = useSWR(`/api/messages`, (url) => fetch(url).then(r => r.json()))
  const {session, isError} = useSession()
  const {token} = query

  const [tokenHandling, setTokenHandling] = useState(false)
  const [noticeText, setNoticeText] = useState('')

  useEffect(() => {

    // start worker to handle email queue
    fetch(`/api/worker`, {method: 'POST'})
  }, [])

  // Calculate processed messages for the map using useMemo
  const mapMessages = useMemo(() => {
    if (!messages) return [];
    return messages
      .filter(m => m.lat != null && m.lon != null) // Filter messages with coordinates
      .map(m => ({
        ...m,
        ...obfuscateCoordinates(m.lat, m.lon) // Add obfuscated coordinates
      }));
  }, [messages]);

  //const deleteMessage = async (messageId) => {
  //  await fetch(`/api/admin/message?messageId=${messageId}`, {method: 'DELETE'})
  
  //  mutate(`/api/messages`)
  //}

  if (messagesError) return <Error />
  if (!messages && !messagesError) return <Loading />
  if (!session && !isError) return <Loading />

  if (!session && isError) {
    router.push('/signin')

    return
  }

  if (noticeText) {
    return <Notice 
        icon={<i className="bi bi-patch-exclamation-fill text-white" style={{fontSize: 100}} />}
        title={<span className="text-uppercase">{noticeText}</span>}
        description={<span></span>}
        reload={true}
        hrefTitle={<>&laquo; zurück zur Startseite</>}
      />
  }

  const handleToken = async () => {

    if (tokenType === 'patchUserEmail') {
      patchUserEmail()
      return
    }

    else if (tokenType === 'TokenExpiredError') {

      setNoticeText('Fehler: Gültigkeitsdauer des Links ist bereits abgelaufen!')
    }

    else {
      setNoticeText('Fehler: Ungültiger Link!')
      return
    }
  }

  const patchUserEmail = async () => {

    const sendUserChangeEmailRequest = await fetch(`/api/profile?token=${token}`, {method: 'PATCH'})

    if (sendUserChangeEmailRequest.status === 200) {
      mutate(`/api/auth/session`)

      router.push({
        pathname: '/profile',
        query: {emailSuccess: '1'},
      }, '/profile')
    }
    else {
      setNoticeText('Ups! Irgendetwas ist schief gelaufen!')
    }
  }

  if(session && token && !tokenHandling) {
    setTokenHandling(true)
    handleToken()
    return
  }

  if (token) return <Loading />

  return (
    <>
      <Wrapper>

        {/* Map Section */}
        <div className="container mt-3 mb-3">
          <div className="row">
            <div className="col-12">
              <div className="fw-bold h4">Fälle in deiner Nähe</div>
                <div className="mb-3">
                    <MapComponent messages={mapMessages} />
                </div>
            </div>
          </div>
        </div>

        {/* Messages Section Title */}
        <div className="container mt-3 mb-3">
          <div className="row">
            <div className="col-12">
              <div className="fw-bold h3">Alle Nachrichten</div>
            </div>
          </div>
        </div>

        {/* Existing Messages Loop (Cases) */}
        {messages.filter(m => m.message_type === 'case').length > 0 ? <div className="mt-3 mb-4">
          <div className="ms-4">Wir haben einen passenden Suchauftrag für dich!</div>
          {messages.filter(m => m.message_type === 'case').map(message => <React.Fragment key={message.message_id}>
          <Link href={`/message/${message.message_id}/${slugify(message.subject, {lower: true})}`} className="text-decoration-none text-secondary">
          <div className="container mt-2">
            <div className="row align-items-center">
              <div className="col-12">
                <div className="border p-2 rounded-3 bg-light">
                  <div className="row align-items-center">
                    <div className="col-2 text-center border-end">
                      <i className="bi bi-megaphone-fill text-danger" style={{fontSize:18}}></i>
                    </div>
                    <div className="col-10">
                      <div className="small">
                        {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
                      </div>
                      <div className="p fw-bold">{message.subject} | {message.zipcode}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Link>
          </React.Fragment>)}
        </div> : null}

        {/* Existing Messages Loop (Messages) */}
        {messages.filter(m => m.message_type === 'message').map(message => <React.Fragment key={message.message_id}>
        <Link href={`/message/${message.message_id}/${slugify(message.subject, {lower: true})}`} className="text-decoration-none text-secondary">
        <div className="container mt-2">
          <div className="row align-items-center">
            <div className="col-12">
              <div className="border p-2 rounded-3">
                <div className="row align-items-center">
                  <div className="col-2 text-center border-end">
                    <i className="bi bi-envelope-fill" style={{fontSize:18, color: '#904684'}}></i>
                  </div>
                  <div className="col-10">
                    <div className="small">
                      {new Date(message.created_at).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} Uhr
                    </div>
                    <div className="p fw-bold">{message.subject}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </Link>
        </React.Fragment>)}

      </Wrapper>
    </>
  )
}
