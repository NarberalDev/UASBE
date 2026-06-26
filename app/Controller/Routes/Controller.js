import { Ticket, Jadwal } from "../../Models/index.js";

export const getUserTicketsForDashboard = async (req, res) => {
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

export const getAvailableJadwal = async (req, res) => {
  try {
    const jadwal = await Jadwal.findAll({ order: [["departure_time", "ASC"]] });
    res.json(jadwal);
  } catch (err) {
    console.error("GET AVAILABLE JADWAL ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
