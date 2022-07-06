const Link = window.ReactRouterDOM.Link;
import "./Style/Nav.css";

export default function Nav() {
    return (
        <>
            <nav className="navigation">
                <Link className="navigation__link" to="/projects">Projekter</Link>
                <Link className="navigation__link" to={"https://github.com/felixaschultz"}><img className="github--icon" src="https://www.intastellarsolutions.com/assets/icons/GitHub-Mark/PNG/GitHub-Mark-64px.png" /> Github</Link>
            </nav>
        </>
    )
}