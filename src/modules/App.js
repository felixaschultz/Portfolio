import "./App.css";
const Router = window.ReactRouterDOM.BrowserRouter;
const Route =  window.ReactRouterDOM.Route;
const Link =  window.ReactRouterDOM.Link;
const Prompt =  window.ReactRouterDOM.Prompt;
const Switch = window.ReactRouterDOM.Switch;
const Redirect = window.ReactRouterDOM.Redirect;

import Home from "../Pages/Home/Home";
import Web from "../Pages/Web/Web";
import Photography from "../Pages/Photography/Photography";
import Nav from "../components/Nav/Nav";
import Projects from "../Pages/Projects/Projects";

export default function App() {

    return (
        <>
            <Router>
                <header className="main-header">
                    <section className="grid">
                        <Link className="logo" to="/">FelixS.</Link>
                        <Nav />
                    </section>
                </header>
                <Switch>
                    <Route path="/" exact>
                        <Home title="Felix A. | Portfolio" />
                    </Route>
                    <Route path="/fotografi">
                        <Photography title="Fotografi | Portfolio" />
                    </Route>
                    <Route path="/web">
                        <Web title="Web | Portfolio" />
                    </Route>
                    <Route path="/projects">
                        <Projects title="Projects | Portfolio" />
                    </Route>
                </Switch>
            </Router>
        </>
    )
}