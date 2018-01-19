import { User, Message, Social } from "./connectors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import fs from "fs";

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
    },
    verifyNewUser(_, { username, code }, ctx) {
      return User.findOne({
        where: {
          username: username,
          verification_code: code
        }
      }).then(user => {
        if (!user) return Promise.reject("no user with that username and code");

        user.verified = true;
        user.save().then(() => user);
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
    },
    loginWithAuth(_, { id_token }, ctx) {
      /*
     * verify jwt token then 
     * if email in user table, then
     * if social sub found, then 
     * return user with token
     *
     * verify jwt token then
     * if email in user table, then
     * if not social sub found, then 
     * create social, return user with token
     *
     * verify jwt token then
     * if email not in user table, then
     * create user, create social, return user with token
     *
     * verify jwt token failed, reject
     */

      const jwtVerifyPromise = (id_token, signature) => {
        return new Promise((resolve, reject) => {
          return jwt.verify(id_token, signature, (err, dec) => {
            if (err) reject(err);
            else resolve(dec);
          });
        });
      };

      return jwtVerifyPromise(id_token, fs.readFileSync("./data/upslack.pem"))
        .then(decoded => {
          // check exp token
          if (new Date() > new Date(decoded.exp * 1000)) {
            return Promise.reject("your token expired, please login again");
          }

          // check issuer
          if (!/https:\/\/upslack.auth0.com\//.test(decoded.iss)) {
            return Promise.reject("issuer not dikenali");
          }

          return User.findOne({
            where: {
              email: decoded.email
            }
          }).then(user => {
            if (user) {
              // check social
              return user
                .getSocials({ where: { sub: decoded.sub } })
                .then(social => {
                  if (!social.length) {
                    //create social
                    return Social.create({ sub: decoded.sub }).then(created => {
                      user.addSocial(created);
                      const token = jwt.sign(
                        {
                          id: user.id,
                          username: user.username
                        },
                        process.env.JWT_SECRET
                      );

                      user.token = token;
                      ctx.user = Promise.resolve(user);
                      return user;
                    });
                  }
                  const token = jwt.sign(
                    {
                      id: user.id,
                      username: user.username
                    },
                    process.env.JWT_SECRET
                  );

                  user.token = token;
                  ctx.user = Promise.resolve(user);
                  return user;
                });
            }
            return User.create({
              username: decoded.nickname,
              email: decoded.email
            }).then(user => {
              return Social.create({ sub: decoded.sub }).then(created => {
                user.addSocial(created);
                const token = jwt.sign(
                  {
                    id: user.id,
                    username: user.username
                  },
                  process.env.JWT_SECRET
                );

                user.token = token;
                ctx.user = Promise.resolve(user);
                return user;
              });
            });
          });
        })
        .catch(error => Promise.reject(error));
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
