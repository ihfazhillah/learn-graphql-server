import Sequelize from "sequelize";
import casual from "casual";
import bcrypt from "bcrypt";
import _ from "lodash";

require("dotenv").config();

const DATABASE_NAME = process.env.UPSLACK_DATABASE_NAME;
const DATABASE_USERNAME = process.env.UPSLACK_DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.UPSLACK_DATABASE_PASSWORD;

const sequelize = new Sequelize({
  dialect: "mysql",
  database: DATABASE_NAME,
  username: DATABASE_USERNAME,
  logging: false,
  password: DATABASE_PASSWORD
});

const UserModel = sequelize.define("user", {
  username: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  verification_code: { type: Sequelize.STRING },
  verified: { type: Sequelize.BOOLEAN, defaultValue: false }
});

const MessageModel = sequelize.define("message", {
  text: { type: Sequelize.STRING }
});

const SocialModel = sequelize.define("social", {
  sub: { type: Sequelize.STRING }
});

MessageModel.belongsTo(UserModel);
SocialModel.belongsTo(UserModel);
UserModel.hasMany(MessageModel);
UserModel.hasMany(SocialModel);

/** comment it so when script restart, not create a new one
casual.seed(3);
sequelize.sync({ force: true }).then(() => {
  bcrypt
    .hash("hello", 10)
    .then(hash =>
      UserModel.create({ username: "ihfazhillah", password: hash })
    );
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
*/
const User = sequelize.models.user;
const Message = sequelize.models.message;
const Social = sequelize.models.social;

export { User, Message, Social };
