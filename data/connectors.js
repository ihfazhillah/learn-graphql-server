import Sequelize from "sequelize";

require("dotenv").config();

const DATABASE_NAME = process.env.UPSLACK_DATABASE_NAME;
const DATABASE_USERNAME = process.env.UPSLACK_DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.UPSLACK_DATABASE_PASSWORD;

const sequelize = new Sequelize({
  dialect: "mysql",
  database: DATABASE_NAME,
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD
});

const UserModel = sequelize.define("user", {
  username: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING }
});

const MessageModel = sequelize.define("message", {
  text: { type: Sequelize.STRING }
});

MessageModel.belongsTo(UserModel);
UserModel.hasMany(MessageModel);

sequelize.sync({ force: true }).then(() => {
  return UserModel.create({
    username: "ihfazhillah",
    email: "mihfazhillah@gmail.com",
    password: "mysupersecret"
  }).then(user => {
    user.createMessage({
      text: "hello world"
    });
    user.createMessage({
      text: "message kedua"
    });
  });
});

const User = sequelize.models.user;
const Message = sequelize.models.message;

export { User, Message };
