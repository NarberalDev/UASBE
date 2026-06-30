import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User } from "../Models/index.js";
import { createNotification } from "./Notification.Controller.js";

export const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ nama, email, password: hashed });

    await createNotification(
      user.idusers,
      "register",
      "Registrasi Berhasil",
      `Selamat datang ${nama}, akun Anda berhasil dibuat.`,
      "check",
      "green"
    );

    res.json({ message: "Registrasi berhasil", user_id: user.idusers });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { nama: email }],
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    await createNotification(
      user.idusers,
      "login",
      "Login Berhasil",
      `Anda berhasil login ke akun pada ${new Date().toLocaleString("id-ID")}`,
      "check",
      "green"
    );

    res.json({
      message: "Login berhasil",
      user_id: user.idusers,
      name: user.nama,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ["idusers", "nama", "email", "phone"],
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(user);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, phone } = req.body;

    const [updated] = await User.update(
      { nama, email, phone },
      { where: { idusers: id } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "Profile berhasil diperbarui" });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.update({ password: hashed }, { where: { email } });

    await createNotification(
      user.idusers,
      "reset_password",
      "Password Diubah",
      `Password akun Anda telah berhasil diubah pada ${new Date().toLocaleString("id-ID")}. Jika ini bukan Anda, segera hubungi customer service.`,
      "lock",
      "amber"
    );

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    res.json({
      message: "Email ditemukan! Silakan masukkan password baru Anda.",
      email: user.email,
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
