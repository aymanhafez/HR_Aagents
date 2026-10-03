CREATE TABLE public.employee_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source text NOT NULL DEFAULT 'seeded',
  employee_key text NOT NULL,
  employee_name text NOT NULL,
  field text NOT NULL,
  old_value text NOT NULL DEFAULT '',
  new_value text NOT NULL,
  reason text NOT NULL DEFAULT '',
  run_id uuid REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  approval_id uuid REFERENCES public.agent_approvals(id) ON DELETE SET NULL,
  approved_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.employee_changes TO anon, authenticated;
GRANT ALL ON public.employee_changes TO service_role;
ALTER TABLE public.employee_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open read" ON public.employee_changes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Open insert" ON public.employee_changes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX employee_changes_emp_idx ON public.employee_changes (data_source, employee_key, created_at);

GRANT UPDATE ON public.uploaded_employees TO anon, authenticated;
CREATE POLICY "Open update" ON public.uploaded_employees FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_changes;