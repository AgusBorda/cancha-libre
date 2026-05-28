-- ============================================================
-- CanchaLibre - Seed de ejemplo
-- IMPORTANTE: Primero crear el usuario admin en Supabase Auth
-- (Authentication > Users > Add user)
-- Luego reemplazar 'REEMPLAZAR-CON-UUID-DEL-ADMIN' con el UUID real
-- ============================================================

-- Una vez creado el admin user, ejecutar:

/*
INSERT INTO complexes (
  owner_id, name, slug, description,
  address, city, province,
  phone, whatsapp, instagram,
  rules, services, is_active
) VALUES (
  'REEMPLAZAR-CON-UUID-DEL-ADMIN',
  'Complejo Los Pibes',
  'complejo-los-pibes',
  'El mejor complejo de barrio. 3 canchas de fútbol 5 con césped sintético de última generación. Ambiente familiar.',
  'Av. Corrientes 1234',
  'Buenos Aires',
  'CABA',
  '1123456789',
  '5491123456789',
  '@complejoslospibes',
  'Puntualidad obligatoria. La cancha se libera si no aparecés en 10 minutos pasada la hora.
Cancelaciones con 24hs de anticipación para devolución de seña.
Obligatorio: botines o zapatillas. Prohibido zapatos de fútbol 11 en césped sintético.',
  ARRAY['Estacionamiento', 'Vestuarios', 'Duchas', 'Bar / Cantina', 'Iluminación nocturna'],
  TRUE
) RETURNING id;
*/

-- Luego insertar canchas reemplazando COMPLEX_ID con el id retornado:
/*
INSERT INTO courts (complex_id, name, type, capacity, price_per_hour, deposit_amount, is_active)
VALUES
  ('COMPLEX_ID', 'Cancha 1 - Fútbol 5', 'F5', 10, 25000, 5000, TRUE),
  ('COMPLEX_ID', 'Cancha 2 - Fútbol 5', 'F5', 10, 25000, 5000, TRUE),
  ('COMPLEX_ID', 'Cancha 3 - Fútbol 7', 'F7', 14, 35000, 8000, TRUE);
*/

-- Luego insertar horarios reemplazando COURT_1_ID, COURT_2_ID, COURT_3_ID:
-- Lunes a Viernes 08:00 - 23:00, Sábado/Domingo 08:00 - 24:00
/*
INSERT INTO schedules (court_id, day_of_week, start_time, end_time, slot_duration, is_active)
SELECT
  unnest(ARRAY['COURT_1_ID', 'COURT_2_ID', 'COURT_3_ID']::UUID[]),
  day,
  CASE WHEN day IN (0,6) THEN '08:00' ELSE '08:00' END::TIME,
  CASE WHEN day IN (0,6) THEN '24:00' ELSE '23:00' END::TIME,
  60,
  TRUE
FROM generate_series(0, 6) AS day;
*/
