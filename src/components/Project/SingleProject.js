const { useState, useEffect, useRef, useContext } = React;
import "../../Pages/Projects/Style.css";
import { local } from "../../localization/local";
import { Projects } from "../../Projects/Projects";
const useParams = window.ReactRouterDOM.useParams;
import { LocationContext } from "../../modules/App";

export default function SingleProject(props){
    const [location] = useContext(LocationContext);
    const {handle, id} = useParams();
    const project = Projects.filter((project, key) => {
        if(project.id == handle){
            return project
        }
    })

    document.title = project[0].name + " | Felix A. Schultz - Portfolio";

    useEffect(() => {
        const video = document.querySelector("video");
        if(video){
            video.addEventListener("click", function(){
                if(this.paused){
                    this.play();
                } else {
                    this.pause();
                }
            })

            window.addEventListener("keydown", function(e){
                e.preventDefault();
                if(e.keyCode == "32"){
                    if(video.paused){
                        video.play();
                    } else {
                        video.pause();
                    }
                }
            })
        }
    }, [project])
    
    return (
        <>
            <main>
                <section className="landingPage">
                    <section className="landingPage__content">
                        <h1 className="landingPage__heading">{project[0].name}</h1>
                        <h3>Tech: {project[0].technology}</h3>
                        <p>{project[0].short_description[location]}</p>
                        <div>
                        {
                            (project[0].url != null) ? <a className="cta" href={project[0].url} target="_blank">{local[location].pages.projects.visit_urls}</a> : null
                        }
                        {
                            (project[0].github != null) ? <a className="showMore" href={project[0].github} target="_blank">{local[location].pages.projects.visit_github}</a> : null
                        }
                        </div>
                    </section>
                    <img src={project[0].screenshot} />
                </section>
                <section className="belowthfold project-page">
                    <section className="content" dangerouslySetInnerHTML={{__html: project[0].description[location]}}></section>
                </section>
            </main>
        </>
    )
}