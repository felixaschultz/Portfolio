const { useState, useEffect, useRef, useContext } = React;
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
import "./Style/Contact.css";
export default function Contact(props){
    const [location] = useContext(LocationContext);
    
    function contactMe(e){
        e.preventDefault();
        const formData = new FormData(e.target);

        const form = Object.fromEntries(formData.entries());
        const body = {
            name: form.name,
            email: form.email,
            message: form.message
        }

        fetch(location.origin + "/api/contact", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
                }
            }).then((re) => re.json()).then((re) => {
                if(re.success){
                    alert(local[location].contact.success);
                    e.target.reset();
                }else{
                    alert(local[location].contact.error, re.status)
                }
            })
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
                    <label className="formItems" htmlFor="name">
                        {local[location].pages.contact.name}
                        <input className="formItems-input" id="name" type="text" name="name"/>
                    </label>
                    <label className="formItems" htmlFor="email">
                        {local[location].pages.contact.email}
                        <input className="formItems-input" id="email" type="email" name="email"/>
                    </label>
                    <label className="formItems" htmlFor="message">
                        {local[location].pages.contact.message}
                        <textarea className="formItems-input no-resize text-input" id="message" name="message"></textarea>
                    </label>
                    <button className="cta contact-cta">{local[location].pages.contact.submitBtn}</button>
                </form>
            </section>
        </div>
    </>)
}