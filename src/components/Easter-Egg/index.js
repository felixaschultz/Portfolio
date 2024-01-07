const { useState, useEffect, useRef, createContext, useMemo } = React;
export default function EasterEgg(props) {
    let word = "";
    window.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
            // Handle backspace separately
            word = word.substring(0, word.length - 1);
        } else if (e.key === "Shift") {
            // Remove the entire "Shift" word and append uppercase letter
            word += e.key.replace(/Shift/g, "").toUpperCase();
        } else if (e.key.length === 1) {
            // Handle regular alphanumeric keys
            word += e.key;
        }

        console.log(word);

        if(word === "felix"){
            word = "";
            const heading = document.querySelector(".landingPage__heading");

            if(heading.innerText == "<FELIX A. SCHULTZ />"){
                heading.innerText = "..- .-.. . -..-   .-   ... -.-. .... ..- .-.. - --..   -..-.->";
            }
        }

        if(word.toLowerCase() == "cykelfaergen" || word.toLowerCase() === "cykelfærgen"){
            window.location.href = "/project/cykelfaergen";
        }

        if(word.toLowerCase() == "ross geller" || word.toLowerCase() == "ross"){
            document.querySelector("body").style.transformOrigin = "960px 720px";
            document.querySelector("body").style.transform = "rotate(9deg)";
            setTimeout(() => {
                document.querySelector("body").style.transform = "rotate(-9deg)";
            }, 1000);

            setTimeout(() => {
                document.querySelector("body").style.transform = "rotate(0deg)";
            }, 2000);
            word = "";
        }
    });
}