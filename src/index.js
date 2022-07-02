import App from "./modules/App.js";
import { TitleProvider } from "./TitleContext";
ReactDOM.render(
    <TitleProvider>
        <App />
    </TitleProvider>,
    document.getElementById('app')
);