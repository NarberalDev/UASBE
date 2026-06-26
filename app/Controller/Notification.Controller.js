import { Notification } from "../Models/index.js";

export const createNotification = async (
  user_id,
  type,
  title,
  message,
  icon = "info",
  color = "blue"
) => {
  try {
    await Notification.create({
      user_id,
      type,
      title,
      message,
      icon,
      color,
      is_read: false,
      created_at: new Date(),
    });
  } catch (err) {
    console.error("CREATE NOTIFICATION ERROR:", err);
  }
};

export const getNotificationsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { filter = "all" } = req.query;

    const where = { user_id };
    if (filter === "unread") {
      where.is_read = false;
    } else if (filter !== "all") {
      where.type = filter;
    }

    const notifications = await Notification.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    res.json(notifications);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Notification.update(
      { is_read: true },
      { where: { id } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    }

    res.json({ message: "Notifikasi ditandai dibaca" });
  } catch (err) {
    console.error("MARK NOTIF READ ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const { user_id } = req.params;
    await Notification.update({ is_read: true }, { where: { user_id } });
    res.json({ message: "Semua notifikasi ditandai dibaca" });
  } catch (err) {
    console.error("MARK ALL NOTIF READ ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    }
    res.json({ message: "Notifikasi dihapus" });
  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
