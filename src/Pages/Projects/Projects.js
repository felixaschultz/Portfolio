const { useState, useEffect, useRef, useContext } = React;
import "./Style.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";
import { Projects } from "../../Projects/Projects";
import Project from "../../components/Project/Project";
import responsive from "../../statics/assets/responsive.svg";
const useParams = window.ReactRouterDOM.useParams;
const Link = window.ReactRouterDOM.Link;

export default function ProjectsPage(props) {
    document.title = props.title;
    const [location, setLocation] = useContext(LocationContext);
    const [showPopup, setShowPopup] = useState({hideShow: false, item: null});
    const [project, setProject] = useState(null);
    return (
        <>
            <main>
                <section className="landingPage">
                    <section className="landingPage__content --span">
                        <h1 className="landingPage__heading">{local[location].pages.projects.title}</h1>
                        <p>{local[location].pages.projects.description}</p>
                    </section>
                </section>
                <section className="belowthfold">
                    <section className="content project-grid">
                    {
                            Projects.map((project, key) => {
                                return (
                                    <>
                                        <Link to={"/project/" + project.id} key={key} className="frontpage-projects" onClick={
                                            (e) => {
                                                (window.location.pathname != "/projects") ?? e.preventDefault(), setShowPopup({hideShow: !showPopup.hideShow, item: "Project"})
                                            }
                                        }>
                                            <img src={(project.screenshot === null) ? responsive : project.screenshot} />
                                            <h2>{project.name}</h2>
                                            <p>{project.type}</p>
                                            <p>Tech: {project.technology}</p>
                                        </Link>
                                    </>
                                )
                            })
                        }
                    </section>
                </section>
            </main>
            {
                (showPopup.hideShow && showPopup.item == "Project") ? <Project setShowPopup={setShowPopup} showPopup={showPopup.hideShow} project={project} /> : null
            }
        </>
    )
}