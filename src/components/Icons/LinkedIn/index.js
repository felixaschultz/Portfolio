import "../Style.css";
import "./Style.css";
import linkedin from "../img/linkedin.png";
export default function LinkedIn({url}){
    return (
        <a title="LinkedIn" className="navigation__link" href={url} target="_blank" role="button">
            <i className="icon linkedIn" style={{backgroundImage: `url(${linkedin})`}}></i>
        </a>
    )
}