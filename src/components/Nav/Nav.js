const Link = window.ReactRouterDOM.Link;
import "./Style/Nav.css";

export default function Nav() {
    return (
        <>
            <nav className="navigation">
                <Link className="navigation__link" to="/web">Web</Link>
                <Link className="navigation__link" to="/projects">Projekter</Link>
            </nav>
        </>
    )
}