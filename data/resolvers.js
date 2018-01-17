import { User, Message } from "./connectors";

const resolvers = {
  Query: {
    hello() {
      return "hello world!";
    },
    allUsers() {
      return User.findAll();
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
