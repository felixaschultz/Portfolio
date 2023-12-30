const Link = window.ReactRouterDOM.Link;
const useLocation = window.ReactRouterDOM.useLocation;
const { useState, useEffect, useRef, useContext } = React;
import "./Style/Nav.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";
import logo from "../../statics/assets/felix-schultz-logo.svg";

export default function Nav() {
    const [location, setLocation] = useContext(LocationContext);
    const locationPath = useLocation()
    return (
        <>
            {
                (locationPath.pathname != "/") ? <Link className="logo" to="/"><img src={logo} /></Link> : null
            }
            <nav className="navigation">
                {
                    local[location].navigation.links.map((link, key) => {
                        return (
                            <Link className="navigation__link" to={link.path}>{link.name}</Link>
                        )
                    })
                }
                {
                    local[location].navigation.langSelector.map((choosedLang, key) => {
                        return <>
                            <button key={choosedLang} className="locationPicker" onClick={(e) => {setLocation(choosedLang.short)}}>
                                {choosedLang.long}
                            </button>
                        </>
                    })
                }
                <a className="navigation__link" href="https://github.com/felixaschultz" target="_blank" role="button"><img className="github--icon" src="https://www.intastellarsolutions.com/assets/icons/GitHub-Mark/PNG/GitHub-Mark-64px.png" alt="Github" /></a>
                <a className="navigation__link" href="https://www.linkedin.com/in/felixaschultz" target="_blank" role="button"> LinkedIn</a>
                <iframe src="https://github.com/sponsors/felixaschultz/button" title="Sponsor felixaschultz" height="32" width="114" style={{border: 0, borderRadius: "6px"}}></iframe>
            </nav>
        </>
    )
}