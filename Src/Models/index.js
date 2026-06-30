import User from "./User.model.js";
import Ticket from "./Ticket.model.js";
import Jadwal from "./Jadwal.model.js";
import Review from "./Review.model.js";
import Payment from "./Payment.model.js";
import Notification from "./Notification.model.js";

Ticket.belongsTo(User, { foreignKey: "user_id" });
Ticket.belongsTo(Jadwal, { foreignKey: "jadwal_id" });
Review.belongsTo(User, { foreignKey: "user_id" });
Review.belongsTo(Ticket, { foreignKey: "ticket_id" });
Payment.belongsTo(Ticket, { foreignKey: "ticket_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

export { User, Ticket, Jadwal, Review, Payment, Notification };
