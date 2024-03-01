import "../Style.css";
import "./Style.css";
export default function LinkedIn({url}){
    return (
        <a className="navigation__link" href={url} target="_blank" role="button">
            <i class="icon linkedIn"></i>
        </a>
    )
}