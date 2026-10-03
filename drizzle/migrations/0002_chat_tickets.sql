CREATE TABLE public.chat_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number bigserial,
  request text NOT NULL,
  objective text NOT NULL DEFAULT '',
  run_id uuid REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  agent text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  data_source text NOT NULL DEFAULT 'seeded',
  status text NOT NULL DEFAULT 'Open',
  result text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_tickets TO anon, authenticated;
GRANT ALL ON public.chat_tickets TO service_role;
GRANT USAGE ON SEQUENCE public.chat_tickets_number_seq TO anon, authenticated, service_role;
ALTER TABLE public.chat_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access" ON public.chat_tickets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER chat_tickets_touch BEFORE UPDATE ON public.chat_tickets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_tickets;