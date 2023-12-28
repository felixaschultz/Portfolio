import cykelfaegen from "../statics/projects/cykelfaergen/screenshot-of-website.png";
/* import alsense from "../statics/projects/alsense/"; */
import gdprcookiebanner from "../statics/projects/gdprcookiebanner/screenshot-of-website.png";
import intastellarsolutions from "../statics/projects/intastellarsolutions/screenshot-of-website.png";
import intastellarConsentsLogin from "../statics/projects/intastellarconsents/screenshot-login.png";
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
        type: "Web design / development & SoMe marketing"
    },
    {
        id: "gdpr-cookiebanner",
        name: "GDPR Cookiebanner",
        screenshot: gdprcookiebanner,
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
        github: "https://github.com/felixaschultz/intastellar-gdpr-cookiebanner",
        url: "https://www.intastellarsolutions.com/solutions/cookie-consents",
        type: "Web design / development"
    },
    {
        id: "chat-bot",
        name: "Chat Bot",
        screenshot: null,
        description: {
            de: "",
            da: `
                Dette projekt handlede om at kombinere 3 forskellige chat projekter ind til et

                Jeg stod i den situation at jeg som skole projekt skulle komibnere 3 forskellige chat design, sammen med 2 andre i gruppen.
                Jeg stod for at skrive og kode API endpoints til chatten. Jeg har benyttet mig af PHP, til at skrive en REST API som skal sikre at skabe noget funktionalitet, i frontend delen ved hjælp af JS fetch funktionen.

                
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
        type: "Web design / development"
    },
    {
        id: "intastellar-consents-platform",
        name: "Intastellar Consents Platform",
        screenshot: intastellarConsentsLogin,
        description: {
            de: "",
            da: "Jeg fik udviklet for min Cookie banner, en digitale platform for at holde styr på alle de forskellige Consents. Jeg udviklede den i ReactJS.",
            en: ""
        },
        short_description: {
            de: "",
            da: "Med Intastellar Consents, kan du nemt og hurtigt oprette en Cookie Consent, GDPR Consent eller en Privacy Policy til din hjemmeside. Du kan nemt og hurtigt oprette en konto og komme igang med at oprette din første Consent.",
            en: ""
        },
        github: "",
        url: "https://www.intastellarconsents.com",
        type: "Web design / development"
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
        type: "Web design / development"
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
        type: "Web design / development"
    }
]