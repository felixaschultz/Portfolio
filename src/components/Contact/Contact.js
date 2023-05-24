const { useState, useEffect, useRef, useContext } = React;
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
import "./Style/Contact.css";
export default function Contact(props){
    const [location] = useContext(LocationContext);
    
    function contactMe(e){
        e.preventDefault();
        console.log(e)
        const formData = new FormData(e.target);

        console.log(formData)
    }

    return (<>
        <div className="popup">
            <section className="popup-content">
                <button className="close-popup" onClick={() => {
                    props.setShowPopup(!props.showPopup)
                }}>Close</button>
                <h2>{local[location].pages.contact.title}</h2>
                <p>{local[location].pages.contact.description}</p>
                <form onSubmit={(e) => contactMe(e)} method="post">
                    <input name="name"/>
                    <button>{local[location].pages.contact.submitBtn}</button>
                </form>
            </section>
        </div>
    </>)
}