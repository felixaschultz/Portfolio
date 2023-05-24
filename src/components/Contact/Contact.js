const { useState, useEffect, useRef, useContext } = React;
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
import "./Style/Contact.css";
export default function Contact(props){
    const [location] = useContext(LocationContext);
    
    function contactMe(e){
        e.preventDefault();
        const formData = new FormData(e.target);

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
                    <label htmlFor="name">
                        {local[location].pages.contact.name}
                        <input id="name" type="text" name="name"/>
                    </label>
                    <label htmlFor="email">
                        {local[location].pages.contact.email}
                        <input id="email" type="email" name="email"/>
                    </label>
                    <label htmlFor="message">
                        {local[location].pages.contact.message}
                        <textarea id="message" name="message"></textarea>
                    </label>
                    <button>{local[location].pages.contact.submitBtn}</button>
                </form>
            </section>
        </div>
    </>)
}