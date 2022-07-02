import "./App.css";
const Router = window.ReactRouterDOM.BrowserRouter;
const Route =  window.ReactRouterDOM.Route;
const Link =  window.ReactRouterDOM.Link;
const Prompt =  window.ReactRouterDOM.Prompt;
const Switch = window.ReactRouterDOM.Switch;
const Redirect = window.ReactRouterDOM.Redirect;

import Home from "../Pages/Home/Home";
import Web from "../Pages/Web/Web";
import Photography from "../Pages/Photography/Photography";
import Nav from "../components/Nav/Nav";
import { useTitle, TitleProvider } from "../TitleContext";

export default function App() {
    const { title } = useTitle();
    if (window?.INIT?.ga) {
        const gaScriptSrc = `https://www.googletagmanager.com/gtag/js?id=${window.INIT.ga.id}`;
        const gaScript = document.createElement("script");
        gaScript.async = true;
        gaScript.src = gaScriptSrc;

        const gaScriptInline = document.createElement("script");
        gaScriptInline.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
        
            gtag('config', '${window.INIT.ga.id}');
        `;

        document.head.appendChild(gaScript)
        document.head.appendChild(gaScriptInline)
    }

    return (
        <>
            <TitleProvider>
                <Router>
                    <header className="main-header">
                        <Link className="logo" to="/">FelixS.</Link>
                        <Nav />
                    </header>
                    <Switch>
                        <Route path="/" exact title="home">
                            <Home />
                        </Route>
                        <Route path="/fotografi">
                            <Photography />
                        </Route>
                        <Route path="/web">
                            <Web />
                        </Route>
                        <Redirect to="/" />
                    </Switch>
                </Router>
            </TitleProvider>
        </>
    )
}