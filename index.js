import express from 'express';
import bcrypt from "bcrypt";
import path from "path";
import cors from "cors";
import db from "./app/Config/db.js";
import { createTicket, updateStatus, getAllTickets, getTicketById } from "./Backend/tiket.js";

const app = express();
app.set('view engine', 'ejs');
app.set('views', './app/Views');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/style', express.static(path.join(process.cwd(), 'Public', 'Style')));

app.get('/dashboard', (req, res) => res.render('dashboard'));
app.get('/login', (req, res) => res.render('login'));
app.get('/lupa', (req, res) => res.render('lupa'));
app.get('/daftar', (req, res) => res.render('daftar'));
app.get('/routes', (req, res) => res.render('routes'));
app.get('/book', (req, res) => res.render('book'));
app.get('/tiket', (req, res) => res.render('ticket'));

app.post("/register", async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }
    const [existing] = await db.query(
      "SELECT idusers FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (nama, email, password) VALUES (?, ?, ?)",
      [nama, email, hashed]
    );
    res.json({ message: "Registrasi berhasil" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE LOGIN ENDPOINT - tambahkan notifikasi
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR nama = ? LIMIT 1",
      [email, email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // 🔔 BUAT NOTIFIKASI LOGIN
    await createNotification(
      user.idusers,
      'login',
      'Login Berhasil',
      `Anda berhasil login ke akun pada ${new Date().toLocaleString('id-ID')}`,
      'check',
      'green'
    );

    res.json({
      message: "Login berhasil",
      user_id: user.idusers,
      name: user.nama
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query("SELECT idusers FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password=? WHERE email=?",
      [hashed, email]
    );
    await createNotification(
      users[0].idusers,
      'reset_password',
      'Password Diubah',
      `Password akun Anda telah berhasil diubah pada ${new Date().toLocaleString('id-ID')}. Jika ini bukan Anda, segera hubungi customer service.`,
      'lock',
      'amber'
    );

    res.json({
      message: "Password berhasil diubah"
    });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/ticket/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        t.idtickets,
        t.user_id,
        t.jadwal_id,
        t.seat,
        t.status,
        t.class,
        t.passengers,
        t.payment_method,
        t.name,
        j.origin,
        j.destination,
        j.date,
        j.departure_time,
        j.arrival_time,
        j.price,
        j.train_name
      FROM tickets t
      LEFT JOIN jadwal j ON t.jadwal_id = j.id
      WHERE t.user_id = ?
      AND t.status IN ('paid','success','confirmed')
      ORDER BY t.idtickets DESC
    `, [user_id]);

    res.json(rows);

  } catch (err) {
    console.error("GET USER TICKET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/refund", async (req, res) => {
  try {
    const { ticket_id, user_id, reason } = req.body;

    if (!ticket_id || !user_id || !reason) {
      return res.status(400).json({
        message: "ticket_id, user_id, reason wajib diisi"
      });
    }

    const [rows] = await db.query(`
      SELECT t.*, j.price, j.date, j.departure_time
      FROM tickets t
      LEFT JOIN jadwal j ON t.jadwal_id = j.id
      WHERE t.idtickets = ? AND t.user_id = ?
      LIMIT 1
    `, [ticket_id, user_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Tiket tidak ditemukan"
      });
    }

    const ticket = rows[0];

    if (!['paid', 'success', 'confirmed'].includes(ticket.status)) {
      return res.status(400).json({
        message: "Tiket tidak bisa direfund"
      });
    }

    const refundAmount =
      Math.floor(ticket.price * ticket.passengers * 0.9);

    await db.query(`
      UPDATE tickets
      SET status = 'refunded'
      WHERE idtickets = ?
    `, [ticket_id]);

    res.json({
      message: "Refund berhasil",
      refund_amount: refundAmount
    });

  } catch (err) {
    console.error("REFUND ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

app.get("/ticket/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM tickets WHERE user_id = ?",
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil tiket user" });
  }
});

app.get("/jadwal", async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM jadwal");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query(
      "SELECT idusers, nama, email, phone FROM users WHERE idusers = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});


app.put("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { nama, email, phone } = req.body;

    await db.query(
      "UPDATE users SET nama=?, email=?, phone=? WHERE idusers=?",
      [nama, email, phone, id]
    );

    res.json({
      message: "Profile berhasil diperbarui"
    });

  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

app.post("/review", async (req, res) => {
  try {
    const { user_id, ticket_id, rating, review } = req.body;

    if (!user_id || !ticket_id || !rating) {
      return res.status(400).json({
        message: "user_id, ticket_id, rating wajib diisi"
      });
    }

    const [ticket] = await db.query(
      "SELECT idtickets FROM tickets WHERE idtickets = ?",
      [ticket_id]
    );

    if (ticket.length === 0) {
      return res.status(404).json({
        message: "Tiket tidak ditemukan"
      });
    }
    await db.query(
      `INSERT INTO reviews (user_id, ticket_id, rating, review)
       VALUES (?, ?, ?, ?)`,
      [user_id, ticket_id, rating, review]
    );

    res.json({
      message: "Review berhasil dikirim"
    });

  } catch (err) {
    console.error("REVIEW ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

app.post("/review", async (req, res) => {
  try {
    const { user_id, ticket_id, rating, review } = req.body;

    if (!user_id || !ticket_id || !rating) {
      return res.status(400).json({
        message: "Data tidak lengkap"
      });
    }

    await db.query(
      "INSERT INTO reviews (user_id, ticket_id, rating, review) VALUES (?, ?, ?, ?)",
      [user_id, ticket_id, rating, review]
    );

    res.json({ message: "Review berhasil disimpan" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email wajib diisi"
      });
    }

    const [rows] = await db.query(
      "SELECT idusers, email, nama FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Email tidak ditemukan"
      });
    }

    res.json({
      message: "Email ditemukan! Silakan masukkan password baru Anda.",
      email: rows[0].email
    });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});


app.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password=? WHERE email=?",
      [hashed, email]
    );

    res.json({
      message: "Password berhasil diubah"
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

async function createNotification(userId, type, title, message, icon = 'info', color = 'blue') {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, icon, color, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())`,
      [userId, type, title, message, icon, color]
    );
  } catch (err) {
    console.error("CREATE NOTIFICATION ERROR:", err);
  }
}

app.get("/notifications/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { filter = 'all' } = req.query;

    let query = `
      SELECT id, user_id, type, title, message, icon, color, is_read, 
             DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             UNIX_TIMESTAMP(created_at) * 1000 as timestamp
      FROM notifications 
      WHERE user_id = ?
    `;

    if (filter === 'unread') {
      query += ` AND is_read = FALSE`;
    } else if (filter !== 'all') {
      query += ` AND type = ?`;
      const [rows] = await db.query(query + ` ORDER BY created_at DESC`, [user_id, filter]);
      return res.json(rows);
    }

    const [rows] = await db.query(query + ` ORDER BY created_at DESC`, [user_id]);
    res.json(rows);

  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
      [id]
    );

    res.json({ message: "Notifikasi ditandai dibaca" });

  } catch (err) {
    console.error("MARK READ ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/notifications/user/:user_id/read-all", async (req, res) => {
  try {
    const { user_id } = req.params;

    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
      [user_id]
    );

    res.json({ message: "Semua notifikasi ditandai dibaca" });

  } catch (err) {
    console.error("MARK ALL READ ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM notifications WHERE id = ?`, [id]);

    res.json({ message: "Notifikasi dihapus" });

  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/ticket", createTicket);
app.put("/ticket/:id", updateStatus);
app.get("/ticket", getAllTickets);

app.get("/ticket/:id", getTicketById);





app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/dashboard');
});