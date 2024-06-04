import logger from '../../../lib/logger'
import db from '../../../lib/db'

// Das Audit beinhaltet derzeit folgende action_types zur Auswertung:
// - addAccount (Registrierung)
// - deleteAccount (Account Löschung durch User)
// - deleteAccountByAdmin (Account Löschung durch Admin)
// - addCaseHelpOffer (User bietet Hilfe für Suchauftrag an)
// - deleteCaseHelpOffer (User zieht sein Hilfsangebot für Suchauftrag zurück)
// - addCaseHelpRequest (Suchauftrag wird erstellt)
// - addMessage (Nachricht wird erstellt)
// - acceptCaseHelpOffer (Admin akzeptiert Hilfsangebot für Suchauftrag)
// - rejectCaseHelpOffer (Admin lehnt Hilfsangebot für Suchauftrag ab)

export default async function handler(actionType, data) {
  logger.info(`database | queries | audit | putAudit`)

  try {
    logger.info(`database | queries | audit | putAudit | database request`)

    const dbRequest = await db.query(`INSERT INTO public.audit (action_type, data_json) VALUES ($1,$2)`, [actionType, JSON.stringify(data)])

    logger.info(`database | queries | audit | putAudit | database request | rowCount | ${dbRequest.rowCount}`)
    
    return true

  } catch(e) {
    logger.error(`database | queries | audit | putAudit | error | ${e}`)

    return
  }
}