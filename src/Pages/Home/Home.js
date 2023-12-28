const { useState, useEffect, useRef, useContext } = React;
const Link = window.ReactRouterDOM.Link;
import "./Style/Home.css";
import DanfossLogo from "./Danfoss_logo.svg";
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
import Contact from "../../components/Contact/Contact";
import { Projects } from "../../Projects/Projects";
import Project from "../../components/Project/Project";
import { Recommendations } from "../../recommendations/Recommendations";

export default function Home(props) {
    document.title = props.title;
    const [location] = useContext(LocationContext);
    const [showPopup, setShowPopup] = useState({hideShow: false, item: null});
    const [project, setProject] = useState(null);

    window.addEventListener("DOMContentLoaded", function (){
        Intastellar.accounts.id.renderButton(
            document.querySelector("#buttonDiv")
        )
    })

    return (
        <>
            <main>
                <section className="landingPage">
                    <section className="landingPage__ImageContainer">
                        <img loading="lazy" src="" alt="" className="landingPage__imageTwo"/>
                        <img loading="lazy" src="https://media.licdn.com/dms/image/C4D03AQFpj4JkJ2LuQQ/profile-displayphoto-shrink_800_800/0/1633340982579?e=1690416000&v=beta&t=mWnTamTE4r15tgIDsRyIsV3GofhP0Ob12bmE-uvzjPA" alt="Felix A. Schultz" className="landingPage__imageOne"/>
                    </section>
                    <section className="landingPage__content landingPage__left landingPage--TopLeft show">
                        <h1 className="landingPage__heading">Felix A. Schultz</h1>
                        <h2>Frontend developer</h2>
                    </section>
                    <section className="landingPage__content landingPage__right landingPage--TopRight">
                        <div className="landingPage__style"></div>
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
                                        <article key={key} className="frontpage-projects" onClick={
                                            () => {
                                                setShowPopup({hideShow: !showPopup.hideShow, item: "Project"}),
                                                setProject(project.name)
                                            }
                                        }>
                                            <img src="https://denisechandler.com/wp-content/themes/portfolio_oct2021/images/adam_gidwitz.png" />
                                            <h2>{project.name}</h2>
                                            <p>{project.type}</p>
                                        </article>
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
                        <img />
                    </section>
                </section>
                <section className="ppad">
                    <div className="content">
                        <h2>{local[location].pages.homepage.recommendations.title}</h2>
                        <div className="grid">
                        {
                            Recommendations.slice(0, 3).map((item, key) => {
                                return (
                                    <div key={key} className="recommendations__item">
                                        <p>"{item.recommend}"</p>
                                        <p>-{item.author}</p>
                                    </div>

                                )
                            })
                        }
                        </div>
                    </div>
                </section>
            </main>
            {
                (showPopup.hideShow && showPopup.item == "Contact") ? <Contact setShowPopup={setShowPopup} showPopup={showPopup.hideShow} /> : null
            }
            {
                (showPopup.hideShow && showPopup.item == "Project") ? <Project setShowPopup={setShowPopup} showPopup={showPopup.hideShow} project={project} /> : null
            }
        </>
    )
}