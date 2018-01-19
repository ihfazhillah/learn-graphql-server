import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import Auth from "./auth";

const auth = new Auth();

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    this.props
      .login({
        variables: {
          username: this.state.username,
          password: this.state.password
        }
      })
      .then(({ data: { login: { token } } }) => {
        localStorage.setItem("upslackToken", token);
        this.props.isAuthenticated();
      })
      .catch(error => {
        debugger;
      });
  }

  onUsernameChange(e) {
    this.setState({ username: e.currentTarget.value });
  }

  onPasswordChange(e) {
    this.setState({ password: e.currentTarget.value });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <input type="text" id="username" onChange={this.onUsernameChange} />
          <input
            type="password"
            id="password"
            onChange={this.onPasswordChange}
          />
          <input type="submit" value="login" />
        </form>
        <button onClick={() => auth.login()} id="social">
          Social Login
        </button>
      </div>
    );
  }
}

const loginMutation = gql`
  mutation LoginMtn($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

const LoginFormWithMutation = graphql(loginMutation, { name: "login" })(
  LoginForm
);

class DataFromGql extends Component {
  render() {
    return (
      <div style={{ margin: 20 }}>
        <div className="App-title">{this.props.title}</div>
        <pre style={{ textAlign: "initial", width: "80%", margin: "0 auto" }}>
          {this.props.content}
        </pre>
      </div>
    );
  }
}

const OpenData = graphql(
  gql`
    {
      hello
    }
  `,
  {
    props: ({ data }) => {
      data.content = JSON.stringify(data, null, 4);
      data.title = "open data";
      return data;
    }
  }
)(DataFromGql);

const CloseData = graphql(
  gql`
    {
      allUsers {
        id
        username
      }
    }
  `,
  {
    props: ({ data }) => {
      data.content = JSON.stringify(data, null, 4);
      data.title = "login required";
      return data;
    }
  }
)(DataFromGql);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: localStorage.getItem("upslackToken")
    };

    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.logout = this.logout.bind(this);
  }

  isAuthenticated() {
    const token = localStorage.getItem("upslackToken");

    if (token) {
      this.setState({ authenticated: true });
      return true;
    }
    this.setState({ authenticated: false });
    return false;
  }

  logout() {
    localStorage.removeItem("upslackToken");
    this.isAuthenticated();
  }

  componentWillMount() {
    if (/access_token|id_token|expires_in/.test(window.location.href)) {
      auth.handleAuthentication();
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {this.state.authenticated ? (
          <button onClick={this.logout}>logout</button>
        ) : (
          <LoginFormWithMutation isAuthenticated={this.isAuthenticated} />
        )}
        <OpenData />
        <CloseData />
      </div>
    );
  }
}

export default App;
