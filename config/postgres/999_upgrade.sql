DO $$
DECLARE
    CURRENT_APP_VERSION varchar(16);
    NEXT_APP_VERSION varchar(16);

    FREE_RECORD_VARIABLE_1 record;

    FREE_INT_VARIABLE_1 integer;
    FREE_INT_VARIABLE_2 integer;
    FREE_INT_VARIABLE_3 integer;
BEGIN

    -- Audits und History für Tabellen anlegen (Ticket #40)
    CREATE TABLE IF NOT EXISTS public.audit (
      audit_id BIGSERIAL,
      action_type VARCHAR(255),
      data_json TEXT,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      PRIMARY KEY(audit_id)
    );

END $$;