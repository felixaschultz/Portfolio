const { useState, useEffect, useRef, useContext } = React;
import "./Style.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";
import { Projects } from "../../Projects/Projects";
import Project from "../../components/Project/Project";
const useParams = window.ReactRouterDOM.useParams;

export default function ProjectsPage(props) {
    document.title = props.title;
    const [location, setLocation] = useContext(LocationContext);
    const [showPopup, setShowPopup] = useState({hideShow: false, item: null});
    const [project, setProject] = useState(null);
    const { handle, id } = useParams();
    if(handle){

        const project = Projects.filter((project, key) => {
            if(project.id == handle){
                return project
            }
        })
        console.log(location, project);
        return (
            <>
                <main>
                    <section className="landingPage">
                        <section className="landingPage__content">
                            <h1 className="landingPage__heading">{project[0].name}</h1>
                            <p>{project[0].description[location]}</p>
                        </section>
                    </section>
                </main>
            </>
        )

    }else{
        return (
            <>
                <main>
                    <section className="landingPage">
                        <section className="landingPage__content">
                            <h1 className="landingPage__heading">{local[location].pages.projects.title}</h1>
                            <p></p>
                        </section>
                    </section>
                    <section className="belowthfold">
                        <section className="content project-grid">
                        {
                                Projects.map((project, key) => {
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
                        </section>
                    </section>
                </main>
                {
                    (showPopup.hideShow && showPopup.item == "Project") ? <Project setShowPopup={setShowPopup} showPopup={showPopup.hideShow} project={project} /> : null
                }
            </>
        )
    }
}