DO $$
DECLARE
    demoAdmin1UserId int;
    demoAdmin2UserId int;
    demoHelper1UserId int;
    demoHelper2UserId int;
    demoHelper2NotActivatedUserId int;
BEGIN

  INSERT INTO public.user (
    gender,
    firstname,
    lastname,
    email,
    birthdate,
    phone,
    street,
    street_number,
    zipcode,
    city,
    job,
    status,
    activated_at
  ) VALUES (
    'male',
    'Admini',
    'Strator',
    'info@stigits.com',
    '1985-08-01',
    '016312345678',
    'Mustermann Straße',
    '31',
    '73760',
    'Ostfildern',
    'Developer',
    'ADMIN',
    'now()'
  ) ON CONFLICT DO NOTHING RETURNING user_id INTO demoAdmin1UserId;

    INSERT INTO public.user (
    gender,
    firstname,
    lastname,
    email,
    birthdate,
    phone,
    street,
    street_number,
    zipcode,
    city,
    job,
    status,
    activated_at
  ) VALUES (
    'male',
    'Christian',
    'Mustermann',
    'info@stigits.com',
    '1991-08-01',
    '017277665522',
    'Im Kornfeld',
    '24',
    '70199',
    'Stuttgart',
    'Developer',
    'ADMIN',
    'now()'
  ) ON CONFLICT DO NOTHING RETURNING user_id INTO demoAdmin2UserId;

  INSERT INTO public.user (
    gender,
    firstname,
    lastname,
    email,
    birthdate,
    phone,
    street,
    street_number,
    zipcode,
    city,
    job,
    became_aware_through,
    became_aware_through_other,
    experience_with_animal,
    experience_with_animal_other,
    support_activity,
    status,
    activated_at,
    activated_from_user
  ) VALUES (
    'male',
    'Ingo',
    'Helfer',
    'demo-silberpfoten-helfer@stigits.com',
    '1990-09-28',
    '01771111111',
    'Schwabstraße',
    '36',
    '73760',
    'Ostfildern',
    'Softwareentwickler',
    ARRAY['instagram','facebook','internet','press','friend','other'],
    'Twitter',
    ARRAY['dog','cat','small_animal','bird','other'],
    'Schlangen',
    ARRAY['go_walk','veterinary_trips','animal_care','events','baking_cooking','creative_workshop','public_relation','light_office_work','graphic_work'],
    'USER',
    'now()',
    demoAdmin1UserId
  ) ON CONFLICT DO NOTHING RETURNING user_id INTO demoHelper1UserId;

    INSERT INTO public.user (
    gender,
    firstname,
    lastname,
    email,
    birthdate,
    phone,
    street,
    street_number,
    zipcode,
    city,
    job,
    became_aware_through,
    became_aware_through_other,
    experience_with_animal,
    experience_with_animal_other,
    support_activity,
    status,
    activated_at,
    activated_from_user
  ) VALUES (
    'male',
    'Peter',
    'Helfer',
    'demo-silberpfoten-helfer2@stigits.com',
    '1990-09-28',
    '01771111111',
    'Schwabstraße',
    '36',
    '73760',
    'Ostfildern',
    'Gärtner',
    ARRAY['instagram','facebook','internet','press','friend','other'],
    'Twitter',
    ARRAY['dog','cat','small_animal','bird','other'],
    'Schlangen',
    ARRAY['go_walk','veterinary_trips','animal_care','events','baking_cooking','creative_workshop','public_relation','light_office_work','graphic_work'],
    'USER',
    'now()',
    demoAdmin2UserId
  ) ON CONFLICT DO NOTHING RETURNING user_id INTO demoHelper2UserId;

  INSERT INTO public.user (
    gender,
    firstname,
    lastname,
    email,
    birthdate,
    phone,
    street,
    street_number,
    zipcode,
    city,
    job,
    became_aware_through,
    became_aware_through_other,
    experience_with_animal,
    experience_with_animal_other,
    support_activity,
    status
  ) VALUES (
    'female',
    'Francesca',
    'Bolognese',
    'demo-silberpfoten-helfer2@stigits.com',
    '1990-09-28',
    '01771111122',
    'Schwabstraße',
    '36',
    '73760',
    'Ostfildern',
    'Softwareentwickler',
    ARRAY['instagram'],
    'Twitter',
    ARRAY['dog'],
    'Schlangen',
    ARRAY['go_walk','animal_care','events'],
    'USER'
  ) ON CONFLICT DO NOTHING RETURNING user_id INTO demoHelper2NotActivatedUserId;

END $$;