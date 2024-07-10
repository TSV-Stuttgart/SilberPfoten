CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.audit (
  audit_id BIGSERIAL,
  action_type VARCHAR(255),
  data_json TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(audit_id)
);

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
  lat FLOAT(8),
  lon FLOAT(8),
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
  newsletter_sent_at TIMESTAMP WITHOUT TIME ZONE,
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
  lat FLOAT(8),
  lon FLOAT(8),
  search_radius VARCHAR(255),
  status VARCHAR(255),
  experience_with_animal VARCHAR(255) DEFAULT '{}',
  experience_with_animal_other VARCHAR(255),
  support_activity VARCHAR(255) DEFAULT '{}',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(message_id)
);

CREATE TABLE IF NOT EXISTS public.case_has_user (
  case_has_user_id BIGSERIAL,
  user_id SERIAL REFERENCES public.user (user_id) ON DELETE CASCADE,
  message_id SERIAL REFERENCES message (message_id) ON DELETE CASCADE,
  accepted_at TIMESTAMP WITHOUT TIME ZONE,
  accepted_from_user BIGINT,
  rejected_at TIMESTAMP WITHOUT TIME ZONE,
  rejected_from_user BIGINT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id),
  PRIMARY KEY(case_has_user_id)
);

CREATE TABLE IF NOT EXISTS public.message_has_media (
  message_has_media_id BIGSERIAL,
  uuid uuid DEFAULT uuid_generate_v4(),
  message_id SERIAL REFERENCES public.message (message_id) ON DELETE CASCADE,
  mimetype VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file BYTEA NOT NULL,
  thumbnail BYTEA,
  width VARCHAR(20),
  height VARCHAR(20),
  size VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(message_has_media_id)
);

CREATE TABLE IF NOT EXISTS public.email_queue (
  email_queue_id BIGSERIAL,
  email_type VARCHAR(100) NOT NULL DEFAULT 'MAIN',
  payload TEXT,
  in_progress BOOLEAN DEFAULT FALSE,
  execute_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(email_queue_id)
);