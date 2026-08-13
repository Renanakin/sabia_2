-- Script ejecutado automáticamente por la imagen de Postgres al primer arranque.
-- Crea los roles separados que la app espera:
--   - sabia_user: usuario de aplicación (sin permisos peligrosos)
--   - sabia_migrator: usuario SOLO para migraciones
--
-- ⚠️  En producción estos usuarios/contraseñas se generan en provisioning
-- y NO usan este script. Ver docs/ORQUESTADOR.md Fase 9.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sabia_user') THEN
    CREATE ROLE sabia_user LOGIN PASSWORD 'sabia_dev_password_change_me';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sabia_migrator') THEN
    CREATE ROLE sabia_migrator LOGIN PASSWORD 'sabia_dev_migrator_change_me' SUPERUSER;
  END IF;
END
$$;

-- Conceder permisos al usuario de aplicación
GRANT CONNECT ON DATABASE sabia_dev TO sabia_user;
GRANT USAGE ON SCHEMA public TO sabia_user;
GRANT CREATE ON SCHEMA public TO sabia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sabia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sabia_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO sabia_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO sabia_user;
