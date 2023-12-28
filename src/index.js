import App from "./modules/App.js";
import { TitleProvider } from "./TitleContext";
ReactDOM.hydrate(
    <TitleProvider>
        <App />
    </TitleProvider>,
    document.getElementById('app')
);