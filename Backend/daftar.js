import bcrypt from "bcrypt";
import db from "../Config/db.js";

export const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?", [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (nama, email, password) VALUES (?, ?, ?)",
      [nama, email, hashed]
    );
    res.json({ message: "Registrasi berhasil" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR nama = ? LIMIT 1",
      [email, email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Email atau password salah" });
    }
    res.json({
      message: "Login berhasil",
      user_id: user.id,
      name: user.nama
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};