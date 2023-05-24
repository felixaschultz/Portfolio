const { useState, useEffect, useRef, useContext } = React;
import "./Style/Footer.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";

export default function Footer(){
    const [location, setLocation] = useContext(LocationContext);
    return (
        <>
            <footer className="footer">
                <div className="footer_content">
                    <section>
                        
                    </section>
                    <p>&copy; {new Date().getFullYear()}</p>
                </div>
            </footer>
        </>
    )
}