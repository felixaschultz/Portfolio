const { useState, useEffect, useRef, useContext } = React;
import { recom } from "../../recommendations/Recommendations";
import { local } from "../../localization/local";
import { LocationContext } from "../../modules/App";
import "./Style.css";

export default function Recommendations() {
    const [location] = useContext(LocationContext);
    return (
        <section className="ppad">
            <div className="content">
                <h2>{local[location].pages.homepage.recommendations.title}</h2>
                <div className="grid">
                {
                    recom.slice(0, 3).map((item, key) => {
                        return (
                            <div key={key} className="recommendations__item">
                                <p className="recommendation">{item.recommend}</p>
                                <p className="recommendation-user">{item.author}</p>
                            </div>

                        )
                    })
                }
                </div>
            </div>
        </section>
    )
}