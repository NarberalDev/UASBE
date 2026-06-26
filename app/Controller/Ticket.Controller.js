import { Op } from "sequelize";
import { Ticket } from "../Models/Ticket.model.js";

export const createTicket = async (req, res) => {
    try {
        const {
            user_id,
            jadwal_id,
            seat,
            class: kelas,
            passengers,
            payment_method,
            name,
        } = req.body;

        if (!user_id || !jadwal_id || !seat) {
      return res.status(400).json({
        success: false,
        message: "user_id, jadwal_id, dan seat wajib diisi.",
      });
    }

    const existingSeat = await Ticket.findOne({
      where: { jadwal_id, seat, status: { [Op.ne]: "cancelled" } },
    });
 
    if (existingSeat) {
      return res.status(409).json({
        success: false,
        message: `Kursi ${seat} sudah dipesan untuk jadwal ini.`,
      });
    }

    const newTicket = await Ticket.create({
      user_id,
      jadwal_id,
      seat,
      status: "success",
      class: kelas || "Economy",
      passengers: passengers || 1,
      payment_method: payment_method || "-",
      name: name || "-",
      status: "paid",
    });
    return res.status(201).json({
      success: true,
      message: "Tiket berhasil dibuat.",
      data: newTicket,
    });
  } catch (error) {
    console.error("ERROR createTicket:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat membuat tiket.",
      error: error.message,
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { status, class: kelas, jadwal_id, page = 1, limit = 10 } = req.query;
 
    const where = {};
    if (status) where.status = status;
    if (kelas) where.class = kelas;
    if (jadwal_id) where.jadwal_id = jadwal_id;
 
    const offset = (parseInt(page) - 1) * parseInt(limit);
 
    const result = await Ticket.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["idtickets", "DESC"]],
    });
 
    return res.status(200).json({
      success: true,
      total: result.count,
      page: parseInt(page),
      totalPages: Math.ceil(result.count / parseInt(limit)),
      data: result.rows,
    });
  } catch (error) {
    console.error("ERROR getAllTickets:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data tiket.",
      error: error.message,
    });
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

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("ERROR getTicketById:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil tiket.",
      error: error.message,
    });
  }
};

export const getTicketsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const tickets = await Ticket.findAll({
      where: { user_id },
      order: [["idtickets", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      total: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("ERROR getTicketsByUser:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil tiket user.",
      error: error.message,
    });
  }
};

export const getTicketsByJadwal = async (req, res) => {
  try {
    const { jadwal_id } = req.params;

    const tickets = await Ticket.findAll({
      where: { jadwal_id, status: { [Op.ne]: "cancelled" } },
      attributes: ["idtickets", "seat", "class", "status", "name"],
    });

    return res.status(200).json({
      success: true,
      total: tickets.length,
      occupiedSeats: tickets.map((t) => t.seat),
      data: tickets,
    });
  } catch (error) {
    console.error("ERROR getTicketsByJadwal:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil tiket jadwal.",
      error: error.message,
    });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan.",
      });
    }

    const {
      seat,
      class: kelas,
      passengers,
      payment_method,
      name,
      status,
    } = req.body;

    await ticket.update({
      seat: seat ?? ticket.seat,
      class: kelas ?? ticket.class,
      passengers: passengers ?? ticket.passengers,
      payment_method: payment_method ?? ticket.payment_method,
      name: name ?? ticket.name,
      status: status ?? ticket.status,
    });

    return res.status(200).json({
      success: true,
      message: "Tiket berhasil diperbarui.",
      data: ticket,
    });
  } catch (error) {
    console.error("ERROR updateTicket:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat memperbarui tiket.",
      error: error.message,
    });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["pending", "paid", "cancelled"];
    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan salah satu: ${allowedStatus.join(", ")}`,
      });
    }

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan.",
      });
    }

    ticket.status = status;
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: `Status tiket berhasil diubah menjadi '${status}'.`,
      data: ticket,
    });
  } catch (error) {
    console.error("ERROR updateTicketStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengubah status tiket.",
      error: error.message,
    });
  }
};

export const requestRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refund_reason } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan.",
      });
    }

    await ticket.update({
      refund_status: "pending",
      refund_reason: refund_reason || null,
      refund_at: new Date(),
      status: "cancelled",
    });

    return res.status(200).json({
      success: true,
      message: "Pengajuan refund berhasil dibuat.",
      data: ticket,
    });
  } catch (error) {
    console.error("ERROR requestRefund:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengajukan refund.",
      error: error.message,
    });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan.",
      });
    }

    await ticket.destroy();

    return res.status(200).json({
      success: true,
      message: "Tiket berhasil dihapus.",
    });
  } catch (error) {
    console.error("ERROR deleteTicket:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat menghapus tiket.",
      error: error.message,
    });
  }
};