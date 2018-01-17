import Sequelize from "sequelize";
import casual from "casual";
import _ from "lodash";

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

casual.seed(3);
sequelize.sync({ force: true }).then(() => {
  _.times(10, () => {
    return UserModel.create({
      username: casual.username,
      email: casual.email,
      password: casual.password
    }).then(user => {
      user.createMessage({
        text: casual.sentences(10) + "from " + user.username
      });
      user.createMessage({
        text: casual.sentences(10) + "from " + user.username
      });
    });
  });
});

const User = sequelize.models.user;
const Message = sequelize.models.message;

export { User, Message };
