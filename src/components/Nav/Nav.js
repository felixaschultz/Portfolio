const Link = window.ReactRouterDOM.Link;
import "./Style/Nav.css";

export default function Nav() {
    return (
        <>
            <nav className="navigation">
                <Link className="navigation__link" to="/projects">Projekter</Link>
                <a className="navigation__link" href="https://github.com/felixaschultz" target="_blank"><img className="github--icon" src="https://www.intastellarsolutions.com/assets/icons/GitHub-Mark/PNG/GitHub-Mark-64px.png" /> Github</a>
            </nav>
        </>
    )
}