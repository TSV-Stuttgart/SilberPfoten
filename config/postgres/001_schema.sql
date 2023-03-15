CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.user (
  user_id BIGSERIAL,
  gender VARCHAR(8),
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  birthdate VARCHAR(255),
  phone VARCHAR(255),
  mobile VARCHAR(255) UNIQUE,
  street VARCHAR(255),
  street_number VARCHAR(8),
  zipcode VARCHAR(10),
  city VARCHAR(255),
  job VARCHAR(255),
  became_aware_through VARCHAR(255) DEFAULT '{}',
  became_aware_through_other VARCHAR(255),
  experience_with_animal VARCHAR(255) DEFAULT '{}',
  experience_with_animal_other VARCHAR(255),
  support_activity VARCHAR(255) DEFAULT '{}',
  status VARCHAR(255) DEFAULT 'USER',
  newsletter TIMESTAMP WITHOUT TIME ZONE,
  newsletter_bounced TIMESTAMP WITHOUT TIME ZONE,
  newsletter_deactivated TIMESTAMP WITHOUT TIME ZONE,
  deactivated_at TIMESTAMP WITHOUT TIME ZONE,
  deactivated_from_user BIGINT,
  blocked_at TIMESTAMP WITHOUT TIME ZONE,
  blocked_from_user BIGINT,
  activated_at TIMESTAMP WITHOUT TIME ZONE,
  activated_from_user BIGINT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(user_id)
);

CREATE TABLE IF NOT EXISTS public.session (
  uuid uuid DEFAULT uuid_generate_v4(),
  user_id SERIAL REFERENCES public.user (user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  expires_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '20 minutes',
  PRIMARY KEY(uuid)
);

CREATE TABLE IF NOT EXISTS public.message (
  message_id BIGSERIAL,
  message_type VARCHAR(100) NOT NULL DEFAULT 'message',
  subject VARCHAR(160) NOT NULL,
  message_text TEXT,
  gender VARCHAR(8),
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  street VARCHAR(255),
  street_number VARCHAR(8),
  zipcode VARCHAR(10),
  city VARCHAR(255),
  search_radius VARCHAR(255),
  experience_with_animal VARCHAR(255) DEFAULT '{}',
  experience_with_animal_other VARCHAR(255),
  support_activity VARCHAR(255) DEFAULT '{}',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(message_id)
);

CREATE TABLE IF NOT EXISTS public.accepted_case (
  user_id SERIAL REFERENCES public.user (user_id) ON DELETE CASCADE,
  message_id SERIAL REFERENCES message (message_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS public.import (
  Kommentare VARCHAR(255),
  Freie_Spalte VARCHAR(255),
  Anmeldenummer VARCHAR(255),
  Anrede VARCHAR(255),
  Vorname VARCHAR(255),
  Name VARCHAR(255),
  Geburtsdatum VARCHAR(255),
  Beruf VARCHAR(255),
  Strasse VARCHAR(255),
  PLZ VARCHAR(255),
  Ort VARCHAR(255),
  Handy VARCHAR(255),
  Festnetz VARCHAR(255),
  E_Mail_Adresse VARCHAR(255),
  Ich_bin_Gassigeher VARCHAR(255),
  Gassigeher VARCHAR(255),
  Tierarztfahrten VARCHAR(255),
  Hilfe_bei_der_Tierpflege VARCHAR(255),
  Hilfe_bei_der_Vorbereitung_Durchfuehrung_von_Veranstaltungen VARCHAR(255),
  Backen_und_Kochen VARCHAR(255),
  Kreativworkshops VARCHAR(255),
  Grafiker VARCHAR(255),
  Oeffentlichkeitsarbeit VARCHAR(255),
  leichte_bueroarbeiten VARCHAR(255),
  Sonstiges VARCHAR(255),
  Newsletter VARCHAR(255),
  Alter VARCHAR(255),
  x2 VARCHAR(255),
  x3 VARCHAR(255),
  x4 VARCHAR(255),
  x5 VARCHAR(255)
);