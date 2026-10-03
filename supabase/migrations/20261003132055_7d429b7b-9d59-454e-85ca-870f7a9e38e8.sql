CREATE TABLE public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent text NOT NULL,
  objective text NOT NULL,
  requested_by_role text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'Medium',
  deadline date,
  status text NOT NULL DEFAULT 'planning',
  progress int NOT NULL DEFAULT 0,
  data_source text NOT NULL DEFAULT 'seeded',
  plan_summary text NOT NULL DEFAULT '',
  blocker text NOT NULL DEFAULT '',
  report jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.agent_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  idx int NOT NULL,
  title text NOT NULL,
  tool text NOT NULL DEFAULT 'analyze',
  risk text NOT NULL DEFAULT 'low',
  status text NOT NULL DEFAULT 'pending',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb,
  evidence text NOT NULL DEFAULT '',
  error text NOT NULL DEFAULT '',
  attempts int NOT NULL DEFAULT 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.agent_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  step_id uuid REFERENCES public.agent_steps(id) ON DELETE CASCADE,
  approver_role text NOT NULL DEFAULT '',
  reason text NOT NULL DEFAULT '',
  risk text NOT NULL DEFAULT 'high',
  alternatives text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  note text NOT NULL DEFAULT '',
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.agent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  step_id uuid,
  type text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_tasks ADD COLUMN run_id uuid;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['agent_runs','agent_steps','agent_approvals','agent_events'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Open access" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER agent_runs_touch BEFORE UPDATE ON public.agent_runs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Demo runs
INSERT INTO public.agent_runs (id, agent, objective, requested_by_role, priority, status, progress, plan_summary, blocker, report) VALUES
('11111111-0000-4000-8000-000000000001','recruitment','Hire a Senior Data Analyst for the Analytics team','manager','High','waiting_approval',45,'Validate need, check internal talent, draft requisition, request hiring approval, then source.','',NULL),
('11111111-0000-4000-8000-000000000002','payroll','Audit the October payroll run before close','cfo','Critical','completed',100,'Scan anomalies, reconcile overtime, flag leakage, prepare sign-off pack.','', '{"objective":"Audit the October payroll run before close","completed":["Scanned 1,284 payslips","Reconciled Support overtime","Flagged 3 duplicate allowances"],"not_completed":[],"decisions":["CFO approved release after corrections"],"issues":["3 duplicate allowances totalling $4,180"],"result":"Payroll cleared for release with corrections applied.","impact":"$4,180 leakage prevented; close 1 day earlier.","recommendations":["Add duplicate-allowance rule to monthly checks"]}'::jsonb),
('11111111-0000-4000-8000-000000000003','workforce','Reduce Support overtime by 20% this quarter','chro','High','blocked',60,'Analyse overtime drivers, model redeployment vs hiring, propose shift changes.','Shift roster for November is missing — Workforce Planning lead must upload it.',NULL);

INSERT INTO public.agent_steps (run_id, idx, title, tool, risk, status, evidence) VALUES
('11111111-0000-4000-8000-000000000001',1,'Validate manpower request','analyze','low','done','Analytics utilization 94%, 2 open projects unstaffed.'),
('11111111-0000-4000-8000-000000000001',2,'Search internal employees','search_employees','low','done','No internal analyst with SQL + BI at required grade.'),
('11111111-0000-4000-8000-000000000001',3,'Draft job description','draft_document','low','done','JD drafted: Senior Data Analyst, grade G7.'),
('11111111-0000-4000-8000-000000000001',4,'Request hiring approval','request_approval','high','waiting',''),
('11111111-0000-4000-8000-000000000001',5,'Create sourcing task for Talent Acquisition','create_task','medium','pending',''),
('11111111-0000-4000-8000-000000000002',1,'Scan payslips for anomalies','analyze','low','done','1,284 payslips scanned.'),
('11111111-0000-4000-8000-000000000002',2,'Request payroll release approval','request_approval','high','done','Approved by CFO.'),
('11111111-0000-4000-8000-000000000003',1,'Analyse overtime drivers','analyze','low','done','Overtime +23% driven by 4 vacancies.'),
('11111111-0000-4000-8000-000000000003',2,'Model redeployment vs hiring','compute_metric','low','done','Redeploy 3 FTE saves $38k vs hire.'),
('11111111-0000-4000-8000-000000000003',3,'Propose November shift changes','analyze','medium','blocked','');

INSERT INTO public.agent_approvals (run_id, approver_role, reason, risk, alternatives)
SELECT '11111111-0000-4000-8000-000000000001', 'CHRO', 'Open a new Senior Data Analyst headcount (G7, est. $96k/yr).', 'high', 'Contractor for 6 months ($58k) or upskill Dana Lewis (4 months).';
UPDATE public.agent_approvals SET step_id = (SELECT id FROM public.agent_steps WHERE run_id='11111111-0000-4000-8000-000000000001' AND idx=4);

INSERT INTO public.agent_events (run_id, type, message) VALUES
('11111111-0000-4000-8000-000000000001','info','Run started by Line Manager'),
('11111111-0000-4000-8000-000000000001','approval','Waiting for CHRO approval on new headcount'),
('11111111-0000-4000-8000-000000000002','done','Run completed and report generated'),
('11111111-0000-4000-8000-000000000003','blocker','Blocked: November shift roster missing');