const express = require('express');
const pool    = require('../db/pool');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/flights — Список рейсов (с фильтрами)
router.get('/', async (req, res) => {
  const { from, to, date, status } = req.query;
  let query = `
    SELECT f.*,
           af.city AS from_city, af.country AS from_country,
           at2.city AS to_city,  at2.country AS to_country
    FROM flights f
    JOIN airports af  ON f.from_code = af.code
    JOIN airports at2 ON f.to_code   = at2.code
    WHERE 1=1
  `;
  const params = [];
  if (from)   { params.push(from);   query += ` AND f.from_code = $${params.length}`; }
  if (to)     { params.push(to);     query += ` AND f.to_code   = $${params.length}`; }
  if (date)   { params.push(date);   query += ` AND f.flight_date = $${params.length}`; }
  if (status) { params.push(status); query += ` AND f.status = $${params.length}`; }
  query += ' ORDER BY f.flight_date, f.departure_time';
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flights/:id — Один рейс
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, af.city AS from_city, at2.city AS to_city
       FROM flights f
       JOIN airports af  ON f.from_code = af.code
       JOIN airports at2 ON f.to_code   = at2.code
       WHERE f.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Рейс не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/flights — Создать рейс (только admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { flight_number, from_code, to_code, departure_time, arrival_time,
          duration, flight_date, aircraft, economy_price, business_price,
          economy_seats, business_seats } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO flights(flight_number,from_code,to_code,departure_time,arrival_time,
        duration,flight_date,aircraft,economy_price,business_price,economy_seats,business_seats)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [flight_number, from_code, to_code, departure_time, arrival_time,
       duration, flight_date, aircraft, economy_price, business_price,
       economy_seats || 150, business_seats || 24]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/flights/:id — Обновить рейс (только admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const fields = ['flight_number','from_code','to_code','departure_time','arrival_time',
                  'duration','flight_date','aircraft','economy_price','business_price',
                  'economy_seats','business_seats','status'];
  const updates = [];
  const values  = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) { values.push(req.body[f]); updates.push(`${f}=$${values.length}`); }
  });
  if (!updates.length) return res.status(400).json({ error: 'Нет данных для обновления' });
  values.push(req.params.id);
  try {
    const result = await pool.query(
      `UPDATE flights SET ${updates.join(',')} WHERE id=$${values.length} RETURNING *`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Рейс не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/flights/:id — Удалить рейс (только admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM flights WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Рейс не найден' });
    res.json({ message: 'Рейс удалён', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
