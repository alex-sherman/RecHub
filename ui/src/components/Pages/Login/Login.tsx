import React from "react";
import { SignIn } from "./Views";
import "./Login.scss";
import { AppProps } from "index";
import { Redirect } from "react-router-dom";

class Login extends React.Component<AppProps> {
  onViewChangeHandler = (view: string) => {
    this.setState({ view });
  };

  render() {
    const {
      token,
      query: { redirect },
    } = this.props;
    if (token) return <Redirect to={redirect || "/"} />;
    return (
      <div id="login" className="flex grow center">
        <SignIn onViewChangeHandler={this.onViewChangeHandler} {...this.props} />
      </div>
    );
  }
}

export default Login;
