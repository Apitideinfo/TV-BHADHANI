const pool = require('../config/db');

exports.getPayments = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPayment = async (req, res) => {
  const { customer_id, amount, due_date, status, collection_id } = req.body;
  try {
    // Verify customer exists and is a customer
    const [customerRows] = await pool.query('SELECT * FROM accounts WHERE id = ? AND role = ?', [customer_id, 'customer']);
    if (!customerRows.length) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // If collection_id is provided, verify it exists
    if (collection_id) {
      const [collectionRows] = await pool.query('SELECT * FROM collections WHERE id = ?', [collection_id]);
      if (!collectionRows.length) {
        return res.status(404).json({ message: 'Collection not found' });
      }
    }
    
    // Only include collection_id in the query if it's provided
    const query = collection_id 
      ? 'INSERT INTO payments (customer_id, amount, due_date, status, collection_id) VALUES (?, ?, ?, ?, ?)'
      : 'INSERT INTO payments (customer_id, amount, due_date, status) VALUES (?, ?, ?, ?)';
    
    const values = collection_id 
      ? [customer_id, amount, due_date, status || 'pending', collection_id]
      : [customer_id, amount, due_date, status || 'pending'];
    
    await pool.query(query, values);
    res.status(201).json({ message: 'Payment created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  const { customer_id, amount, due_date, status, collection_id } = req.body;
  try {
    await pool.query('UPDATE payments SET customer_id=?, amount=?, due_date=?, status=?, collection_id=? WHERE id=?', [customer_id, amount, due_date, status, collection_id, req.params.id]);
    res.json({ message: 'Payment updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await pool.query('DELETE FROM payments WHERE id=?', [req.params.id]);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 