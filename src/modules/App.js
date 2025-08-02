const { useState, useEffect, useRef, createContext, useMemo } = window.React;
import "./App.css";

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
const { BrowserRouter: Router, Routes, Route, Link, Navigate } = window.ReactRouterDOM;

export default function App() {
    const [location, setLocation] = useState("da");
    const [showPopup, setShowPopup] = useState({ hideShow: false, item: null });

    const provided = useMemo(() => ({
        value: location,
        setLocation: (location) => setLocation(location)
    }, [location, setLocation]));

    return (
        <>
            <Router>
                <LocationContext.Provider value={provided}>
                    <div className="pushDown">
                        <header className="main-header">
                            <section className="header-grid">
                                <Nav />
                            </section>
                        </header>
                        <div className="main-content">
                            <Routes>
                                <Route path="/" element={<Home title="Felix A. | Portfolio" showPopup={showPopup} setShowPopup={setShowPopup} />} />
                                <Route path="/fotografi" element={<Photography title="Fotografi | Portfolio" />} />
                                <Route path="/web" element={<Web title="Web | Portfolio" />} />
                                <Route path="/projects" element={<ProjectsPage title="Projects | Portfolio" />} />
                                <Route path="/project/:handle" element={<SingleProject title="Projects | Portfolio" />} />
                                <Route path="/gallery/:handle" element={<Gallery title="Gallery | Portfolio" />} />
                                <Route path="/gallery" element={<Gallery title="Gallery | Portfolio" />} />
                                <Route path="/3d" element={
                                    <Canvas>
                                        <ambientLight intensity={Math.PI / 2} />
                                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                                        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                                        <Three />
                                    </Canvas>
                                } />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
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