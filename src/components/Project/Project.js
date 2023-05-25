const { useState, useEffect, useRef, useContext } = React;
import "./Style/Project.css";
import "../Contact/Style/Contact.css";
import { Projects } from "../../Projects/Projects";
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
export default function Project(props){
    const [location] = useContext(LocationContext);
    return (
        <>
            <div className="popup">
                <section className="popup-content">
                    <button className="close-popup" onClick={() => {
                        props.setShowPopup(!props.showPopup)
                    }}>Close</button>
                    <section className="grid">
                    {
                        Projects.map((project) => {
                            if(project.name === props.project){
                                return (
                                    <> 
                                        <img src={project.screenshot} alt={(project.url != null ? "Screenshot of the Website for " + project.url : "Project " + project.name)} />
                                        <section className="project-description">
                                            <h2>{project.name}</h2>
                                            <p>{project.type}</p>
                                            <p>{project.description[location]}</p>
                                            {
                                                (project.url != null) ? <a className="cta" href={project.url} target="_blank">Visit Website</a> : null
                                            }
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