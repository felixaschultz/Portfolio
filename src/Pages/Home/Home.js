const { useState, useEffect, useRef, useContext } = React;
const Link = window.ReactRouterDOM.Link;
import "./Style/Home.css";
import DanfossLogo from "./Danfoss_logo.svg";
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
import { Projects } from "../../Projects/Projects";
import Project from "../../components/Project/Project";
import Recommendations from "../../components/Recommendations";
import CardsSlider from "../../components/CardsSlider";
import responsive from "../../statics/assets/responsive.svg";
import me from "../../statics/assets/me.jpg";

export default function Home(props) {
    document.title = props.title;
    const [location] = useContext(LocationContext);
    const showPopup = props.showPopup
    const setShowPopup = props.setShowPopup
    const item = props.item;

    const [project, setProject] = useState(null);

    return (
        <>
            <main>
                <div id="login-button" data-app-name="Felix A. | Portfolio" data-login_callback="login" data-client_id="d2eefd7f1564fa4c9714000456183a6b0f51e8c9519e1089ec41ce905ffc0c453dfac91ae8645c41ebae9c59e7a6e5233b1339e41a15723a9ba6d934bbb3e92d"></div>
                <section className="landingPage" style={{ paddingBottom: "20px" }}>
                    <section className="landingPage__ImageContainer">
                        {/* <video className="landginPage-video" playsInline muted autoPlay loop src="https://www.cykelfaergen.info/assets/vid/cykelfaergen-reklame.mp4"></video> */}
                    </section>
                    <section className="landingPage__content landingPage__left landingPage--TopLeft show">
                        <h1 className="landingPage__heading">&lt;Felix A. Schultz /&gt;</h1>
                        <h2>Fullstack developer | Photographer</h2>
                    </section>
                    <section className="landingPage__content landingPage__right landingPage--TopRight">
                        <section className="landingPage__rightContent">
                            <h2 className="landingPage__headinTwo">
                                {local[location].pages.homepage.title}
                            </h2>
                            <p style={{ maxWidth: "400px", lineHeight: "1.5em" }}>{local[location].pages.homepage.introduction}</p>
                            <a onClick={() => {
                                setShowPopup({ hideShow: !showPopup.hideShow, item: "Contact" })
                            }} className="cta">{local[location].pages.homepage.topCta}</a>
                        </section>
                    </section>
                </section>
                <section className="ppad content projects">
                    <div className="hero-intro__content grid">
                        {
                            Projects.filter((project) => {
                                return project.highlight
                            }).slice(0, 3).map((project, key) => {
                                return (
                                    <>
                                        <a href={"/project/" + project.id} key={key} className="frontpage-projects">
                                            <img src={project.screenshot ?? responsive} />
                                            <h2>{project.name}</h2>
                                            <p>{project.type}</p>
                                            <p>Tech: {project.technology}</p>
                                        </a>
                                    </>
                                )
                            })
                        }
                    </div>
                    <Link to="/projects" className="showMore">Show more</Link>
                </section>
                <CardsSlider
                    items={[
                        {
                            title: "Web",
                            description: "Web development",
                            image: responsive
                        },
                    ]}
                />
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
        </>
    )
}