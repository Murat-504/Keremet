const express = require('express');
const pool    = require('../db/pool');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

const genPNR = () => 'KM-' + Math.random().toString(36).substr(2, 4).toUpperCase();

// GET /api/bookings — Все бронирования (admin) или свои (user)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `SELECT b.*, u.name AS user_name, f.flight_number, f.flight_date,
                      af.city AS from_city, at2.city AS to_city
               FROM bookings b
               LEFT JOIN users   u  ON b.user_id   = u.id
               LEFT JOIN flights f  ON b.flight_id  = f.id
               LEFT JOIN airports af  ON f.from_code = af.code
               LEFT JOIN airports at2 ON f.to_code   = at2.code
               ORDER BY b.booked_at DESC`;
      params = [];
    } else {
      query = `SELECT b.*, f.flight_number, f.flight_date, f.departure_time, f.arrival_time,
                      af.city AS from_city, at2.city AS to_city
               FROM bookings b
               LEFT JOIN flights f    ON b.flight_id  = f.id
               LEFT JOIN airports af  ON f.from_code = af.code
               LEFT JOIN airports at2 ON f.to_code   = at2.code
               WHERE b.user_id = $1 ORDER BY b.booked_at DESC`;
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings — Создать бронирование
router.post('/', authMiddleware, async (req, res) => {
  const { flight_id, passenger_name, passport, email, phone, seat_number, class: cls } = req.body;
  if (!flight_id || !passenger_name || !email)
    return res.status(400).json({ error: 'Заполните обязательные поля' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const flightRes = await client.query('SELECT * FROM flights WHERE id=$1 FOR UPDATE', [flight_id]);
    const flight = flightRes.rows[0];
    if (!flight) throw new Error('Рейс не найден');

    const seatCol  = cls === 'business' ? 'business_seats'  : 'economy_seats';
    const priceCol = cls === 'business' ? 'business_price'  : 'economy_price';
    if (flight[seatCol] < 1) throw new Error('Нет свободных мест');

    await client.query(`UPDATE flights SET ${seatCol} = ${seatCol} - 1 WHERE id=$1`, [flight_id]);

    const pnr = genPNR();
    const booking = await client.query(
      `INSERT INTO bookings(pnr,user_id,flight_id,passenger_name,passport,email,phone,seat_number,class,amount)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [pnr, req.user.id, flight_id, passenger_name, passport, email, phone,
       seat_number, cls || 'economy', flight[priceCol]]
    );

    await client.query(
      'UPDATE users SET bookings=bookings+1, spent=spent+$1 WHERE id=$2',
      [flight[priceCol], req.user.id]
    );

    await client.query('COMMIT');
    res.status(201).json(booking.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/bookings/:id/cancel — Отменить бронирование
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE bookings SET status='cancelled' WHERE id=$1 AND (user_id=$2 OR $3='admin') RETURNING *`,
      [req.params.id, req.user.id, req.user.role]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Бронирование не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/stats — Статистика (только admin)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [total, revenue, monthly] = await Promise.all([
      pool.query(`SELECT status, COUNT(*) FROM bookings GROUP BY status`),
      pool.query(`SELECT SUM(amount) AS total FROM bookings WHERE status != 'cancelled'`),
      pool.query(`SELECT DATE_TRUNC('month', booked_at) AS month, COUNT(*) AS count, SUM(amount) AS revenue
                  FROM bookings WHERE status != 'cancelled'
                  GROUP BY month ORDER BY month DESC LIMIT 6`),
    ]);
    res.json({ byStatus: total.rows, revenue: revenue.rows[0], monthly: monthly.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
