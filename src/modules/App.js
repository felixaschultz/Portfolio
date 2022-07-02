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
import { useTitle, TitleProvider } from "../TitleContext";

export default function App() {
    const { title } = useTitle();

    return (
        <>
            <TitleProvider>
                <Router>
                    <header className="main-header">
                        <Link className="logo" to="/">FelixS.</Link>
                        <Nav />
                    </header>
                    <Switch>
                        <Route path="/" exact title="home">
                            <Home />
                        </Route>
                        <Route path="/fotografi">
                            <Photography />
                        </Route>
                        <Route path="/web">
                            <Web />
                        </Route>
                        <Route path="/projects">
                            <Projects />
                        </Route>
                        <Redirect to="/" />
                    </Switch>
                </Router>
            </TitleProvider>
        </>
    )
}