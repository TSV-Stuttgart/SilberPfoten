
-- Audits und History für Tabellen anlegen (Ticket #40)
CREATE TABLE IF NOT EXISTS public.audit (
  audit_id BIGSERIAL,
  action_type VARCHAR(255),
  data_json TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(audit_id)
);