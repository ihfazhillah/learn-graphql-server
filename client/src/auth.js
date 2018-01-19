import auth0 from "auth0-js";
import gql from "graphql-tag";
import client from "./apollo";

require("dotenv").config();

const loginWithAuth = gql`
  mutation LoginWithAuth($idToken: String!) {
    loginWithAuth(id_token: $idToken) {
      token
    }
  }
`;

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientID: process.env.REACT_APP_AUTH0_CLIENTID,
    redirectURL: "http://localhost:3000/",
    audience: "https://upslack.auth0.com/userinfo",
    responseType: "token id_token",
    scope: "openid profile email"
  });

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, result) => {
      if (result) {
        client
          .mutate({
            mutation: loginWithAuth,
            variables: {
              idToken: result.idToken
            }
          })
          .then(({ data: { loginWithAuth: { token } } }) => {
            localStorage.setItem("upslackToken", token);
          });
      } else {
        debugger;
      }
    });
  }
}
