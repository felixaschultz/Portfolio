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
import EasterEgg from "../components/Easter-Egg";
import Contact from "../components/Contact/Contact";
import SingleProject from "../components/Project/SingleProject";
import Three from "../Pages/Three";
import { Canvas } from '@react-three/fiber'
export const LocationContext = createContext(null);

export default function App() {
    const [location, setLocation] = useState("da");
    const [showPopup, setShowPopup] = useState({hideShow: false, item: null});

    const provided = useMemo(() => ({
        value: location,
        setLocation: (location) => setLocation(location)
    }, [location, setLocation]));

    return (
        <>
            <Router>
                <LocationContext.Provider value={ provided }>
                    <div className="pushDown">
                        <header className="main-header">
                            <section className="header-grid">
                                <Nav />
                            </section>
                        </header>
                        <div className="main-content">
                            <Switch>
                                <Route path="/" exact>
                                    <Home title="Felix A. | Portfolio" showPopup={showPopup} setShowPopup={setShowPopup} />
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
                                    <SingleProject title="Projects | Portfolio" />
                                </Route>
                                <Route path="/gallery/:handle" exact>
                                    <Gallery title="Gallery | Portfolio" />
                                </Route>
                                <Route path="/3d" exact>
                                    <Canvas>
                                        <ambientLight intensity={Math.PI / 2} />
                                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                                        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                                        <Three />
                                    </Canvas>
                                </Route>
                                <Redirect to="/" />
                            </Switch>
                        </div>
                        <Footer />
                    </div>
                    <canvas id="fireworksCanvas"></canvas>
                    <EasterEgg />
                    {(showPopup.hideShow && showPopup.item == "Contact") ? <Contact setShowPopup={setShowPopup} showPopup={showPopup.hideShow} /> : null}
                </LocationContext.Provider>
            </Router>
        </>
    )
}