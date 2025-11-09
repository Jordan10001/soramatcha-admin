
CREATE TABLE public.event (
  id uuid NOT NULL,
  name text NOT NULL,
  description text,
  locations text NOT NULL,
  img_url text NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone,
  CONSTRAINT event_pkey PRIMARY KEY (id)
);
