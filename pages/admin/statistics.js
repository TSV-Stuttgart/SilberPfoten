import React, {useEffect, useState} from 'react'
import useSWR, {useSWRConfig} from 'swr'
import useSession from '../../lib/auth/useSession'
import AdminWrapper from '../../components/AdminWrapper'
import Error from '../../components/Error'
import Loading from '../../components/Loading'
import 'react-quill/dist/quill.snow.css'

export default function Home() {
  const {mutate} = useSWRConfig()

  const [selectedPeriod, setSelectedPeriod] = useState('LAST30D')
  const [selectedPeriodDropdownText, setSelectedPeriodDropdownText] = useState('Letzte 30 Tage')
  const [selectedComparisonText, setSelectedComparisonText] = useState('seit letzte 30 Tage')

  const {data: audits, error: auditError} = useSWR(`/api/admin/audits?timePeriod=${selectedPeriod}`, (url) => fetch(url).then(r => r.json()))
  const {session} = useSession()

  useEffect(() => {
    import('bootstrap/js/dist/dropdown')
  }, [])

  if (!session) return <Loading />

  if (auditError) return <Error />
  if (!audits && !auditError) return <Loading />

  const selectNewPeriod = (newPeriod) => {

    setSelectedPeriod(newPeriod)

    if (newPeriod === 'LAST24H') {
      setSelectedPeriodDropdownText('Letzte 24 Stunden')
      setSelectedComparisonText('seit letzte 24 Stunden')
    }
    else if (newPeriod === 'LAST7D') {
      setSelectedPeriodDropdownText('Letzte 7 Tage')
      setSelectedComparisonText('seit letzte 7 Tage')
    }
    else if (newPeriod === 'LAST30D') {
      setSelectedPeriodDropdownText('Letzte 30 Tage')
      setSelectedComparisonText('seit letzte 30 Tage')
    }
    else if (newPeriod === 'LAST365D') {
      setSelectedPeriodDropdownText('Letzte 365 Tage')
      setSelectedComparisonText('seit letzte 365 Tage')
    }

    mutate(`/api/admin/audits?timePeriod=${newPeriod}`)
  }

  const addStatisticCard = (whichCard) => {

    const cardData = {
      SIGNUPS: {
        title: 'REGISTRIERUNGEN',
        icon: 'bi-person-arms-up',
        color: 'bg-success',
        value: audits?.currentAuditPeriod?.filter(audit => audit.action_type === 'addAccount').length || 0,
        difference: 
          ((audits?.currentAuditPeriod?.filter(audit => audit.action_type === 'addAccount').length - audits?.lastAuditPeriod?.filter(audit => audit.action_type === 'addAccount').length) || 0),
      },
      DELETIONS: {
        title: 'LÖSCHUNGEN',
        icon: 'bi-person-dash',
        color: 'bg-danger',
        value: audits?.currentAuditPeriod?.filter(audit => audit.action_type === 'deleteAccount').length || 0,
        difference: 
          ((audits?.currentAuditPeriod?.filter(audit => audit.action_type === 'deleteAccount').length - audits?.lastAuditPeriod?.filter(audit => audit.action_type === 'deleteAccount').length) || 0),
      },
      SEARCHES: {
        title: 'SUCHAUFTRÄGE',
        icon: 'bi-search',
        color: 'bg-warning',
        value: audits?.currentAuditPeriod?.filter(audit => audit.action_type === 'addCaseHelpRequest').length || 0,
        difference: 
          ((audits?.currentAuditPeriod?.filter(audit => audit.action_type === 'addCaseHelpRequest').length - audits?.lastAuditPeriod?.filter(audit => audit.action_type === 'addCaseHelpRequest').length) || 0),
      },
      OFFERS: {
        title: 'HILFSANGEBOTE',
        icon: 'bi-person-raised-hand',
        color: 'bg-success',
        value: audits?.currentAuditPeriod?.filter(audit => audit.action_type === 'addCaseHelpOffer').length || 0,
        difference: 
          ((audits?.currentAuditPeriod?.filter(audit => audit.action_type === 'addCaseHelpOffer').length - audits?.lastAuditPeriod?.filter(audit => audit.action_type === 'addCaseHelpOffer').length) || 0),
      },
    }

    return (
      <div className="col-12 col-lg-6 col-xl-3">
        <div className="card card-stats mb-4 mb-xl-0">
          <div className="card-body">
            <div className="row">
              <div className="col-8">
                <h5 className="card-title text-uppercase text-muted mb-0">{cardData[whichCard].title}</h5>
                <span className="h2 font-weight-bold mb-0">{cardData[whichCard].value}</span>
              </div>
              <div className="col-4 text-end">
                <div className={`icon icon-shape text-white rounded-circle shadow ${cardData[whichCard].color}`}>
                  <i className={cardData[whichCard].icon}></i>
                </div>
              </div>
            </div>
            <p className="mt-3 mb-0 text-muted text-md">
              {cardData[whichCard].difference < 0 ? <span className="text-danger me-2"><i className="fa fa-arrow-down"></i> {cardData[whichCard].difference}</span> : null}
              {cardData[whichCard].difference > 0 ? <span className="text-success me-2"><i className="fa fa-arrow-up"></i> +{cardData[whichCard].difference}</span> : null}
              {cardData[whichCard].difference === 0 ? <span className="text-muted me-2"><i className="fa fa-arrow-right"></i> {cardData[whichCard].difference}</span> : null}
              <span className="text-nowrap">{selectedComparisonText}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AdminWrapper>

        <div className="container mt-3 mb-3">
          <div className="row">
            <div className="col-7">
              <div className="fw-bold h3">Statistiken</div>
            </div>
            <div className="col-5 text-end">
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  {selectedPeriodDropdownText}
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={() => selectNewPeriod('LAST24H')}>Letzte 24 Stunden</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => selectNewPeriod('LAST7D')}>Letzte 7 Tage</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => selectNewPeriod('LAST30D')}>Letzte 30 Tage</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => selectNewPeriod('LAST365D')}>Letzte 365 Tage</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="header-body">
            <div className="row">
              {addStatisticCard('SIGNUPS')}
              {addStatisticCard('DELETIONS')}
              {addStatisticCard('SEARCHES')}
              {addStatisticCard('OFFERS')}
            </div>
          </div>
        </div>

      </AdminWrapper>
    </>
  )
}