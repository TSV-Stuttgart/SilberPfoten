const fs = require('fs')
const XLSX = require('xlsx')

const getBirthdate = (date) => {
  try {    
    return date.toISOString().slice(0,10)
  } catch(e) {
    return ``
  }
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}

if (fs.existsSync('./import.sql')) {
  fs.unlinkSync('./import.sql')
  fs.writeFileSync('./import.sql', '')
} else {
  fs.writeFileSync('./import.sql', '')
}

const workbook = XLSX.readFile('./ehrenamtliche.xlsx', {cellDates: false})
const sheets = workbook.SheetNames
const phoneList = []
const emailList = []

for(let i = 0; i < sheets.length; i++) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]])
  
  rows.forEach((row, index) => {

    // console.log(index, row['Vorname'], row['Name'])

    // wird nicht verwendet
    // const user_id = row['Anmeldenummer']

    let gender = ''

    if (row['Anrede']?.includes('Herr')) {
      gender = 'male'
    } else if (row['Anrede']?.includes('Frau')) {
      gender = 'female'
    }

    const firstname = row['Vorname']?.toString().replace(/'/g, '\'\'') || ''
    const lastname = row['Name']?.replace(/'/g, '\'\'') || ''
    const email = row['E-Mail-Adresse'] || ''
    const birthdate = row['Geburtsdatum'] ? getBirthdate(ExcelDateToJSDate(row['Geburtsdatum'])) : ''  
    const mobile = row['Handy']?.toString().replace(/ /g, '') || ''
    const phone = row['Festnetz']?.toString().replace(/ /g, '') || ''
    const street = row['Straße']?.replace(/'/g, '\'\'') || ''
    const street_number = ''
    const zipcode = row['PLZ'] || ''
    const city = row['Ort'] || ''
    const job = row['Beruf '] || ''

    if (phoneList.includes(mobile)) {
      console.log("duplicate phone", index, row['Vorname'], row['Name'], mobile)
    }
    
    if (mobile) {
      phoneList.push(mobile)
    }

    if (emailList.includes(email)) {
      console.log("duplicate email", index, row['Vorname'], row['Name'], email)
    }
    
    if (email) {
      emailList.push(email)
    }
    
    const support_activity = []

    if (row['Gassigeher']?.toLowerCase() === 'x') {
      support_activity.push('go_walk')
    }

    if (row['Tierarztfahrten']?.toLowerCase() === 'x') {
      support_activity.push('veterinary_trips')
    }

    if (row['Hilfe bei der Tierpflege']?.toLowerCase() === 'x') {
      support_activity.push('animal_care')
    }

    if (row['Hilfe bei der Vorbereitung/ Durchführung von Veranstaltungen']?.toLowerCase() === 'x') {
      support_activity.push('events')
    }

    if (row['Backen und Kochen']?.toLowerCase() === 'x') {
      support_activity.push('baking_cooking')
    }

    if (row['Kreativworkshops']?.toLowerCase() === 'x') {
      support_activity.push('creative_workshop')
    }

    if (row['Grafiker']?.toLowerCase() === 'x') {
      support_activity.push('graphic_work')
    }

    if (row['Öffentlichkeitsarbeit']?.toLowerCase() === 'x') {
      support_activity.push('public_relation')
    }

    if (row['leichte Büroarbeiten']?.toLowerCase() === 'x') {
      support_activity.push('light_office_work')
    }

    const newsletter = row['Newsletter']?.toLowerCase() === 'ja' ? 'now()' : 'NULL'
    const newsletterDeactivated = row['Newsletter']?.toLowerCase() === 'nein' ? 'now()' : 'NULL'

    // const status = column[0]
    // const deactivated_at = column[0]
    // const deactivated_from_user = column[0]
    // const blocked_at = column[0]
    // const blocked_from_user = column[0]
    // const activated_at = column[0]
    // const activated_from_user = column[0]
    // const became_aware_through = column[0]
    // const became_aware_through_other = column[0]
    // const experience_with_animal = column[0]
    // const experience_with_animal_other = column[0]

    fs.appendFileSync('import.sql', `\nINSERT INTO public.user VALUES (nextval('user_user_id_seq'), '${gender}', '${firstname}', '${lastname}', ${!email ? 'NULL' : `'${email}'`}, '${birthdate}', '${phone}', ${!mobile ? 'NULL' : `'${mobile}'`}, '${street}', '${street_number}', '${zipcode}', '${city}', '${job}', '', '', '', '', ${support_activity.length > 0 ? `ARRAY[${support_activity.map(e => `'${e}'`).join(',')}]` : '\'\''}, 'USER', 'now()', ${newsletter}, NULL, ${newsletterDeactivated});`)
  })
}