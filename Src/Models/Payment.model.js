import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Payment = sequelize.define(
  "Payment",
  {
    idpayments: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: false,
  },
);

export default Payment;
