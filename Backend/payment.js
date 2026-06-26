const db = require("../config/db");

exports.payTicket = async (req, res) => {
  try {
    const { ticket_id, metode } = req.body;

    if (!ticket_id || !metode) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const [ticket] = await db.query(
      "SELECT * FROM tickets WHERE id=?",
      [ticket_id]
    );

    if (ticket.length === 0) {
      return res.status(404).json({ message: "Tiket tidak ditemukan" });
    }

    if (ticket[0].status === "paid") {
      return res.status(400).json({ message: "Tiket sudah dibayar" });
    }

    await db.query(
      "INSERT INTO payments (ticket_id, metode, status) VALUES (?, ?, ?)",
      [ticket_id, metode, "success"]
    );

    await db.query(
      "UPDATE tickets SET status='paid' WHERE id=?",
      [ticket_id]
    );

    res.json({ message: "Pembayaran berhasil" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};