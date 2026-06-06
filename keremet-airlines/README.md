# ✈ КЕРЕМЕТ Airlines — Веб-система бронирования авиабилетов

> Дипломный проект | Стек: **React.js · Redux Toolkit · Node.js/Express · PostgreSQL · JWT · Docker**

---

## 📁 Структура проекта

```
keremet-airlines/
├── backend/                # Node.js / Express API
│   ├── src/
│   │   ├── app.js          # Точка входа сервера
│   │   ├── db/
│   │   │   ├── pool.js     # PostgreSQL пул соединений
│   │   │   └── init.js     # Скрипт инициализации БД
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT middleware
│   │   └── routes/
│   │       ├── auth.js     # POST /login, /register, GET /me
│   │       ├── flights.js  # CRUD рейсов
│   │       ├── bookings.js # Создание / отмена бронирований
│   │       ├── users.js    # Список пользователей
│   │       └── airports.js # Аэропорты
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React.js приложение
│   ├── src/
│   │   ├── main.jsx        # Точка входа React
│   │   ├── App.jsx         # Маршрутизация
│   │   ├── store/
│   │   │   └── index.js    # Redux Toolkit: auth/flights/bookings
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── SearchPage.jsx
│   │       ├── BookingPage.jsx
│   │       ├── DonePage.jsx
│   │       └── AdminPage.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── database/
│   └── schema.sql          # Схема + seed данные PostgreSQL
│
├── docker-compose.yml      # Запуск всего одной командой
└── README.md
```

---

## 🚀 СПОСОБ 1 — Docker (рекомендуется, самый простой)

### Требования
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac/Linux)

### Запуск

```bash
# 1. Перейдите в папку проекта
cd keremet-airlines

# 2. Запустите все сервисы одной командой
docker compose up --build

# 3. Откройте браузер
# Сайт:  http://localhost
# API:   http://localhost:5000/api/health
```

### Остановка

```bash
docker compose down          # остановить
docker compose down -v       # остановить + удалить данные БД
```

---

## 🛠 СПОСОБ 2 — Локальный запуск (без Docker)

### Требования
| Программа | Версия | Скачать |
|-----------|--------|---------|
| Node.js   | 18+    | https://nodejs.org |
| PostgreSQL | 14+   | https://www.postgresql.org/download/ |
| npm       | 9+     | входит в Node.js |

---

### Шаг 1 — Создайте базу данных PostgreSQL

```sql
-- Откройте pgAdmin или psql и выполните:
CREATE DATABASE keremet_airlines;
```

Или через терминал:
```bash
psql -U postgres -c "CREATE DATABASE keremet_airlines;"
```

---

### Шаг 2 — Загрузите схему и тестовые данные

```bash
psql -U postgres -d keremet_airlines -f database/schema.sql
```

> После этого в БД будут: аэропорты, 5 рейсов и аккаунт администратора.

---

### Шаг 3 — Настройте и запустите Backend

```bash
cd backend

# Установите зависимости
npm install

# Создайте файл настроек
cp .env.example .env
```

Откройте файл `.env` и заполните:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=keremet_airlines
DB_USER=postgres
DB_PASSWORD=ваш_пароль_postgresql
JWT_SECRET=keremet_super_secret_jwt_key_2025
FRONTEND_URL=http://localhost:5173
```

Запустите сервер:
```bash
# Для разработки (автоперезапуск при изменениях)
npm run dev

# Для продакшена
npm start
```

✅ Backend запущен: **http://localhost:5000**

---

### Шаг 4 — Запустите Frontend

Откройте **новый терминал**:

```bash
cd frontend

# Установите зависимости
npm install

# Запустите в режиме разработки
npm run dev
```

✅ Frontend запущен: **http://localhost:5173**

---

### Шаг 5 — Откройте сайт

Перейдите в браузере: **http://localhost:5173**

---

## 🔑 Аккаунты для тестирования

| Роль | Email | Пароль | Доступ |
|------|-------|--------|--------|
| **Администратор** | admin@keremet.kg | admin123 | Полная панель управления |
| **Пользователь** | Регистрация на сайте | любой | Поиск и бронирование |

---

## 📡 API Endpoints

```
POST   /api/auth/register     — Регистрация
POST   /api/auth/login        — Вход
GET    /api/auth/me           — Текущий пользователь (JWT)

GET    /api/flights           — Список рейсов (фильтры: from, to, date)
GET    /api/flights/:id       — Один рейс
POST   /api/flights           — Создать рейс [admin]
PUT    /api/flights/:id       — Обновить рейс [admin]
DELETE /api/flights/:id       — Удалить рейс [admin]

GET    /api/bookings          — Мои бронирования / все [admin]
POST   /api/bookings          — Создать бронирование [user]
PATCH  /api/bookings/:id/cancel — Отменить бронирование
GET    /api/bookings/stats    — Статистика [admin]

GET    /api/users             — Список пользователей [admin]
GET    /api/airports          — Список аэропортов

GET    /api/health            — Проверка состояния сервера
```

---

## 🧰 Команды для разработки

```bash
# Backend — режим разработки с hot-reload
cd backend && npm run dev

# Frontend — Vite dev server
cd frontend && npm run dev

# Frontend — сборка для продакшена
cd frontend && npm run build

# Инициализация БД (если schema.sql не загрузился)
cd backend && npm run db:init
```

---

## ⚠️ Частые проблемы

**Ошибка подключения к БД:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Убедитесь что PostgreSQL запущен. Windows: `services.msc` → PostgreSQL.

**Порт 5173 занят:**
```bash
# Измените порт в frontend/vite.config.js
server: { port: 3000 }
```

**npm install зависает:**
```bash
npm install --legacy-peer-deps
```

**Docker: порт 80 занят:**
```yaml
# В docker-compose.yml измените порт фронтенда
ports:
  - "8080:80"   # вместо "80:80"
```
Затем откройте http://localhost:8080

---

## 🏗 Архитектура

```
Браузер (React + Redux)
      │ HTTP / JSON
      ▼
Nginx (порт 80)
      │ /api/* → proxy_pass
      ▼
Express.js (порт 5000)
      │ JWT Auth Middleware
      │ Express Router
      ▼
PostgreSQL (порт 5432)
      └── users / airports / flights / bookings
```

---

*© 2025 Авиакомпания КЕРЕМЕТ · Бишкек, Кыргызстан*
