const { useState, useEffect, useRef, useContext } = React;

import "./Style/Footer.css";
import { LocationContext } from "../../modules/App";
import { local } from "../../localization/local";

export default function Footer() {
    const [location, setLocation] = useContext(LocationContext);
    return (
        <>
            <footer className="footer">
                <div className="footer_content">
                    <p>&copy; {new Date().getFullYear()} Felix A. Schultz. All rights reserved</p>
                    <a href="https://www.intastellarsolutions.com/about/legal/privacy" target="_blank">Privacy Policy</a>
                </div>
            </footer>
        </>
    )
}