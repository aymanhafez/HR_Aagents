CREATE TABLE public.module_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  data_source text NOT NULL DEFAULT 'seeded',
  title text NOT NULL,
  employee_name text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  amount numeric,
  status text NOT NULL DEFAULT 'Open',
  created_by text NOT NULL DEFAULT 'manual',
  run_id uuid REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_records TO anon, authenticated;
GRANT ALL ON public.module_records TO service_role;
ALTER TABLE public.module_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access" ON public.module_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX module_records_mod_idx ON public.module_records (module, data_source, created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.module_records;