const { useState, useEffect, useRef, createContext, useMemo } = React;
import "./App.css";
const Router = window.ReactRouterDOM.HashRouter;
const Route =  window.ReactRouterDOM.Route;
const Link =  window.ReactRouterDOM.Link;
const Prompt =  window.ReactRouterDOM.Prompt;
const Switch = window.ReactRouterDOM.Switch;
const Redirect = window.ReactRouterDOM.Redirect;

import Home from "../Pages/Home/Home";
import Web from "../Pages/Web/Web";
import Footer from "../components/Footer/Footer";
import Photography from "../Pages/Photography/Photography";
import Nav from "../components/Nav/Nav";
import ProjectsPage from "../Pages/Projects/Projects";
export const LocationContext = createContext(null);

export default function App() {
    const [location, setLocation] = useState("da");

    const provided = useMemo(() => ({
        value: location,
        setLocation: (location) => setLocation(location)
    }, [location, setLocation]));
    return (
        <>
            <Router>
                <LocationContext.Provider value={ provided }>
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
                            <ProjectsPage title="Projects | Portfolio" />
                        </Route>
                        <Redirect to="/" />
                    </Switch>
                    <Footer />
                </LocationContext.Provider>
            </Router>
        </>
    )
}