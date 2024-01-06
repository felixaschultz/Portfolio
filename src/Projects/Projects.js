import cykelfaegen from "../statics/projects/cykelfaergen/screenshot-of-website.png";
/* import alsense from "../statics/projects/alsense/"; */
import gdprcookiebanner from "../statics/projects/gdprcookiebanner/screenshot-of-website.png";
import intastellarsolutions from "../statics/projects/intastellarsolutions/screenshot-of-website.png";
import intastellarConsentsLogin from "../statics/projects/intastellarconsents/screenshot-login.png";
import instastellarConsetnsDashboard from "../statics/projects/intastellarconsents/screenshot-dashboard.png";

export const Projects = [
    {
        id: "cykelfaergen",
        name: "Cykelfærgen Flensborg Fjord",
        screenshot: cykelfaegen,
        description: {
            de: "",
            da: `Projektet Cykelfærgen henover Flensborg fjord, søgte en nye Webmaster der kunne overtage og holde deres hjemmeside opdateret.
            Jeg fik muligheden at kaste mig hen over deres hjemmeside...`,
            en: ""
        },
        short_description: {
            de: "Die Fahrradfähre Flensburger Förde hat einen neuen Webmaster gesucht der ihre Webseite überarbeiten und regelmässig aufdem laufenden halten konnte.",
            da: `Projektet Cykelfærgen henover Flensborg fjord, søgte en nye Webmaster der kunne overtage og holde deres hjemmeside opdateret. Desuden søgte de en der kunne holde deres SoMe opdateret.
                Jeg fik muligheden at overtage deres hjemmeside og SoMe. Jeg har sidenhen udviklet deres hjemmeside i PHP og har sidenhen udviklet deres SoMe.`,
            en: "",
        },
        github: null,
        url: "https://www.cykelfaergen.info",
        type: "Web design / development & SoMe marketing",
        technology: "HTML, CSS, JS, PHP, MySQL"
    },
    {
        id: "gdpr-cookiebanner",
        name: "GDPR Cookiebanner",
        screenshot: gdprcookiebanner,
        description: {
            de: "",
            da: `<section class="content-ppad">
                    <p>Med GDPR blev det et krav at alle hjemmesider skulle have en Cookie Consent. Jeg fik muligheden at udvikle en Cookie Consent til min egen hjemmeside, som jeg sidenhen har udviklet til en digital platform.</p>
                </section>`,
            en: ""
        },
        short_description: {
            de: "",
            da: "I 2018 blev GDPR indført i EU, som en ny lov der skulle sikre at alle hjemmesider skulle have en Cookie Consent. Jeg fik muligheden at udvikle en Cookie Consent til min egen hjemmeside, som jeg sidenhen har udviklet til en digital platform.",
            en: ""
        },
        github: "https://github.com/felixaschultz/intastellar-gdpr-cookiebanner",
        url: "https://www.intastellarsolutions.com/solutions/cookie-consents",
        type: "Web design / development",
        technology: "HTML, CSS, JS"
    },
    {
        id: "chat-bot",
        name: "Chat Bot",
        screenshot: null,
        description: {
            de: "",
            da: `
            <section class="content-ppad">
                <p>Jeg stod i den situation at jeg som skole projekt skulle komibnere 3 forskellige chat design, sammen med 2 andre i gruppen.
                Vi startede med at lave en plan for hvordan vi ville gribe det an, og hvordan vi ville fordele arbejdet.
                Til vores projektstyring benyttede vi Git og Github Projects, for at kunne se hvilken opgaver der ligger i backloggen.</p>
            </section>
            <section class="content-ppad scroll-snap">
                <h2>Min rolle i projektet</h2>
                <p>Jeg stod for at skrive og kode API endpoints til chatten. Jeg har benyttet mig af PHP, til at skrive en REST API som skal sikre at skabe noget funktionalitet, i frontend delen ved hjælp af JS fetch funktionen.</p>
                <h3>API endpoints</h3>
                <p>Dissen endpoints til chat funktionalitet fik jeg implementeret:</p>
                <ul>
                    <li>getChat</li>
                    <li>chat</li>
                    <li>getChatHistory</li>
                </ul>
                <p>Med disse enpoints skaber jeg til frontend delen en adgang, for at kunne tilgår dataen i Databasen.</p>
                <p>Alle endpoints i dette projekt har fået 4 headers som de skal sende med, til clientent.</p>
                <ol>
                    <li>Content-Type: application/json charset=UTF-8</li>
                    <li>Access-Control-Allow-Credentials: true</li>
                    <li>Access-Control-Allow-Methods: GET, POST</li>
                    <li>Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, *</li>
                </ol>
                <p>Med den første fortæller vi clienten i hviket format den kan regne med. Nummer 2 fortæller at den gerne må med sende cookies og andre nødvendig credentials men primært cookies. Nummer 3 fortæller om hvilken request method API endpoints har adgang til. Den sidste fortæller lige det sammen, så den kan være lidt liggylidgt hvis den nu ikke også vil indeholde Access-Allow-Origin: * som her vigitg for sikkerheden.</p>
                <p>Den fortæller nemlig om hvilken andre domains må for adgang til API endpoints. Hvis * er sat så betyder det at vi har sat en wild card som betyder at alle kan tilgår APIén. I en god API vil man sætte hvis muligt en domain som for adgang, eller men sætter en Authorize header med en JWT til verificering og tidsbegænsning.</p>
            </section>
            <section class="content-ppad scroll-snap">
                <h3>getChat endpoint</h3>
                <img src="/assets/projects/chatbot/getChat-endpoint.png" alt="" srcset="">
                <p>Med denne endpoint kan frontend hente alle svar og spørgesmål fra en specific chat historik.</p>
                <p>Frontend deler laver til denne endpoint en POST request som backend og APIen opfanger med hjælp af PHP indbygget funktion file_get_contents.</p>
                <p>Den funktion modtager en argument som skal entent være et link eller destination til en fil, eller som i mit eksempel, modtager den som argument "php://input".</p>
                <p>Med php://input for jeg direkte adgang til request body i et HTTP POST request, som backenden så kan håndter. I projektet er formatet som frontend sender med POST requesten et JSON objekt som er bestående ud af en chatId.</p>
                <p>Med denne chatId kan backenden så finde frem til den rigtige chat historik i databasen, og returnere den som JSON til frontend.</p>
            </section>
            `,
            en: ""
        },
        short_description: {
            de: "",
            da: "Under mit studie på Erhvervsakademiet Aarhus, fik jeg muligheden at udvikle en Chat Bot som et lille projekt. Jeg udviklede den i HTML & CSS og vanilla JS.",
            en: ""
        },
        github: "https://github.com/felixaschultz/chatbot",
        url: "https://github.com/felixaschultz/chatbot",
        type: "Web design / development",
        technology: "HTML, CSS, JS, PHP, MySQL"
    },
    {
        id: "intastellar-consents-platform",
        name: "Intastellar Consents Platform",
        screenshot: intastellarConsentsLogin,
        images: {
            dashboard: instastellarConsetnsDashboard
        },
        description: {
            de: "",
            da: `
            <section class="content-ppad">
                <p>Jeg fik udviklet for min Cookie banner, en digitale platform for at holde styr på alle de forskellige Consents. Jeg udviklede den i ReactJS.</p>
                <h2>Dashboard</h2>
                <p>Med Dashboard for man et hurtigt overblik over hvordan consents er fordelt henover:</p>
                <ul>
                    <li>Nødvendige cookies</li>
                    <li>Statistik cookies</li>
                    <li>Funktionelle cookies</li>
                    <li>Marketing cookies</li>
                    <li>Accepteret alle</li>
                    <li>Afvist alle</li>
                </ul>
                <p>samt hvordan fordeling er mellem lande.</p>
            </section>
            <img src=${instastellarConsetnsDashboard} />
            <section class="content-ppad">
                <p>Dashboarded indeholder også en simple lille cookie bot som checker hjemmesiden for cookies som er sendt igennem HTTP Requesten.</p>
            </section>
            <section class="content-ppad">
                <h2>Live data</h2>
                <p>For at hente live data til at vise aktive bruger på ens hjemmeside, benytter jeg mig af pull methoden og fetcher hvert 250 millisekund nye data fra APIen som fortiden kun tæller, de seneste bruger i de sidste 30 min.</p>
                <p>Med denne metode kan jeg så vise live data på dashboardet som er relativt nyt.</p>
            </section>
            <section class="content-ppad">
                <h2>Custom Hooks</h2>
                <p>Jeg har udviklet en custom hook, som benytter sig af konceptet SWR, som jeg benytter mig af til at hente data fra APIen.</p>
                <p>SWR, stale-while-revalidate, er en HTTP strategi som viser først data som ligger i cachen (stale), hvorefter den laver et nyt fetch kald (revalidate), for at så opdater indholdet med den nye opdateret information.</p>
            </section>
            <code class="code-editor">
<pre>
const { useState, useEffect } = React;
export default function useFetch(updateInterval, url, method, headers, body, handle){
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState();
    const [error, setError] = useState();
    const [lastUpdated, setLastUpdated] = useState(Math.floor(Date.now() / 100));
    const [updated, setUpdated] = useState("");
    let id = undefined;

    if(!url) return;

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetch(url, { method: method, headers, body, signal: controller.signal } )
            .then((res) => {
                if(res.status === 401){
                    return "Err_Login_Expired";
                }else if(res.status === 403){
                    return "Err_No_Access";
                }else if(
                    res.status === 404 ||
                    res.status === 500 ||
                    res.status === 502 ||
                    res.status === 503 ||
                    res.status === 504
                ){
                    return "Err_Server_Error";
                }

                return res.json()
            })
            .then(setData)
            .catch(setError)
            .finally(() => {
                setLoading(false);
                setUpdated("Now");
                setLastUpdated(Math.floor(Date.now() / 1000));
            });

        if(typeof(updateInterval) !=='undefined'){
            const interval1 = setInterval(() => {
                if ((Math.floor(Date.now() / 1000)) - lastUpdated >= 60) {
                    setUpdated(Math.floor(((Math.floor(Date.now() / 1000)) - lastUpdated) / 60) + " minute ago");
                }
            }, 1000);

            id = setInterval(() => {
                fetch(url, { method: method, headers, body, signal: controller.signal } )
                .then((res) => res.json())
                .then(setData)
                .catch(setError)
                .finally(() => {
                    setLoading(false);
                    clearInterval(interval1);
                    setUpdated("Now");
                    setLastUpdated(Math.floor(Date.now() / 1000));
                });
            }, updateInterval * 60 * 1000)
        }

        return () => {
            controller.abort();
            if(typeof(updateInterval) !=='undefined'){
                clearInterval(id);
            }
        }
    }, [url, handle]);

    if(data == "Err_Login_Expired"){
        localStorage.removeItem("globals");
        window.location.href = "/login";
        return;
    }

    return [loading, data, error, updated, lastUpdated, setUpdated];
}
</pre>
                </code>
            `,
            en: ""
        },
        short_description: {
            de: "",
            da: "Med Intastellar Consents, kan du nemt og hurtigt oprette en Cookie Consent, GDPR Consent eller en Privacy Policy til din hjemmeside. Du kan nemt og hurtigt oprette en konto og komme igang med at oprette din første Consent.",
            en: ""
        },
        github: "",
        url: "https://www.intastellarconsents.com",
        type: "Web design / development",
        technology: "HTML, CSS, JS, ReactJS"
    },
    {
        id: "intastellarsolutions",
        name: "Intastellar Solutions, International",
        screenshot: intastellarsolutions,
        description: {
            de: "",
            da: "",
            en: ""
        },
        short_description: {
            de: "",
            da: "",
            en: ""
        },
        github: null,
        url: "https://www.intastellarsolutions.com",
        type: "Web design / development",
        technology: "HTML, CSS, JS"
    },
    {
        id: "danfoss-insite",
        name: "Danfoss Alsense Insite",
        screenshot: null,
        description: {
            de: "",
            da: "Som min Hovedopgave fik jeg muligheden at skrive den sammen med Danfoss Climate Solutions. Jeg valgte opgaven at Redesigne og ny udvikle deres digitale platform Alsense InSite. Jeg udviklede det nye design i ReactJS.",
            en: ""
        },
        short_description: {
            de: "",
            da: "Som min Hovedopgave fik jeg muligheden at skrive den sammen med Danfoss Climate Solutions. Jeg valgte opgaven at Redesigne og ny udvikle deres digitale platform Alsense InSite. Jeg udviklede det nye design i ReactJS.",
            en: ""
        },
        github: null,
        url: "https://www.danfoss.com/en/products/dcs/monitoring-and-services/alsense-insite/",
        type: "Web design / development",
        technology: "HTML, CSS, JS, ReactJS"
    },
    {
        id: "sailmore",
        name: "Sailmore Dashboard & Website",
        screenshot: null,
        description: {
            de: "",
            da: "",
            en: ""
        },
        short_description: {
            de: "",
            da: "",
            en: ""
        },
        github: null,
        url: "https://sailmore-dev.felix-schultz.dk",
        type: "Web development",
        technology: "ReactJS"
    }
]