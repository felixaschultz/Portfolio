import "../Style.css";
import "./Style.css";
export default function LinkedIn({url}){
    return (
        <a title="Github" className="navigation__link" href
        ={url} target="_blank" role="button">
            <i className="icon github"></i>
        </a>
    )
}