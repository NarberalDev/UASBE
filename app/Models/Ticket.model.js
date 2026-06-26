import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Ticket = sequelize.define(
  "Ticket",
  {
    idtickets: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jadwal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    seat: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    class: {
      type: DataTypes.STRING(20),
      defaultValue: "Economy",
    },
    passengers: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      defaultValue: "-",
    },
    name: {
      type: DataTypes.STRING(255),
      defaultValue: "-",
    },
    refund_status: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    refund_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refund_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "tickets",
    timestamps: false,
  },
);

export default Ticket;
