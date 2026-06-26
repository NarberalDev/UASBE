import { Payment, Ticket } from "../Models/index.js";

export const payTicket = async (req, res) => {
  try {
    const { ticket_id, metode } = req.body;
    if (!ticket_id || !metode) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({ message: "Tiket tidak ditemukan" });
    }
    if (ticket.status === "paid") {
      return res.status(400).json({ message: "Tiket sudah dibayar" });
    }

    await Payment.create({
      ticket_id,
      metode,
      status: "success",
    });
    await Ticket.update({ status: "paid" }, { where: { idtickets: ticket_id } });

    res.json({ message: "Pembayaran berhasil" });
  } catch (err) {
    console.error("PAY TICKET ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
