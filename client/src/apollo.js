import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

const token = localStorage.getItem("upslackToken");

const client = new ApolloClient({
  link: new HttpLink({
    uri: "/graphql",
    headers: token
      ? { Authorization: `Bearer ${localStorage.getItem("upslackToken")}` }
      : {}
  }),
  cache: new InMemoryCache()
});

export default client;
