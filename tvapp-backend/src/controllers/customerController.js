const pool = require('../config/db');

exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM accounts WHERE role = ?', ['customer']);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ? AND role = ?', [req.params.id, 'customer']);
    if (!rows.length) return res.status(404).json({ message: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  const { name, email, phone, balance, password } = req.body;
  try {
    // Check if email already exists
    const [existingRows] = await pool.query('SELECT * FROM accounts WHERE email = ?', [email]);
    if (existingRows.length) return res.status(400).json({ message: 'Email already exists' });
    
    // Hash password if provided, otherwise generate a default one
    const bcrypt = require('bcryptjs');
    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('default123', 10);
    
    await pool.query('INSERT INTO accounts (name, email, phone, balance, role, password) VALUES (?, ?, ?, ?, ?, ?)', [name, email, phone, balance || 0, 'customer', hashedPassword]);
    res.status(201).json({ message: 'Customer created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { name, email, phone, balance } = req.body;
  try {
    await pool.query('UPDATE accounts SET name=?, email=?, phone=?, balance=? WHERE id=? AND role=?', [name, email, phone, balance, req.params.id, 'customer']);
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await pool.query('DELETE FROM accounts WHERE id=? AND role=?', [req.params.id, 'customer']);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 