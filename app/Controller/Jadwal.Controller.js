import { Jadwal } from "../Models/index.js";

export const getAllJadwal = async (req, res) => {
  try {
    const jadwal = await Jadwal.findAll({ order: [["departure_time", "ASC"]] });
    res.json(jadwal);
  } catch (err) {
    console.error("GET JADWAL ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getJadwalById = async (req, res) => {
  try {
    const { id } = req.params;
    const jadwal = await Jadwal.findByPk(id);
    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }
    res.json(jadwal);
  } catch (err) {
    console.error("GET JADWAL BY ID ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const searchJadwal = async (req, res) => {
  try {
    const { origin, destination, date } = req.query;
    const conditions = {};

    if (origin) conditions.origin = origin;
    if (destination) conditions.destination = destination;
    if (date) conditions.date = date;

    const jadwal = await Jadwal.findAll({
      where: conditions,
      order: [["departure_time", "ASC"]],
    });

    res.json(jadwal);
  } catch (err) {
    console.error("SEARCH JADWAL ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
