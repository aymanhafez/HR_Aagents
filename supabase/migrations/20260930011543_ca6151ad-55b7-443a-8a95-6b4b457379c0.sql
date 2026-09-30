CREATE TABLE public.uploaded_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  manager text NOT NULL DEFAULT '',
  grade text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT '',
  joined text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Active',
  salary numeric,
  utilization numeric,
  goal_achievement numeric,
  risk_flag text NOT NULL DEFAULT '',
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.uploaded_employees TO anon, authenticated;
GRANT ALL ON public.uploaded_employees TO service_role;
ALTER TABLE public.uploaded_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open read" ON public.uploaded_employees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Open insert" ON public.uploaded_employees FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Open delete" ON public.uploaded_employees FOR DELETE TO anon, authenticated USING (true);