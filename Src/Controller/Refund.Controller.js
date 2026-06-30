import { Ticket, Jadwal } from "../Models/index.js";

export const requestRefund = async (req, res) => {
  try {
    const { ticket_id, user_id, reason } = req.body;
    if (!ticket_id || !user_id || !reason) {
      return res.status(400).json({ message: "ticket_id, user_id, and reason wajib diisi" });
    }

    const ticket = await Ticket.findOne({
      where: { idtickets: ticket_id, user_id },
      include: [{ model: Jadwal }],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Tiket tidak ditemukan" });
    }

    if (ticket.refund_status === "pending" || ticket.refund_status === "approved") {
      return res.status(400).json({ message: "Refund sudah pernah diajukan untuk tiket ini" });
    }

    if (!["confirmed", "paid", "success"].includes(ticket.status)) {
      return res.status(400).json({ message: "Tiket tidak memenuhi syarat refund" });
    }

    const departureDateTime = new Date(`${ticket.Jadwal.date}T${ticket.Jadwal.departure_time}`);
    const now = new Date();
    const diffHours = (departureDateTime - now) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return res.status(400).json({ message: "Refund hanya bisa diajukan minimal 24 jam sebelum keberangkatan" });
    }

    const refundAmount = Math.floor(ticket.Jadwal.price * ticket.passengers * 0.9);

    await Ticket.update(
      { status: "refund_pending", refund_status: "pending", refund_reason: reason, refund_at: new Date() },
      { where: { idtickets: ticket_id } }
    );

    res.json({
      message: "Refund berhasil diajukan",
      ticket_id,
      refund_amount: refundAmount,
      note: "Dana akan dikembalikan dalam 3-5 hari kerja",
    });
  } catch (err) {
    console.error("REQUEST REFUND ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
