import { Review, Ticket } from "../Models/index.js";

export const createReview = async (req, res) => {
  try {
    const { user_id, ticket_id, rating, review } = req.body;

    if (!user_id || !ticket_id || !rating) {
      return res.status(400).json({ message: "user_id, ticket_id, rating wajib diisi" });
    }

    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({ message: "Tiket tidak ditemukan" });
    }

    await Review.create({ user_id, ticket_id, rating, review });
    res.json({ message: "Review berhasil dikirim" });
  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getReviewsByTicketId = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const reviews = await Review.findAll({
      where: { ticket_id },
      order: [["created_at", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getReviewsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const reviews = await Review.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    console.error("GET USER REVIEWS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
