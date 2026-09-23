-- ============================================================================
-- HABITUO · Migración 001: seguridad de planes y límites en el servidor
-- Ejecutar UNA vez en Supabase → SQL Editor. Es idempotente (se puede re-correr).
--
-- Qué arregla:
--   1. Un usuario podía hacerse Premium solo (update de "plan" desde el navegador).
--   2. Faltaba la columna mp_subscription_id que usa el webhook de MercadoPago.
--   3. Los límites del plan Free solo se validaban en el frontend.
--   4. El chat de IA no tenía límite de uso (costos de la API sin tope).
--   5. Las vistas de resumen salteaban RLS (se podían leer datos de otros usuarios).
--
-- Los límites acá DEBEN coincidir con lib/plans.ts.
-- ============================================================================

-- 1) Columnas faltantes -------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;

ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5);

-- 2) Proteger columnas de facturación ----------------------------------------
-- El usuario puede seguir editando su nombre, avatar, moneda, etc.
-- pero "plan" y "mp_subscription_id" solo los cambia el backend (service_role).
CREATE OR REPLACE FUNCTION public.protect_billing_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo se restringe a requests de usuarios (anon/authenticated).
  -- service_role (webhook) y el SQL Editor (postgres) pueden cambiar el plan.
  IF coalesce(auth.role(), '') IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.plan := 'free';
      NEW.mp_subscription_id := NULL;
    ELSIF NEW.plan IS DISTINCT FROM OLD.plan
       OR NEW.mp_subscription_id IS DISTINCT FROM OLD.mp_subscription_id THEN
      RAISE EXCEPTION 'No tenés permiso para modificar el plan'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_billing_columns ON public.profiles;
CREATE TRIGGER protect_billing_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_billing_columns();

-- Nota: el alta la hace handle_new_user() con plan por defecto 'free'.

-- 3) Límites del plan Free ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_premium(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((SELECT plan IN ('premium', 'pro') FROM public.profiles WHERE id = uid), false);
$$;

CREATE OR REPLACE FUNCTION public.enforce_free_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  month_start TIMESTAMPTZ := date_trunc('month', now());
BEGIN
  -- Solo aplica a requests de usuarios; el backend y el SQL Editor no tienen límites
  IF coalesce(auth.role(), '') NOT IN ('anon', 'authenticated') OR public.is_premium(NEW.user_id) THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'habits' THEN
    -- Solo cuenta si el hábito queda activo (alta o reactivación)
    IF NEW.is_active IS NOT TRUE THEN RETURN NEW; END IF;
    IF TG_OP = 'UPDATE' AND OLD.is_active IS TRUE THEN RETURN NEW; END IF;

    SELECT count(*) INTO current_count
      FROM public.habits
     WHERE user_id = NEW.user_id AND is_active = TRUE;

    IF current_count >= 3 THEN
      RAISE EXCEPTION 'FREE_LIMIT_REACHED:habits' USING ERRCODE = 'P0001';
    END IF;

  ELSIF TG_TABLE_NAME = 'transactions' THEN
    -- Por created_at (no por "date") para que no se pueda esquivar cargando fechas viejas
    SELECT count(*) INTO current_count
      FROM public.transactions
     WHERE user_id = NEW.user_id AND created_at >= month_start;

    IF current_count >= 20 THEN
      RAISE EXCEPTION 'FREE_LIMIT_REACHED:transactions' USING ERRCODE = 'P0001';
    END IF;

  ELSIF TG_TABLE_NAME = 'journal_entries' THEN
    SELECT count(*) INTO current_count
      FROM public.journal_entries
     WHERE user_id = NEW.user_id AND created_at >= month_start;

    IF current_count >= 10 THEN
      RAISE EXCEPTION 'FREE_LIMIT_REACHED:journalEntries' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_free_limits ON public.habits;
CREATE TRIGGER enforce_free_limits
  BEFORE INSERT OR UPDATE OF is_active ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_limits();

DROP TRIGGER IF EXISTS enforce_free_limits ON public.transactions;
CREATE TRIGGER enforce_free_limits
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_limits();

DROP TRIGGER IF EXISTS enforce_free_limits ON public.journal_entries;
CREATE TRIGGER enforce_free_limits
  BEFORE INSERT ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_limits();

-- 4) Cuota diaria del coach IA ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date,
  messages INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ai_usage" ON public.ai_usage;
CREATE POLICY "Users can view own ai_usage" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);
-- Sin policies de INSERT/UPDATE: solo se escribe vía consume_ai_message().

-- Descuenta 1 mensaje de la cuota del día. Devuelve false si ya no quedan.
CREATE OR REPLACE FUNCTION public.consume_ai_message()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  today DATE := (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
  daily_limit INTEGER;
  used INTEGER;
BEGIN
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  daily_limit := CASE WHEN public.is_premium(uid) THEN 100 ELSE 10 END;

  INSERT INTO public.ai_usage (user_id, day, messages)
  VALUES (uid, today, 1)
  ON CONFLICT (user_id, day)
  DO UPDATE SET messages = public.ai_usage.messages + 1
  WHERE public.ai_usage.messages < daily_limit
  RETURNING messages INTO used;

  -- Si el UPDATE no aplicó (cuota agotada), "used" queda NULL
  RETURN used IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_message() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_message() TO authenticated;

-- 5) Vistas: respetar RLS del usuario que consulta ----------------------------
-- (por defecto una vista corre con los permisos del dueño y saltea RLS)
ALTER VIEW IF EXISTS public.monthly_expense_summary SET (security_invoker = true);
ALTER VIEW IF EXISTS public.habit_streaks SET (security_invoker = true);
