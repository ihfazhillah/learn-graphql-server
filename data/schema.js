import { makeExecutableSchema } from "graphql-tools";
import resolvers from "./resolvers";

const typeDefs = `
type Query {
  hello : String
  allUsers: [User]
}

type Mutation {
  login(username: String!, password: String!): User
  register(username: String!, password: String!, email: String!): User
  verifyNewUser(username: String!, code: String!): User
  loginWithAuth(id_token: String!): User
}

type User {
  username: String
  password: String
  email: String
  id: ID
  token: String
  messages: [Message]
  social: [Social]
}

type Message {
  author: User
  text: String
  id: ID
}

type Social {
  user: User
  sub: String
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
