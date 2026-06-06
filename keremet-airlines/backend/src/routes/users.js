const express = require('express');
const pool    = require('../db/pool');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — Все пользователи (только admin)
router.get('/', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,name,email,phone,role,bookings,spent,status,created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/users/:id/status — Изменить статус пользователя
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['active','inactive'].includes(status))
    return res.status(400).json({ error: 'Недопустимый статус' });
  try {
    const result = await pool.query(
      'UPDATE users SET status=$1 WHERE id=$2 RETURNING id,name,email,status',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
