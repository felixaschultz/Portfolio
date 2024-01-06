const { useState, useEffect, useRef, useContext } = React;
import "./Style/Project.css";
import "../Contact/Style/Contact.css";
import { Projects } from "../../Projects/Projects";
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
const Link = window.ReactRouterDOM.Link;

export default function Project(props){
    const [location] = useContext(LocationContext);
    return (
        <>
            <div className="popup">
                <section className="popup-content project-infos">
                    <button className="close-popup" onClick={() => {
                        props.setShowPopup(!props.showPopup)
                    }}>Close</button>
                    <section className="grid">
                    {
                        Projects.map((project, key) => {
                            if(project.name === props.project){
                                return (
                                    <> 
                                       { (project.screenshot !== null) ? <img key={key} src={project.screenshot} alt={(project.url != null ? "Screenshot of the Website for " + project.url : "Project " + project.name)} /> : null }
                                        <section key={key} className="project-description">
                                            <h2 className="project-name">{project.name}</h2>
                                            <p className="project-type">{project.type}</p>
                                            <p>{project.short_description[location]}</p>
                                            {
                                                (project.url != null) ? <a className="cta" href={project.url} target="_blank">{local[location].pages.projects.visit_urls}</a> : null
                                                
                                            }
                                            {
                                                (project.github != null) ? <a className="showMore" href={project.github} target="_blank">{local[location].pages.projects.visit_github}</a> : null
                                            }
                                            <Link className="showMore" to={"/project/" + project.id}>Læs mere</Link>
                                        </section>
                                    </>
                                )
                            }
                        })
                    }
                    </section>
                </section>
            </div>
        </>
    )
}