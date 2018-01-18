import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";

const client = new ApolloClient({
  link: new HttpLink({ uri: "/graphql" }),
  cache: new InMemoryCache()
});

client
  .query({
    query: gql`
      {
        allUsers {
          id
        }
      }
    `
  })
  .then(res => console.log(res))
  .catch(error => console.log(error));

export default client;
