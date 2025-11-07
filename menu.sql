-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.category (
  id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp without time zone,
  deleted_at timestamp without time zone,
  CONSTRAINT category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.menu (
  id uuid NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category_id uuid NOT NULL,
  img_url text NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone,
  deleted_at timestamp without time zone,
  CONSTRAINT menu_pkey PRIMARY KEY (id),
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.category(id)
);