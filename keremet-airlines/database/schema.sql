-- ══════════════════════════════════════════════════
--   Keremet Airlines — PostgreSQL Schema
--   Запуск: psql -U postgres -d keremet_airlines -f schema.sql
-- ══════════════════════════════════════════════════

-- Создание БД (выполнять отдельно от psql под postgres)
-- CREATE DATABASE keremet_airlines;

-- ── Пользователи ──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin')),
    bookings    INTEGER DEFAULT 0,
    spent       NUMERIC(12,2) DEFAULT 0,
    status      VARCHAR(20) DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Аэропорты ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS airports (
    code        CHAR(3) PRIMARY KEY,
    city        VARCHAR(100) NOT NULL,
    country     VARCHAR(100) NOT NULL
);

-- ── Рейсы ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flights (
    id              SERIAL PRIMARY KEY,
    flight_number   VARCHAR(10) UNIQUE NOT NULL,
    from_code       CHAR(3) REFERENCES airports(code),
    to_code         CHAR(3) REFERENCES airports(code),
    departure_time  TIME NOT NULL,
    arrival_time    TIME NOT NULL,
    duration        VARCHAR(20),
    flight_date     DATE NOT NULL,
    aircraft        VARCHAR(50),
    economy_price   NUMERIC(10,2) NOT NULL,
    business_price  NUMERIC(10,2) NOT NULL,
    economy_seats   INTEGER DEFAULT 150,
    business_seats  INTEGER DEFAULT 24,
    status          VARCHAR(20) DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','delayed','cancelled','completed')),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Бронирования ──────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id              SERIAL PRIMARY KEY,
    pnr             VARCHAR(10) UNIQUE NOT NULL,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    flight_id       INTEGER REFERENCES flights(id) ON DELETE SET NULL,
    passenger_name  VARCHAR(100) NOT NULL,
    passport        VARCHAR(20),
    email           VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    seat_number     VARCHAR(5),
    class           VARCHAR(20) DEFAULT 'economy' CHECK (class IN ('economy','business')),
    amount          NUMERIC(10,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed','pending','cancelled')),
    booked_at       TIMESTAMP DEFAULT NOW()
);

-- ── Индексы ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_flights_date   ON flights(flight_date);
CREATE INDEX IF NOT EXISTS idx_flights_route  ON flights(from_code, to_code);
CREATE INDEX IF NOT EXISTS idx_bookings_user  ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr   ON bookings(pnr);

-- ══════════════════════════════════════════════════
--   SEED DATA — начальные данные
-- ══════════════════════════════════════════════════

-- Аэропорты
INSERT INTO airports(code,city,country) VALUES
  ('FRU','Бишкек','Кыргызстан'),
  ('OSS','Ош','Кыргызстан'),
  ('JLB','Джалал-Абад','Кыргызстан'),
  ('SVO','Москва','Россия'),
  ('IST','Стамбул','Турция'),
  ('DXB','Дубай','ОАЭ'),
  ('ALA','Алматы','Казахстан')
ON CONFLICT DO NOTHING;

-- Рейсы
INSERT INTO flights(flight_number,from_code,to_code,departure_time,arrival_time,duration,flight_date,aircraft,economy_price,business_price,economy_seats,business_seats) VALUES
  ('KM101','FRU','OSS','08:00','09:30','1ч 30м','2025-06-15','Airbus A320',3500,8900,45,8),
  ('KM205','FRU','SVO','14:30','16:45','4ч 15м','2025-06-15','Boeing 737',15900,42000,32,4),
  ('KM318','FRU','IST','22:10','02:30','5ч 20м','2025-06-16','Airbus A320',22500,58000,18,2),
  ('KM422','FRU','DXB','03:45','06:30','4ч 45м','2025-06-16','Boeing 737',28000,72000,67,12),
  ('KM507','FRU','ALA','11:20','12:05','0ч 45м','2025-06-17','Airbus A320',5800,14500,88,15)
ON CONFLICT DO NOTHING;

-- Админ (пароль: admin123)
INSERT INTO users(name,email,phone,password,role) VALUES
  ('Администратор','admin@keremet.kg','+996 312 550000','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin')
ON CONFLICT DO NOTHING;
