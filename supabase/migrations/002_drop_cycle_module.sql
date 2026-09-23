-- ============================================================================
-- HABITUO · Migración 002 (OPCIONAL): eliminar el módulo de Salud / Ciclo
-- El módulo se sacó de la app. Esto borra sus tablas y TODOS sus datos.
-- Correrlo solo si estás seguro de que no necesitás esos registros.
-- ============================================================================

DROP TABLE IF EXISTS public.cycle_predictions;
DROP TABLE IF EXISTS public.cycle_logs;
