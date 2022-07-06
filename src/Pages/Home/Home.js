import "./Style/Home.css";
import DanfossLogo from "./Danfoss_logo.svg";


export default function Home(props) {
    document.title = props.title;
    return (
        <>
            <main>
                <section className="intro grid">
                    <section className="photography intro__section">
                        <h2 className="heading">Felix A. Schultz</h2>
                        <p>AP graduate Multimediadesigner / Front End developer</p>
                    </section>
                    <section className="coding intro__section">
                        <h2 className="heading">&#60;Coder /&#62;</h2>
                        <p>
                            Jeg har en passion for front end web development. Jeg har arbejde mere end 10 års med udvikling af hjemmesider, de første 5 år bare som hobby ved siden af skolen.
                            De sidste 5 år har fokuserede mig at går fuld professionelt ind i webudvikling. Jeg er igang med at udbygge mine færdigheder i ReactJS.
                        </p>
                    </section>
                </section>
                <section className="content">
                    <article className="companys">
                        <img className="companys__logo" src={DanfossLogo} />
                    </article>
                </section>
            </main>
        </>
    )
}