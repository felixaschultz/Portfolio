import "./Style.css";
export default function Projects(props) {
    document.title = props.title;
    return (
        <>
            <main>
                <section className="landingPage">
                    <section className="landingPage__content">
                        <h1 className="landingPage__heading">Projekter</h1>
                        <p></p>
                    </section>
                </section>
                <section className="belowthfold">
                    <section className="content">
                        <a href="https://www.intastellarsolutions.com/gdpr-cookiebanner">
                            <h2>Intastellar Cookie Banner</h2>
                        </a>
                    </section>
                </section>
            </main>
        </>
    )
}