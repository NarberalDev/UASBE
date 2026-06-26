import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Jadwal = sequelize.define(
  "Jadwal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    destination: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    arrival_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    train_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "jadwal",
    timestamps: false,
  },
);

export default Jadwal;
