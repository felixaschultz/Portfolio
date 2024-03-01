const Link = window.ReactRouterDOM.Link;
const useLocation = window.ReactRouterDOM.useLocation;
const { useState, useEffect, useRef, useContext } = React;
import "./Style/Nav.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";
import logo from "../../statics/assets/felix-schultz-logo-icon.svg";
import { GitHub, LinkedIn } from "../Icons";

export default function Nav() {
    const [location, setLocation] = useContext(LocationContext);
    const locationPath = useLocation();
    const [showLanguage, setShowLanguage] = useState(false);

    const openLanguage = () => {
        setShowLanguage(!showLanguage);
    }

    return (
        <>
            <a className="logo" href="/"><img src={logo} /></a>
            <nav className="navigation">
                {
                    local[location].navigation.links.map((link, key) => {
                        return (
                            <Link key={key} className="navigation__link" to={link.path}>{link.name}</Link>
                        )
                    })
                }
                <section>
                    <button onClick={openLanguage} className="locationPicker">{location}</button>
                    {
                        (showLanguage) ? <section className="language">
                            {
                                local[location].navigation.langSelector.map((choosedLang, key) => {
                                    return <>
                                        <button key={choosedLang} className="locationPicker" onClick={(e) => {setLocation(choosedLang.short), setShowLanguage(!showLanguage)}}>
                                            {choosedLang.long}
                                        </button>
                                    </>
                                })
                            }
                        </section> : null
                    }
                </section>
            </nav>
            <section className="flex">
                <GitHub url="https://github.com/felixaschultz" />
                <LinkedIn url="https://www.linkedin.com/in/felixaschultz" />
                <iframe src="https://github.com/sponsors/felixaschultz/button" title="Sponsor felixaschultz" height="32" width="114" style={{border: 0, borderRadius: "6px"}}></iframe>
            </section>
        </>
    )
}