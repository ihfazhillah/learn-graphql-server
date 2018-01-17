import { makeExecutableSchema } from "graphql-tools";

const typeDefs = `
  type Query {
  hello : String
}`;

const resolvers = {
  Query: {
    hello(obj, args, context, info) {
      return "Hello world";
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
