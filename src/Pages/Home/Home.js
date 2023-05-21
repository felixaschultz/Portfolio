import "./Style/Home.css";
import DanfossLogo from "./Danfoss_logo.svg";


export default function Home(props) {
    document.title = props.title;
    return (
        <>
            <main>
                <section className="landingPage">
                    <section className="landingPage__ImageContainer">
                        <img loading="lazy" src="https://new.felix-schultz.net/assets/landingPage/IMG_1608.jpg" alt="" className="landingPage__imageOne"/>
                        <img loading="lazy" src="https://new.felix-schultz.net/assets/IMG_1020.jpg" alt="" className="landingPage__imageTwo"/>
                    </section>
                    <section className="landingPage__content landingPage__left landingPage--TopLeft show">
                        <h2 className="landingPage__heading">Felix A. Schultz</h2>
                        <p>AP graduate Multimediadesigner / Front End developer</p>
                    </section>
                    <section className="landingPage__content landingPage__right landingPage--TopRight">
                        <div className="landingPage__style"></div>
                        <section className="landingPage__rightContent">
                            <h2 className="landingPage__headinTwo">
                                Front-end developer with passion
                            </h2>
                            <p style={{maxWidth: "400px", lineHeight: "1.5em"}}>Jeg har en passion for front end web development. Jeg har arbejde mere end 10 års med udvikling af hjemmesider, de første 5 år bare som hobby ved siden af skolen.
                            De sidste 5 år har fokuserede mig at går fuld professionelt ind i webudvikling. Jeg er igang med at udbygge mine færdigheder i ReactJS.</p>
                            {/* <a href="#about" class="cta jumpBtn">Læs om og kontakt mig</a> */}
                        </section>
                    </section>
                </section>
            </main>
        </>
    )
}