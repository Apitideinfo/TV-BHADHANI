const pool = require('../config/db');

exports.getRecharges = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recharges');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecharge = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recharges WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Recharge not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRecharge = async (req, res) => {
  const { customer_id, amount } = req.body;
  try {
    // Verify customer exists and is a customer
    const [customerRows] = await pool.query('SELECT * FROM accounts WHERE id = ? AND role = ?', [customer_id, 'customer']);
    if (!customerRows.length) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    await pool.query('INSERT INTO recharges (customer_id, amount) VALUES (?, ?)', [customer_id, amount]);
    
    // Update customer balance only if status is verified
    // For pending recharges, balance should not be updated until verified
    res.status(201).json({ message: 'Recharge created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRecharge = async (req, res) => {
  const { customer_id, amount, status } = req.body;
  try {
    // Get the original recharge to check if status changed
    const [originalRows] = await pool.query('SELECT * FROM recharges WHERE id = ?', [req.params.id]);
    if (!originalRows.length) {
      return res.status(404).json({ message: 'Recharge not found' });
    }
    
    const originalRecharge = originalRows[0];
    
    await pool.query('UPDATE recharges SET customer_id=?, amount=?, status=?, verified_at=? WHERE id=?', 
      [customer_id, amount, status || originalRecharge.status, status === 'verified' ? new Date() : originalRecharge.verified_at, req.params.id]);
    
    // If status changed to verified, update customer balance
    if (status === 'verified' && originalRecharge.status !== 'verified') {
      await pool.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, customer_id]);
    }
    // If status changed from verified to rejected, remove the balance
    else if (originalRecharge.status === 'verified' && status === 'rejected') {
      await pool.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [originalRecharge.amount, customer_id]);
    }
    
    res.json({ message: 'Recharge updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRecharge = async (req, res) => {
  try {
    await pool.query('DELETE FROM recharges WHERE id=?', [req.params.id]);
    res.json({ message: 'Recharge deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 