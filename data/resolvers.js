import { User, Message } from "./connectors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const resolvers = {
  Query: {
    hello() {
      return "hello world!";
    },
    allUsers(obj, args, ctx) {
      if (!ctx.user) {
        return Promise.reject("unauthorized");
      }

      return ctx.user.then(user => {
        if (!user) return Promise.reject("unauthorized");
        return User.findAll();
      });
    }
  },

  Mutation: {
    login(_, { username, password }, ctx) {
      return User.findOne({
        where: { username: username }
      }).then(user => {
        if (user) {
          return bcrypt.compare(password, user.password).then(res => {
            if (res) {
              const token = jwt.sign(
                {
                  username: user.username,
                  id: user.id
                },
                process.env.JWT_SECRET
              );

              user.token = token;
              ctx.user = Promise.resolve(user);
              return user;
            }

            return Promise.reject("Password did not match");
          });
        } else {
          return Promise.reject("User not found");
        }
      });
    }
  },

  User: {
    messages(user) {
      return user.getMessages();
    }
  },

  Message: {
    author(message) {
      return message.getUser();
    }
  }
};

export default resolvers;
