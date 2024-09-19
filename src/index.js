import App from "./modules/App.js";
const Router = window.ReactRouterDOM.BrowserRouter;
ReactDOM.hydrateRoot(document,
    <Router>
        <App />
    </Router>
);
