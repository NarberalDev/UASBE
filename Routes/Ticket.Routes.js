import express from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketsByUser,
  getTicketsByJadwal,
  updateTicket,
  updateTicketStatus,
  requestRefund,
  deleteTicket,
} from "../app/Controller/Ticket.Controller.js";

const router = express.Router();

router.post("/tickets", createTicket);

router.get("/tickets", getAllTickets);
router.get("/tickets/:id", getTicketById);
router.get("/tickets/user/:user_id", getTicketsByUser);
router.get("/tickets/jadwal/:jadwal_id", getTicketsByJadwal);

router.put("/tickets/:id", updateTicket);
router.patch("/tickets/:id/status", updateTicketStatus);
router.patch("/tickets/:id/refund", requestRefund);

router.delete("/tickets/:id", deleteTicket);

export default router;