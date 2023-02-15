CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.user (
  user_id BIGSERIAL,
  gender VARCHAR(8),
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  birthdate VARCHAR(255),
  phone VARCHAR(255) UNIQUE,
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