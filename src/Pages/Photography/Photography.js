const { useState, useEffect, useRef, useContext } = React;
import "./Style.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";
import importAll from "../../utils/importAll";

const useParams = window.ReactRouterDOM.useParams;

export default function Photography(props) {
    document.title = props.title;
    const [location, setLocation] = useContext(LocationContext);

    const images = importAll(require.context("../../assets/resource", true, /\.jpg|png|jpeg$/));

    console.log(images);

    return (
        <>
            <main>
                <section className="landingPage photo-bg">
                    <section className="landingPage__content">
                        <h1 className="landingPage__heading">{local[location].pages.photography.title}</h1>
                        <p>{local[location].pages.photography.description}</p>
                    </section>
                </section>
                <section className="belowthfold">
                    {images.map((photo, i) => (
                        <img key={i} src={photo} alt={`photo-${i}`} />
                    ))}
                </section>
            </main>
        </>
    )
}