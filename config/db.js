import { Sequelize } from "sequelize";

const sequelize = new Sequelize("tiket_kereta", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default sequelize;
