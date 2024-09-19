import "./Styles.css";
const { useState, useEffect, useRef, useContext } = React;

export default function CardsSlider() {
    const [activeCard, setActiveCard] = useState(0);
    return <>
        <div className="CardContainer">
            {/* onClick each item card the active state should be removed or added
                 The first item should be from begining have active state */
                [1, 2, 3, 4, 5].map((item, key) => {
                    return <div key={key} className={`Card ${activeCard === key ? "active" : ""}`} onClick={() => {
                        setActiveCard(key)
                    }}>
                        <h2>Card {item}</h2>
                    </div>
                })

            }
        </div>
    </>
}