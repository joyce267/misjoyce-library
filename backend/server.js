require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// HOME
app.get('/', (req, res) => {
  res.json({
    message: 'Miss Jay Community Library API is running!'
  });
});

// DATABASE HEALTH CHECK
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS connected');

    res.json({
      message: 'Backend and database are connected.',
      database: rows[0].connected === 1
        ? 'Connected'
        : 'Not connected'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed.',
      error: error.message
    });
  }
});


// GET all books
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM books ORDER BY title'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one book
app.get('/api/books/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Book not found.'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD a book
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const amount = Number(quantity);

    if (
      !title?.trim() ||
      !author?.trim() ||
      !genre?.trim() ||
      !isbn?.trim() ||
      quantity === undefined ||
      quantity === null ||
      quantity === '' ||
      !Number.isInteger(amount) ||
      amount < 0
    ) {
      return res.status(400).json({
        message: 'Please provide valid book details and a non-negative whole-number quantity.'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO books
       (title, author, genre, isbn, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        author.trim(),
        genre.trim(),
        isbn.trim(),
        amount
      ]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: error.code === 'ER_DUP_ENTRY'
        ? 'A book with this ISBN already exists.'
        : error.message
    });
  }
});

// UPDATE a book
app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const amount = Number(quantity);

    if (
      !title?.trim() ||
      !author?.trim() ||
      !genre?.trim() ||
      !isbn?.trim() ||
      quantity === undefined ||
      quantity === null ||
      quantity === '' ||
      !Number.isInteger(amount) ||
      amount < 0
    ) {
      return res.status(400).json({
        message: 'Please provide valid book details and a non-negative whole-number quantity.'
      });
    }

    const [result] = await pool.execute(
      `UPDATE books
       SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
       WHERE id = ?`,
      [
        title.trim(),
        author.trim(),
        genre.trim(),
        isbn.trim(),
        amount,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      const [existing] = await pool.execute(
        'SELECT id FROM books WHERE id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: 'Book not found.'
        });
      }
    }

    const [rows] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: error.code === 'ER_DUP_ENTRY'
        ? 'A book with this ISBN already exists.'
        : error.message
    });
  }
});

// DELETE a book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM books WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Book not found.'
      });
    }

    res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    res.status(error.code === 'ER_ROW_IS_REFERENCED_2' ? 409 : 500).json({
      message: error.code === 'ER_ROW_IS_REFERENCED_2'
        ? 'This book has transaction history and cannot be deleted.'
        : error.message
    });
  }
});

app.get('/api/users', async (req, res) => {
try {
const [rows] = await pool.query(
'SELECT id, name, membershipId, email, role, created_at FROM users ORDER BY name'
);
res.json(rows);
} catch (error) {
res.status(500).json({ message: error.message });
}
});


// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, membershipId, email, role, created_at FROM users ORDER BY name'
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD a user
app.post('/api/users', async (req, res) => {
  try {
    const { name, membershipId, password, role = 'member' } = req.body;

    if (!name?.trim() || !membershipId?.trim() || !password || password.length < 8) {
      return res.status(400).json({
        message: 'Name, membership ID and a password of at least 8 characters are required.'
      });
    }

    if (!['member', 'librarian'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user role.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, membershipId, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), membershipId.trim(), hashedPassword, role]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      membershipId: membershipId.trim(),
      role
    });
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: error.code === 'ER_DUP_ENTRY'
        ? 'That membership ID is already in use.'
        : error.message
    });
  }
});
// UPDATE a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, membershipId, password, role } = req.body;
    const { id } = req.params;

    if (!name?.trim() || !membershipId?.trim()) {
      return res.status(400).json({
        message: 'Name and membership ID are required.'
      });
    }

    if (!['member', 'librarian'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user role.' });
    }

    let sql;
    let values;

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          message: 'Password must contain at least 8 characters.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      sql = `
        UPDATE users
        SET name = ?, membershipId = ?, password = ?, role = ?
        WHERE id = ?
      `;

      values = [name.trim(), membershipId.trim(), hashedPassword, role, id];
    } else {
      sql = `
        UPDATE users
        SET name = ?, membershipId = ?, role = ?
        WHERE id = ?
      `;

      values = [name.trim(), membershipId.trim(), role, id];
    }

    const [result] = await pool.execute(sql, values);

    if (result.affectedRows === 0) {
      const [existingUser] = await pool.execute(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (existingUser.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
    }

    res.json({ message: 'User updated successfully.' });
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: error.code === 'ER_DUP_ENTRY'
        ? 'That membership ID is already in use.'
        : error.message
    });
  }
});

// DELETE a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(error.code === 'ER_ROW_IS_REFERENCED_2' ? 409 : 500).json({
      message: error.code === 'ER_ROW_IS_REFERENCED_2'
        ? 'This user has transaction history and cannot be deleted.'
        : error.message
    });
  }
});

// LOGIN using membership ID
app.post('/api/login', async (req, res) => {
try {
const { membershipId, password } = req.body;

if (!membershipId?.trim() || !password) {
  return res.status(400).json({
    message: 'Membership ID and password are required.'
  });
}

const [rows] = await pool.execute(
  'SELECT id, name, membershipId, password, role FROM users WHERE membershipId = ?',
  [membershipId.trim()]
);

if (rows.length === 0) {
  return res.status(401).json({
    message: 'Invalid membership ID or password.'
  });
}

const user = rows[0];
const validPassword = await bcrypt.compare(password, user.password);

if (!validPassword) {
  return res.status(401).json({
    message: 'Invalid membership ID or password.'
  });
}

res.json({
  message: 'Login successful.',
  user: {
    id: user.id,
    name: user.name,
    membershipId: user.membershipId,
    role: user.role
  }
});
} catch (error) {
res.status(500).json({ message: error.message });
}
});
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.book_id,
        t.user_id,
        b.title AS book_title,
        u.name AS borrower_name,
        t.borrow_date,
        t.return_date,
        t.status
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.borrow_date DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/transactions/borrow', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { book_id, user_id } = req.body;

    if (!book_id || !user_id) {
      return res.status(400).json({ message: 'Book and borrower are required.' });
    }

    await connection.beginTransaction();

    const [books] = await connection.execute(
      'SELECT id, quantity FROM books WHERE id = ? FOR UPDATE',
      [book_id]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Book not found.' });
    }

    if (books[0].quantity < 1) {
      await connection.rollback();
      return res.status(400).json({ message: 'This book is out of stock.' });
    }

    const [users] = await connection.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0 || users[0].role !== 'member') {
      await connection.rollback();
      return res.status(400).json({ message: 'A valid library member is required.' });
    }

    await connection.execute(
      'UPDATE books SET quantity = quantity - 1 WHERE id = ?',
      [book_id]
    );

    const [result] = await connection.execute(
      'INSERT INTO transactions (book_id, user_id, status) VALUES (?, ?, ?)',
      [book_id, user_id, 'borrowed']
    );

    await connection.commit();

    res.status(201).json({
      message: 'Book borrowed successfully.',
      transactionId: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

app.put('/api/transactions/:id/return', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT id, book_id, status FROM transactions WHERE id = ? FOR UPDATE',
      [req.params.id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (rows[0].status === 'returned') {
      await connection.rollback();
      return res.status(400).json({ message: 'This book has already been returned.' });
    }

    await connection.execute(
      "UPDATE transactions SET status = 'returned', return_date = CURRENT_TIMESTAMP WHERE id = ?",
      [req.params.id]
    );

    await connection.execute(
      'UPDATE books SET quantity = quantity + 1 WHERE id = ?',
      [rows[0].book_id]
    );

    await connection.commit();

    res.json({ message: 'Book returned successfully.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`Miss Jay Community Library API running at http://localhost:${PORT}`);
});