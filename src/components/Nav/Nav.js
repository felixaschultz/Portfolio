const Link = window.ReactRouterDOM.Link;
const { useState, useEffect, useRef, useContext } = React;
import "./Style/Nav.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";

export default function Nav() {
    const [location, setLocation] = useContext(LocationContext);
    return (
        <>
            <nav className="navigation">
                <Link className="navigation__link" to="/projects">Projekter</Link>
                {
                    local[location].navigation.langSelector.map((choosedLang, key) => {
                        return <>
                            <button key={choosedLang} className="locationPicker" onClick={(e) => {setLocation(choosedLang.short)}}>
                                {choosedLang.long}
                            </button>
                        </>
                    })
                }
                <a className="navigation__link" href="https://github.com/felixaschultz" target="_blank"><img className="github--icon" src="https://www.intastellarsolutions.com/assets/icons/GitHub-Mark/PNG/GitHub-Mark-64px.png" /> Github</a>
            </nav>
        </>
    )
}