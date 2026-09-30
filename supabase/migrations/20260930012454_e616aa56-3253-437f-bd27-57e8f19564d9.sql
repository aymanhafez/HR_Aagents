CREATE TABLE public.chat_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  assignee_name text NOT NULL,
  assignee_department text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'Medium',
  due_date date,
  status text NOT NULL DEFAULT 'Open',
  source_question text NOT NULL DEFAULT '',
  created_by_role text NOT NULL DEFAULT '',
  data_source text NOT NULL DEFAULT 'seeded',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_tasks TO anon, authenticated;
GRANT ALL ON public.chat_tasks TO service_role;
ALTER TABLE public.chat_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open read" ON public.chat_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Open insert" ON public.chat_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Open update" ON public.chat_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open delete" ON public.chat_tasks FOR DELETE TO anon, authenticated USING (true);