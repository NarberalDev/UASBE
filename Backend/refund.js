const express = require("express");
app.get("/ticket/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await db.query(
      `SELECT t.*, j.origin, j.destination, j.date, j.departure_time, j.price, j.train_name
       FROM tickets t
       JOIN jadwal j ON t.jadwal_id = j.id
       WHERE t.user_id = ? AND t.status IN ('confirmed','paid','success')`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Endpoint POST /refund — ajukan refund
app.post("/refund", async (req, res) => {
  try {
    const { ticket_id, user_id, reason } = req.body;

    if (!ticket_id || !user_id || !reason) {
      return res.status(400).json({ message: "ticket_id, user_id, dan reason wajib diisi" });
    }

    // Pastikan tiket milik user ini dan statusnya bisa direfund
    const [rows] = await db.query(
      `SELECT t.*, j.date, j.departure_time, j.price
       FROM tickets t
       JOIN jadwal j ON t.jadwal_id = j.id
       WHERE t.idtickets = ? AND t.user_id = ?`,
      [ticket_id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tiket tidak ditemukan" });
    }

    const ticket = rows[0];

    if (ticket.refund_status === 'pending' || ticket.refund_status === 'approved') {
      return res.status(400).json({ message: "Refund sudah pernah diajukan untuk tiket ini" });
    }

    if (!['confirmed', 'paid', 'success'].includes(ticket.status)) {
      return res.status(400).json({
        message: "Tiket tidak memenuhi syarat refund"
      });
    }

    // Cek minimal 24 jam sebelum keberangkatan
    const departureDateTime = new Date(`${ticket.date}T${ticket.departure_time}`);
    const now = new Date();
    const diffHours = (departureDateTime - now) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return res.status(400).json({ message: "Refund hanya bisa diajukan minimal 24 jam sebelum keberangkatan" });
    }


    const refundAmount = Math.floor(ticket.price * ticket.passengers * 0.9);

    await db.query(
      `UPDATE tickets
       SET status = 'refund_pending', refund_status = 'pending', refund_reason = ?, refund_at = NOW()
       WHERE idtickets = ?`,
      [reason, ticket_id]
    );

    res.json({
      message: "Refund berhasil diajukan",
      ticket_id,
      refund_amount: refundAmount,
      note: "Dana akan dikembalikan dalam 3-5 hari kerja"
    });

  } catch (err) {
    console.error("REFUND ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.get("/ticket/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await db.query(`
      SELECT t.*, j.origin, j.destination, j.date, 
             j.departure_time, j.price, j.train_name
      FROM tickets t
      LEFT JOIN jadwal j ON t.jadwal_id = j.id
      WHERE t.user_id = ?
      AND t.status IN ('confirmed','paid','success')
    `, [user_id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});