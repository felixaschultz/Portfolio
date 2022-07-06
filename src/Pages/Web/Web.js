import { useTitle } from "../../TitleContext";
export default function Web(props) {
    document.title = props.title;
    return (
        <>
            <main className="content">
                <h1>Web</h1>
            </main>
        </>
    )
}