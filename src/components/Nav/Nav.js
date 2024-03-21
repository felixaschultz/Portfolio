const Link = window.ReactRouterDOM.Link;
const NavLink = window.ReactRouterDOM.NavLink;
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
    const [showDropdown, setShowDropdown] = useState(false);

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
                            (link.type === "dropdown") ? <section key={key} className="dropdown">
                                <button className="dropdownButton" onClick={() => {
                                    setShowDropdown(!showDropdown)
                                }}>{link.name}</button>
                                {(showDropdown) ? <section className="dropdownContent">
                                    {
                                        link.items.map((item, key) => {
                                            return <a key={key} href={item.path} target="_blank">{item.name}</a>
                                        })
                                    }
                                </section> : null}
                            </section> : <NavLink key={key} style={({isActive})=>({
                                borderBottom: isActive ? "#15b0ab solid 2px": '',
                                opacity: isActive ? 1 : ""
                            })} className={`navigation__link`} to={link.path}>{link.name}</NavLink>
                        )
                    })
                }
            </nav>
            <section className="flex iconContainer">
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
                <GitHub url="https://github.com/felixaschultz" />
                <LinkedIn url="https://www.linkedin.com/in/felixaschultz" />
                <iframe src="https://github.com/sponsors/felixaschultz/button" title="Sponsor felixaschultz" height="32" width="114" style={{border: 0, borderRadius: "6px"}}></iframe>
            </section>
        </>
    )
}