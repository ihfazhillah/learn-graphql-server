import { makeExecutableSchema } from "graphql-tools";
import resolvers from "./resolvers";

const typeDefs = `
type Query {
  hello : String
  allUsers: [User]
}

type User {
  username: String
  password: String
  email: String
  id: ID
  messages: [Message]
}

type Message {
  author: User
  text: String
  id: ID
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
