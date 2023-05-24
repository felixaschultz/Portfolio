const { useState, useEffect, useRef, useContext } = React;
import "./Style/Home.css";
import DanfossLogo from "./Danfoss_logo.svg";
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
import Contact from "../../components/Contact/Contact";

export default function Home(props) {
    document.title = props.title;
    const [location] = useContext(LocationContext);
    const [showPopup, setShowPopup] = useState(false);
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
                                {local[location].pages.homepage.title}
                            </h2>
                            <p style={{maxWidth: "400px", lineHeight: "1.5em"}}>{local[location].pages.homepage.introduction}</p>
                            <a onClick={() => {
                                setShowPopup(!showPopup)
                            }} className="cta">{local[location].pages.homepage.topCta}</a>
                        </section>
                    </section>
                </section>
                <section className="hero-intro">
                    <div className="hero-intro__content">
                        <h2>{local[location].pages.homepage.heroIntro.title}</h2>
                    </div>
                </section>
            </main>
            {
                (showPopup) ? <Contact setShowPopup={setShowPopup} showPopup={showPopup} /> : null
            }
        </>
    )
}