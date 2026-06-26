import db from "../Config/db.js";

export const createTicket = async (req, res) => {
  try {
    const {
      user_id,
      jadwal_id,
      seat,
      class: ticketClass,
      passengers,
      payment_method,
      name
    } = req.body;

    console.log("CREATE TICKET:", req.body);

    if (!user_id || !jadwal_id || !seat) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const [result] = await db.query(
      `INSERT INTO tickets (user_id, jadwal_id, seat, class, passengers, payment_method, status, name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        jadwal_id,
        seat,
        ticketClass || "Economy",
        passengers || 1,
        payment_method || "-",
        "success",
        name || "-"
      ]
    );

    res.json({ message: "Tiket berhasil dibuat", ticketId: result.insertId });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE tickets SET status = ? WHERE idtickets = ?",
      ["paid", id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket tidak ditemukan" });
    }
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "user_id wajib" });
    }
    const [data] = await db.query(`
      SELECT 
        t.idtickets,
        t.user_id,
        t.name,
        t.seat,
        t.class,
        t.passengers,
        t.payment_method,
        t.status,
        j.origin,
        j.destination,
        j.train_name,
        j.price,
        j.date,
        j.departure_time,
        j.arrival_time
      FROM tickets t
      LEFT JOIN jadwal j ON t.jadwal_id = j.id
      WHERE t.user_id = ?
      ORDER BY t.idtickets DESC
    `, [user_id]);
    res.json(data);
  } catch (err) {
    console.error("GET ALL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await db.query(`
      SELECT 
        t.idtickets,
        t.user_id,
        t.name,
        t.seat,
        t.class,
        t.passengers,
        t.payment_method,
        t.status,
        j.origin,
        j.destination,
        j.date,
        j.departure_time,
        j.arrival_time,
        j.price,
        j.train_name
      FROM tickets t
      LEFT JOIN jadwal j ON t.jadwal_id = j.id
      WHERE t.idtickets = ?
    `, [id]);
    if (data.length === 0) {
      return res.status(404).json({ message: "Ticket tidak ditemukan" });
    }
    res.json(data[0]);
  } catch (err) {
    console.error("GET BY ID ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};