import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

class LoginForm extends Component {
  render() {
    return (
      <div>
        <form>
          <input type="text" id="username" />
          <input type="password" id="password" />
          <input type="submit" value="login" />
        </form>
        <button id="social">Social Login</button>
      </div>
    );
  }
}

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
      authenticated: true
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
          <LoginForm />
        )}
        <OpenData />
        <CloseData />
      </div>
    );
  }
}

export default App;
