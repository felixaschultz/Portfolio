const { useState, useEffect, useRef, createContext, useMemo } = React;
export default function EasterEgg(props) {
    let word = "";
    const [easterEgg, setEasterEgg] = useState(false);
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

        if(word === "felix"){
            word = "";
            setEasterEgg(true);
        }
    });

    if(easterEgg){
        return (
            <>
                <section className="easterEgg">
                    <h1>🥚</h1>
                </section>
            </>
        )
    }
}