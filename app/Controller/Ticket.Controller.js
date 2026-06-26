import { Ticket, Jadwal } from "../Models/index.js";

export const createTicket = async (req, res) => {
  try {
    const {
      user_id,
      jadwal_id,
      seat,
      class: ticketClass,
      passengers,
      payment_method,
      name,
    } = req.body;

    if (!user_id || !jadwal_id || !seat) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const ticket = await Ticket.create({
      user_id,
      jadwal_id,
      seat,
      status: "success",
      class: ticketClass || "Economy",
      passengers: passengers || 1,
      payment_method: payment_method || "-",
      name: name || "-",
    });

    res.json({ message: "Tiket berhasil dibuat", ticketId: ticket.idtickets });
  } catch (err) {
    console.error("CREATE TICKET ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status || "paid";

    const [updated] = await Ticket.update(
      { status: newStatus },
      { where: { idtickets: id } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: "Ticket tidak ditemukan" });
    }

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "user_id wajib" });
    }

    const tickets = await Ticket.findAll({
      where: { user_id },
      include: [{ model: Jadwal }],
      order: [["idtickets", "DESC"]],
    });

    res.json(tickets);
  } catch (err) {
    console.error("GET ALL TICKETS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getTicketsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const tickets = await Ticket.findAll({
      where: { user_id },
      include: [{ model: Jadwal }],
      order: [["idtickets", "DESC"]],
    });
    res.json(tickets);
  } catch (err) {
    console.error("GET USER TICKETS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, { include: [{ model: Jadwal }] });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket tidak ditemukan" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("GET TICKET BY ID ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
