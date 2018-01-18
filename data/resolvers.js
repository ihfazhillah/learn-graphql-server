import { User, Message } from "./connectors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

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
        if (!user.verified) return Promise.reject("unauthorized");
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
    },
    register(_, { username, password, email }, ctx) {
      return User.findOne({
        where: { $or: [{ username: username }, { email: email }] }
      }).then(user => {
        if (user) {
          return Promise.reject("username or email has found found");
        }

        /**
         * create password
         * create verification code, flag not verified
         * send verification code through email
         * return user
         */

        return bcrypt.hash(password, 10).then(hash => {
          const verification_code = (Math.random() * 1e32).toString(36);
          const transporter = nodemailer.createTransport(
            smtpTransport({
              service: "gmail",
              host: "smtp.gmail.com",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
              }
            })
          );

          const mailOptions = {
            from: "mihfazhillah@gmail.com",
            to: email,
            subject: "new account, verify",
            text: `code : ${verification_code}, username: ${username}`
          };

          const sendMail = mailOptions => {
            return new Promise((resolve, reject) => {
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) return reject(error);
                return resolve(info);
              });
            });
          };

          return sendMail(mailOptions)
            .then(info => {
              return User.create({
                username: username,
                password: hash,
                email: email,
                verification_code: verification_code
              }).then(user => {
                const token = jwt.sign(
                  {
                    id: user.id,
                    username: username
                  },
                  process.env.JWT_SECRET
                );

                user.token = token;
                ctx.user = Promise.resolve(user);
                return user;
              });
            })
            .catch(error => Promise.reject(error));
        });
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
