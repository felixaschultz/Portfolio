const { useState, useEffect, useRef, useContext } = React;
import "./Style.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";

export default function Projects(props) {
    document.title = props.title;
    const [location, setLocation] = useContext(LocationContext);
    return (
        <>
            <main>
                <section className="landingPage">
                    <section className="landingPage__content">
                        <h1 className="landingPage__heading">{local[location].pages.projects.title}</h1>
                        <p></p>
                    </section>
                </section>
                <section className="belowthfold">
                    <section className="content">
                        <a href="https://www.intastellarsolutions.com/gdpr-cookiebanner">
                            <h2>Intastellar Cookie Banner</h2>
                        </a>
                    </section>
                </section>
            </main>
        </>
    )
}