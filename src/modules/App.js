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

    let word = "";

    window.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
            // Handle backspace separately
            word = word.substring(0, word.length - 1);
        } else if (e.key === "Shift") {
            // Remove the entire "Shift" word and append uppercase letter
            word += e.key.replace(/Shift/g, "").toUpperCase();
        } else if (e.key.length === 1) {
            // Handle regular alphanumeric keys
            word += e.key;
        }

        if (word === "dark") {
            document.body.style.backgroundColor = "black";
            word = "";
        }

        if (word === "light") {
            document.body.style.backgroundColor = "";
            word = "";
        }
    });



    return (
        <>
            <Router>
                <LocationContext.Provider value={ provided }>
                    <header className="main-header">
                        <section className="header-grid">
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
                        <Route path="/project/:handle" exact>
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