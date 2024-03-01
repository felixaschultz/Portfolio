const { useState, useEffect, useRef, useContext } = React;
const Link = window.ReactRouterDOM.Link;
import "./Style/Home.css";
import DanfossLogo from "./Danfoss_logo.svg";
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
import { Projects } from "../../Projects/Projects";
import Project from "../../components/Project/Project";
import Recommendations from "../../components/Recommendations";
import responsive from "../../statics/assets/responsive.svg";
import me from "../../statics/assets/me.jpg";

export default function Home(props) {
    document.title = props.title;
    const [location] = useContext(LocationContext);
    const showPopup = props.showPopup
    const setShowPopup = props.setShowPopup
    const item = props.item;

    const [project, setProject] = useState(null);

    window.addEventListener("DOMContentLoaded", function (){
        Intastellar.accounts.id.renderButton(
            document.querySelector("#buttonDiv")
        )
    })

    return (
        <>
            <main>
                <section className="landingPage" style={{paddingBottom: "20px"}}>
                    <section className="landingPage__ImageContainer">
                        <video className="landginPage-video" playsInline muted autoPlay loop src="https://www.cykelfaergen.info/assets/vid/cykelfaergen-reklame.mp4"></video>
                    </section>
                    <section className="landingPage__content landingPage__left landingPage--TopLeft show">
                        <h1 className="landingPage__heading">&lt;Felix A. Schultz /&gt;</h1>
                        <h2>Frontend developer | Photographer</h2>
                    </section>
                    <section className="landingPage__content landingPage__right landingPage--TopRight">
                        <section className="landingPage__rightContent">
                            <h2 className="landingPage__headinTwo">
                                {local[location].pages.homepage.title}
                            </h2>
                            <p style={{maxWidth: "400px", lineHeight: "1.5em"}}>{local[location].pages.homepage.introduction}</p>
                            <a onClick={() => {
                                setShowPopup({hideShow: !showPopup.hideShow, item: "Contact"})
                            }} className="cta">{local[location].pages.homepage.topCta}</a>
                        </section>
                    </section>
                </section>
                <section className="ppad content projects">
                    <div className="hero-intro__content grid">
                        {
                            Projects.slice(0, 3).map((project, key) => {
                                return (
                                    <>
                                        <Link to={"/project/" + project.id} key={key} className="frontpage-projects">
                                            <img src={project.screenshot ?? responsive} />
                                            <h2>{project.name}</h2>
                                            <p>{project.type}</p>
                                        </Link>
                                    </>
                                )
                            })
                        }
                    </div>
                    <Link to="/projects" className="showMore">Show more</Link>
                </section>
                <section className="photography">
                    <section className="grid content">
                        <section>
                            <h2>{local[location].pages.homepage.about.title}</h2>
                            <p>{local[location].pages.homepage.about.description}</p>
                        </section>
                        <img width="150px" height="150px" className="profilePicture" src={me} />
                    </section>
                </section>
                <Recommendations />
            </main>
            {
                (showPopup.hideShow && showPopup.item == "Project") ? <Project setShowPopup={setShowPopup} showPopup={showPopup.hideShow} project={project} /> : null
            }
        </>
    )
}