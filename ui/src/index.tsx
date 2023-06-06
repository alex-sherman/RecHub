import React from "react";
import ReactDOM from "react-dom";
import Cookies from "js-cookie";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  RouteComponentProps,
} from "react-router-dom";
import "./fontawesome";
import { User, Login } from "./components/Pages";
import {
  applyTheme,
  camelCase,
  fetching,
  middleWare,
  notifyToast,
  parseQuery,
  parseToken,
} from "./utils";
import "./index.scss";
import { Navbar } from "components/UI/NavBar";
import { Events } from "components/Pages/Events/Events";

interface Props {
  match?: {
    url?: string;
    params?: {};
  };
}

interface State {
  token: string;
  parsed: string;
}

export interface AppProps extends RouteComponentProps {
  onLoginHandler(token: string): void;
  onLogoutHandler(): void;
  urlFetch(url: string, queryParams?: any, errorHandler?: any): any;
  token: string;
  query: { [key: string]: string };
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let token = Cookies.get("token");
    let parsed = parseToken(token);
    if (!token || !parsed) {
      Cookies.remove("token");
      token = "";
    }
    this.state = { token, parsed };
  }

  onLoginHandler = (token: string) => {
    if (token && parseToken(token)) {
      Cookies.set("token", token);
      this.setState({ token });
    }
  };

  onLogoutHandler = () => {
    Cookies.remove("token");
    this.setState({ token: "", parsed: "" });
  };

  getChildProps = (props: RouteComponentProps) => {
    let handleError = (e) => {
      if (e.status === 401) {
        this.onLogoutHandler();
        props.history.replace("/login");
      }
      notifyToast("error", e.message);
    };

    let urlFetch = async (url: string, queryParams: any, errorHandler?: any) => {
      let handle = (error) => {
        let handle = middleWare(error, handleError);
        if (errorHandler) handle = middleWare(error, errorHandler, handle);
        handle();
      };
      return await fetching(url, queryParams, this.state.token)
        .then(async (res) => {
          let result: any = null;
          try {
            result = camelCase(await res.json());
          } catch (err) {
            result = { message: (err as { message: string }).message };
          }
          if (res.status === 200) return result;
          else {
            const error = { url, status: res.status, ...result };
            handle(error);
          }
        })
        .catch((e) => handle({ url, message: e.message }));
    };

    return {
      query: parseQuery(props.location.search) as { [key: string]: string },
      handleError,
      urlFetch,
      token: this.state.token,
      onLoginHandler: this.onLoginHandler,
      onLogoutHandler: this.onLogoutHandler,
      ...props,
    };
  };

  componentDidMount() {
    applyTheme();
  }

  render() {
    const { token = "" } = this.state;

    const RedirectLogin = (props: Props) => {
      let { match = {} } = props;
      let { url = "" } = match;
      return <Redirect to={`/login${match ? `?redirect=${encodeURI(url)}` : ""}`} />;
    };

    const HomePage = (props) => {
      return (
        <>
          <Navbar {...props} />
          <div className="grow">
            <h1 className="center">Home page!</h1>
          </div>
        </>
      );
    };

    const UserPage = (props) => {
      return (
        <>
          <Navbar {...props} />
          <User {...props} />
        </>
      );
    };

    const MaybeRedirect = (Component) => (props: RouteComponentProps) =>
      token || true /* TODO DETECT */ ? <Component {...this.getChildProps(props)} /> : <RedirectLogin {...props} />;

    return (
      <div id="app-container" className="flex col">
        <Router>
          <Switch>
            <Route path="/" exact render={MaybeRedirect(HomePage)} />
            <Route path="/user" exact render={MaybeRedirect(UserPage)} />
            <Route path="/login" render={(props) => <Login {...this.getChildProps(props)} />} />
            <Route path="/events" render={MaybeRedirect(Events)} />
          </Switch>
        </Router>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
