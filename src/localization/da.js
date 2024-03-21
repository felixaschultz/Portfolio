export default {
    pages:{
        homepage: {
            title: 'Fullstack developer with passion',
            introduction: 'Jeg har en passion for Fullstack web development. Jeg har arbejde mere end 10 års med udvikling af hjemmesider, de første 5 år bare som hobby ved siden af skolen. De sidste 5 år har fokuserede mig at går fuld professionelt ind i webudvikling. Jeg er igang med at udbygge mine færdigheder i ReactJS.',
            topCta: "Kontakt mig",
            heroIntro: {
               title: "",
            },
            about: {
                title: "Moin! Mit navn er Felix. Jeg er en Fullstack Developer basseret i Aarhus og råder i Sønderjylland & Tyskland",
                description: `I 2016 med 18 år blev jeg konstateret nyresyge, jeg fik at vide da jeg kom på sygehuset at jeg kun havde en nyrefunktion på 3%. Jeg måtte kæmpe om mit liv i 3,5 år med fejloperation, ydliger sygdom som virus. I juli 2019 blev jeg så endelig Transplanteret uden komplikationer. I 2020 startede jeg min uddannelse som Multimediendesigner og afsluttede den i 2022 med et 12-tal.
                I min fritid går jeg gerne ud med mit kamera og drone og optager nogle video klip, og billeder omkring mig og naturen. Jeg ser også gerne serier & film i fritiden, sammentidlig kan jeg godt finde på at udvikle lidt for sjovt på forskellige hoppy projekter eller andre små ting.
                I August 2023 har jeg startet min Professionsbachelor i Webudvikling på Erhvervsakademiet Aarhus, efter jeg i 2022 afsluttede min Multimediedesigner uddannelse.
                `
            },
            photography: {
                title: "Fotografering",

            },
            recommendations: {
                title: "Anbefalinger"
            }
        },
        projects: {
           title: "Projekter",
           description: "Her kan du se nogle af de projekter jeg har arbejdet på. Du kan også se flere projekter på min Github. Projekterne har jeg arbejdet på i min fritid, eller som en del af min uddannelse.",
           visit_urls: "Besøg hjemmesiden",
           visit_github: "Besøg Github"
        },
        photography: {
            title: "Fotografier",
            description: "Her kan du se nogle af de fotografier jeg har taget. Du kan også se flere fotografier på min Instagram.",
        },
        contact: {
            title: 'Lad os tage en snak!',
            description: "Lad os tage en lille snak. Udfyld formularen og jeg vil kontakte dig hurtigst muligt.",
            submitBtn: "Afsend besked",
            name: "Navn",
            email: "E-mail",
            message: "Din Besked",
            success: "Din besked er blevet afsendt",
            error: "Din besked kunne ikke afsendes. Prøv igen senere."
        },
    },
    navigation: {
        langSelector:[
            {
                short: "en",
                long: "English"
            },
            {
                short: "de",
                long: "Deutsch"
            }
        ],
        links: [
            {
                name: "Projekter",
                path: "/projects"
            },
            {
                name: "Websites",
                items: [
                    {
                        name: "devhelp.dk",
                        path: "https://www.devhelp.dk"
                    },
                    {
                        name: "Intastellar Solutions, International",
                        path: "https://www.intastellarsolutions.com"
                    },
                    {
                        name: "Intastellar Consents Solutions",
                        path: "https://www.intastellarconsents.com"
                    }
                ],
                type: "dropdown"
            }
        ]
    }
}