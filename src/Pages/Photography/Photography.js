const { useState, useEffect, useRef, useContext } = React;
import "./Style.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";

const useParams = window.ReactRouterDOM.useParams;

export default function Photography(props) {
    document.title = props.title;
    const [location, setLocation] = useContext(LocationContext);
    return (
        <>
            <main>
                <section className="landingPage">
                    <section className="landingPage__content">
                        <h1 className="landingPage__heading">{local[location].pages.photography.title}</h1>
                        <p>{local[location].pages.photography.description}</p>
                    </section>
                </section>
            </main>
        </>
    )
}