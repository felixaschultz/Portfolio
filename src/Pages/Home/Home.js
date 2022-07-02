import { useTitle } from "../../TitleContext";
import "./Style/Home.css";
export default function Home() {
    const { setTitle } = useTitle();

    React.useEffect(() => {
        setTitle('This is human readable title for Home Component')
    }, [])
    return (
        <>
            <main>
                <section className="intro grid">
                    <section className="photography intro__section">
                        <h2 className="heading">Felix A. Schultz</h2>
                        <p>AP graduate Multimediadesigner / Front End developer</p>
                    </section>
                    <img className="me__image" src="/* https://new.felix-schultz.net/assets/me.jpg */" />
                    <section className="coding intro__section">
                        <h2 className="heading">&#60;Coder /&#62;</h2>
                        <p>
                            Jeg har en passion for front end web development. Jeg har arbejde mere end 10 års med udvikling af hjemmesider, de første 5 år bare som hobby ved siden af skolen.
                            De sidste 5 år har fokuserede mig at går fuld professionelt ind i webudvikling. Jeg er igang med at udbygge mine færdigheder i ReactJS.
                        </p>
                    </section>
                </section>
                <section className="content">
                    <h2>Hej</h2>
                </section>
            </main>
        </>
    )
}