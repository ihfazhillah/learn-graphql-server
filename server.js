import express from "express";
import dotenv from "dotenv";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import jwt from "express-jwt";
import bodyParser from "body-parser";
import { User } from "./data/connectors";

import schema from "./data/schema";

const GRAPHQL_PORT = 3000;

const server = express();

server.use(
  "/graphql",
  bodyParser.json(),
  jwt({ secret: process.env.JWT_SECRET, credentialsRequired: false }),
  graphqlExpress(req => ({
    schema,
    context: {
      user: req.user
        ? User.findOne({ where: { id: req.user.id } })
        : Promise.resolve(null)
    }
  }))
);
server.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

server.listen(GRAPHQL_PORT, () => {
  console.log(" ##### RUNNING SERVER ###### ");
  console.log(
    `GrapiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
  );
});
