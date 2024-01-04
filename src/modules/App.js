const { useState, useEffect, useRef, createContext, useMemo } = React;
import "./App.css";
const Router = window.ReactRouterDOM.BrowserRouter;
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
import Gallery from "../Pages/Gallery";
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
                        <section className="header-grid">
                            {/* <Link className="logo" to="/">FelixS.</Link> */}
                            <Nav />
                        </section>
                    </header>
                    <Switch>
                        <Route path="/" exact>
                            <Home title="Felix A. | Portfolio" />
                        </Route>
                        <Route path="/fotografi" exact>
                            <Photography title="Fotografi | Portfolio" />
                        </Route>
                        <Route path="/web" exact>
                            <Web title="Web | Portfolio" />
                        </Route>
                        <Route path="/projects" exact>
                            <ProjectsPage title="Projects | Portfolio" />
                        </Route>
                        <Route path="/projects/:handle" exact>
                            <ProjectsPage title="Projects | Portfolio" />
                        </Route>
                        <Route path="/gallery/:handle" exact>
                            <Gallery title="Gallery | Portfolio" />
                        </Route>
                        <Redirect to="/" />
                    </Switch>
                    <Footer />
                </LocationContext.Provider>
            </Router>
        </>
    )
}