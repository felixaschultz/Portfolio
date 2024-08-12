import cykelfaegen from "../statics/projects/cykelfaergen/screenshot-of-website.png";
/* import alsense from "../statics/projects/alsense/"; */
import gdprcookiebanner from "../statics/projects/gdprcookiebanner/screenshot-of-website.png";
import intastellarsolutions from "../statics/projects/intastellarsolutions/screenshot-of-website.png";
import intastellarConsentsLogin from "../statics/projects/intastellarconsents/screenshot-login.png";
import instastellarConsetnsDashboard from "../statics/projects/intastellarconsents/screenshot-dashboard.png";
import intastellarSignIn from "../statics/projects/intastellarsignin/Screenshot 2024-08-06 at 04.50.13.png";
import candidatedk from "../statics/projects/candidate-analytics/Screenshot 2024-05-23 at 22.47.40.png";
import dbStructrue from "./timetable/db-structure.png";

export const Projects = [
    {
        id: "cykelfaergen",
        name: "Cykelfærgen Flensborg Fjord",
        screenshot: cykelfaegen,
        highlight: false,
        description: {
            de: "",
            da: `
            <section class="content-ppad">
                <h2>Beskrivelse</h2>
                <p>I slutning af 2019 overtog jeg opgaven som webmaster hos cykelfærgen Flensborg fjord. Jeg besluttede mig at for udvikle den nye hjemmeside i PHP, det giver mig muligheden af at have filerne for de forskellige sprog dansk, tysk og engelsk.</p>
                <p>Designet skulle være moderne, responsive samt skabe mere </p>
            </section>
            <section>
                <p>Borgere på hhv Broagerland og på tysk side har de seneste 30 år skiftevis forsøgt at genoplive drømmen om færgesejlads på Flensborg Fjord, uden dog at kunne trænge helt igennem med deres projekt.</p>
            </section>
            <section class="content-ppad">
                <h2>Hvorfor valgte jeg PHP</h2>
                <p>Det gjorte jeg på baggrund af at jeg gerne ville have en dynamisk hjemmeside. Som kunne render indhold baserende på sprog valg og hvor jeg kunne inkludere andre filer som der kan have specific indhold.
                    Jeg ville også gerne have at hjemmesiden skulle kunne hente data fra en database, som jeg kunne opdatere og vedligeholde, sammentidligt skulle det indhold, som f.eks. deres sejlplan, Server-Side renderes for
                    SEO optimereing.
                </p>
            </section>
            <section class="content-ppad">
                <h2>Sejlplan Funktion</h2>
                <section>
                    <p>Det senest optimering som jeg fik udviklet på hjemmesiden, er et nyt design for sejlplanen. Jeg fik om struktueret databasen nyt for at kunne håndteren forskellige sejlplaner, både og havne.
                        <br>
                        Jeg fik også udviklet en ny funktion som gør det muligt at hente sejlplanen for en specifik rute, og vise den på hjemmesiden. Ved hentning af sejlplanen, laver jeg flere INNER JOINs på databasen, for at kunne hente alle de nødvendige informationer, så som færgen på ruten, ruten, gyldigheden af sejlplanen samt alle havne med ens tilsvarende afgang.   
                    </p>
<code class="code-editor">
<pre>
&lt;?php
    function Timetable($route){
        $title = "Sejlplan";
        $currentDate = date("Y-m-d");
        /* Getting the route & the stops */
        $sql = "SELECT 
            fs.route_id,
            fn.ferry_name,
            ferry_route.days,
            fs.departure_harbor, 
            fs.arrival_harbor,
            ferry_route.id AS ferryRouteId,
            ferry_route.active_from AS active_from,
            ferry_route.active_to AS active_to,
            ferry_route.name AS routeName,
            departure_harbor.name AS departure_harborName,
            arrival_harbor.name AS arrival_harborName,
            fs.id AS fs_id,
            GROUP_CONCAT(fs.departure_time ORDER BY fs.departure_time SEPARATOR ', ') AS departure_times,
            GROUP_CONCAT(fs.arrival_time ORDER BY fs.arrival_time SEPARATOR ', ') AS arrival_times,
            GROUP_CONCAT(route_active_date.active_from ORDER BY route_active_date.active_from SEPARATOR ', ') AS active_date_from,
            GROUP_CONCAT(route_active_date.active_to ORDER BY route_active_date.active_to SEPARATOR ', ') AS active_date_to,
            price.price_dkk AS price_dkk,
            price.price_euro AS price_euro
        FROM 
            timetable fs
        INNER JOIN
            routes ferry_route ON fs.route_id = ferry_route.id
        INNER JOIN
            ferries fn ON ferry_route.ferry = fn.id
        INNER JOIN
            harbor departure_harbor ON (fs.departure_harbor = departure_harbor.id)
        INNER JOIN
            harbor arrival_harbor ON (fs.arrival_harbor = arrival_harbor.id)
        INNER JOIN 
            route_active_date ON ferry_route.id = route_active_date.route_id
        INNER JOIN
            ticket_prices price ON ferry_route.id = price.route_id
        WHERE
            ferry_route.display_to >= '$currentDate'
        AND
            ferry_route.display_from <= '$currentDate'
        AND
            ferry_route.name = '$route'
        OR
            ferry_route.id = '$route'
        AND
            ferry_route.display_to >= '$currentDate'
        AND
            ferry_route.display_from <= '$currentDate'
        GROUP BY
            fs.departure_harbor, 
            fs.arrival_harbor
        ORDER BY
            departure_times,
            departure_harborName
        DESC";
        ...
        echo '
        &lt;section&gt;
            &lt;h2 class="timetable-heading"&gt;'.$title.'&lt;/h2&gt;
        &lt;/section&gt;
        ';

    }
?&gt;
</pre>
</code>
                </section>
                <h3>ER-Diagram til Sejlplanen</h3>
                <img src='${dbStructrue}' />
                <h3>Forbedring til SQL selction</h3>
                <p>For at forbedre koden og SQL selction af en rute kunne jeg lave et view i databasen og lave en SELECT på dette view.</p>
            </section>
            <section class="content-ppad">
                <h2>Database Struktur</h2>
                <p>
                    Strukturen på databasen er sådan at jeg har en tabel for havne, en tabel for sejlplanen og en tabel for ruter. Med denne struktur kan jeg nemt og hurtigt tilføje nye sejlplaner og havne.
                    Sejlplanen tabellen indeholder alle afgange og ankomster for alle ruter, ruten kollonden har en foreign key som peger på havne tabellen´s.
                </p>
            </section>
            <section class="content-ppad">
                <h2>Reklame video</h2>
                <p>Jeg fik produceret en lille reklamevideo for cykelfærgen. Med denne klip er intentionen at bygge og skabe mere opmærksomhed.</p>
                <video src="https://www.cykelfaergen.info/assets/vid/cykelfaergen-reklame.mp4" />
            </section>
            `,
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
        technology: "HTML, CSS, JS, PHP, MySQL",
    },
    {
        id: "instastellarsignin",
        name: "'Sign in with Intastellar' - authenticator",
        screenshot: intastellarSignIn,
        highlight: true,
        description: {
            de: "",
            da: `
            <section class="content-ppad">
                <h2>Beskrivelse</h2>
                <p>Med Intastellar Signin authentication har jeg udviklet en auth service for en af mine hjemmesider,
                    intastellaracconts.com som holder styr af alt hvad authentication angår.
                    Men hvorfor har jeg valgt at udvikle min egen authentication service, når der findes mange andre derude?
                </p>
                <p>Det startede tilbage i 2018 da jeg havde 2-3 forskellige hjemmesider, og hvor jeg meget gerne vil bruge en authentication løsning samt 1 konto till alle domæner.
                    Derfor begyndte jeg at udvikle min egen authentication service som i første omgang var simple og kun kunne bruges på en hjemmeside. Dog hurtigt var jeg interessert i hvordan "Sign in with Google" fungerede og hvordan jeg kunne bruge det samme princip for mig selv.
                </p>
                <p>Jeg fandt ret hurtigt ud af at de benyttede sig postMessage metoden for at dele informationer cross-domain. Derfor begyndte jeg hurtigt i, at sætte mig ind i hvordan det fungerede og hvordan jeg kan benytte det.</p>
            </section>
            <section class="content-ppad">
                <h2>PostMessage</h2>
                <p>PostMessage er en metode som gør det muligt at sende beskeder mellem vinduer/frames på tværs af domæner. Metoden er en del af HTML5 og er en sikker metode for at kommunikere mellem forskellige domæner.</p>
                <p>Metoden er bygget op af 2 parametre, en besked og en targetOrigin. Beskeden er den data som du gerne vil sende, og targetOrigin er den URL som du gerne vil sende beskeden til.</p>
            </section>
            <section class="content-ppad">
                <h2>JWT</h2>
                <p>Når en bruger logger sig ind på <a href="https://www.intastellaraccounts" target="_blank">intastellaraccounts.com</a>, med deres email og passkey, og han bliver verificeret uden problemer, bliver der generet en JWT.</p>
                <p>JWT består af en header som indholder hvem er udstederen, med både navn og url. I body indholder den 2 informationer fra brugeren som er logget ind
                    <ol>
                        <li>Brugerens ID</li>
                        <li>Brugerens email</li>
                        <li>Scope</li>
                    </ol>
                    Denne token bliver sendt ned til parent vinduet, hvor den bliver gemt og benyttet af scriptet for at sende den vider til verificering, inden hjemmesiden for adgang til brugerens data.
                </p>
                <h3>Genereing af JWT Token (Server-Side)</h3>
                <code class="code-editor">
<pre>
$publichash = array(
	"issuer" => "Intastellar Account",
	"issuer_url" => "https://apis.intastellaraccounts.com",
	"exp" => time() + 83400 * 360,
);

$data = array(
	"user_id" => $newsalt['salt'],
	"email" => $newsalt["email"],
	"allowed_scope" => $_GET["scope"]
);

$headers = array(
	"iss" => "Intastellar Account",
	"iss_domain" => "apis.intastellaraccounts.com",
	"exp" => time() + 83400 * 360,
);

$headers = json_encode($headers);
$data = json_encode($data);

$signing_key = "{en hemmelig nøgle}";
$signiture = hash_hmac("sha256", base64_encode($headers) . "." . base64_encode($data), $signing_key, true);
$token = base64_encode($headers) . "." . base64_encode($data) . "." . base64_encode($signiture);

$jwt = base64_encode($token);
</pre>
                </code>
                <h3>Send token til parent (Client-Side)</h3>
                <code class="code-editor">
<pre>
window.addEventListener("DOMContentLoaded", function() {
    const JWT = "[Genereret JWT]";
    window.opener.postMessage(JWT, "*");
    window.addEventListener("message", function(e) {
        if (e.data == "iframe-token-recieved") {
            window.parent.close();
        }
    })
});
</pre>
                </code>
            </section>
            <section class="content-ppad">
                <h2>Verifikation</h2>
                <p>Token bliver sendt via Authentication header til verificerings server, hvor den bliver decoded og verificeret.</p>
                <p>Under verificering bliver der checket om token er for gamlet (maks 30 min.) og om issueren er den korrekte samt om signaturen er korrekt.</p>
                <p>Client-Side Verificering & udførelsen af bruger defineret funktion fra data- attributten.</p>
                <code class="code-editor">
<pre>
fetch("https://apis.intastellaraccounts.com/verify", {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    }
}).then(e => e.json()).then(e => {
    if (e.statusCode == 200) {
        const { phone, birthday } = e.account.user[0];
        e.account.user.phone = phone;
        e.account.user.birthday = birthday;
        delete e.account.user[0];
        fn(e.account);
    } else {
        throw new IntastellarSolutionsSDKError(e.error);
    }
})

</pre>
                </code>
                <p>Client-Side Verificering & vidersendelse til hjemmesiden med brugerens information</p>
                <code class="code-editor">
<pre>
fetch("https://apis.intastellaraccounts.com/verify", {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    }
}).then(e => e.json()).then(e => {
    if (e.statusCode == 200) {
        const { phone, birthday } = e.account.user[0];
        e.account.user.phone = phone;
        e.account.user.birthday = birthday;
        delete e.account.user[0];
        throw new IntastellarSolutionsSDKSuccess("We´ve successfully send user data for: " + t.name);
        if (window.location.href.indexOf("?") > -1) {
            const query = "?" + window.location.href.split("?")[1];
            // Add the query string to the url
            window.location.href = window.location.protocol + "//" + document.querySelector("[data-login_uri]").getAttribute("data-login_uri") + query + "&token=" + JSON.stringify(t);
        } else {
            window.location.href = window.location.protocol + "//" + document.querySelector("[data-login_uri]").getAttribute("data-login_uri") + "?token=" + JSON.stringify(t);
        }
    } else {
        throw new IntastellarSolutionsSDKError(e.error);
    }
})

</pre>
                </code>
                <p>Server-Side verificering</p>
                <code class="code-editor">
<pre>
// Check if the token is valid
$issuer = "Intastellar Account";
$issuer_url = "apis.intastellaraccounts.com";

// Check if the origin is a domain & not an IP like 127.0.0.1 and remove the subdomain
// Remove the subdomain if its not a ip address
$access_id = $_SERVER['HTTP_ORIGIN'];

$tokenFromHeader = $_SERVER['HTTP_AUTHORIZATION'];
if (empty($tokenFromHeader)) {
    http_response_code(401);
    echo json_encode([
        "account" => null,
        "error" => "No token provided",
        "statusCode" => 401,
        "status" => "Unauthorized"
    ]);
    exit();
}

// Decode the token & remove the Bearer
$tokenFromHeader = str_replace("Bearer ", "", $tokenFromHeader);
$encodedToken = base64_decode($tokenFromHeader);
$splitToken = explode(".", $encodedToken);

$header = $splitToken[0];
$payload = $splitToken[1];
$signature = $splitToken[2];

// Check if the signature is valid
$hash = hash_hmac("sha256", $header . '.' . $payload, "intastellaraccounts.com", true);
$hash = base64_encode($hash);

if ($hash != $signature) {
    http_response_code(401);
    echo json_encode([
        "error" => "Invalid token",
        "statusCode" => 401,
        "status" => "Unauthorized"
    ]);
    exit();
}

$header = json_decode(base64_decode($splitToken[0]), true);
$payload = json_decode(base64_decode($splitToken[1]), true);

$expires = $header["exp"];
$iss = $header["iss"];
$iss_url = $header["iss_domain"];

if ($expires < time()) {
    http_response_code(401);
    echo json_encode([
        "account" => null,
        "error" => "Token expired",
        "statusCode" => 401,
        "status" => "Unauthorized"
    ]);
    exit();
}

// Remove the subdomain if its not a ip address
if ($access_id != "localhost" && !filter_var($access_id, FILTER_VALIDATE_IP)) {
    $access_id = preg_replace('/^(?:https?:\/\/)?(?:www\.)?/i', '', $access_id);
}

if ($iss == $issuer && $iss_url == $issuer_url) {
    $salt = $payload["user_id"];
    $email = $payload["email"];
    $scopeFromToken = $payload["allowed_scope"];

    // Getting the user from the database and sending it back to the client
    $publichash = array(
        "account_domain" => "my.intastellaraccounts.com",
        "account_id" => (int)$newsalt["id"],
        "account_url" => "https://my.intastellaraccounts.com",
        "scope" => $scopeFromToken,
        "user" => [
            "user_id" => $newsalt['salt'],
            "name" => ["firstName" => $newsalt["first_name"], "lastName" => $newsalt["last_name"]],
            "username" => $newsalt["username"],
            "email" => $newsalt["email"],
            "lanuage" => $newsalt["language"],
            $scope,
            "avatar" => "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/" . $image,
            "cover" => "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/" . $cover
        ]
    );

    http_response_code(200);
    echo json_encode([
        "account" => $publichash,
        "error" => null,
        "statusCode" => 200,
        "status" => "OK"
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        "account" => null,
        "error" => "Invalid token",
        "statusCode" => 401,
        "status" => "Unauthorized"
    ]);
}
</pre>
                </code>
            </section>
                `,
            en: ""
        },
        short_description: {
            de: "",
            da: "Jeg har udviklet en egen authentication løsning, som kan implementeres på forskellige domæner. Løsningen er udviklet i PHP og MySQL.",
            en: ""
        },
        github: "https://github.com/Intastellar-Solutions-International/intastellar-signin",
        url: "https://www.intastellaraccounts.com",
        type: "Web development",
        technology: "JS, MySQL, PHP"
    },
    {
        id: "gdpr-cookiebanner",
        name: "GDPR Cookiebanner",
        screenshot: gdprcookiebanner,
        description: {
            de: "",
            da: `<section class="content-ppad">
                    <p>Med GDPR blev det et krav at alle hjemmesider skulle have en Cookie Consent. Jeg fik muligheden at udvikle en Cookie Consent til min egen hjemmeside, som jeg sidenhen har udviklet til en digital platform.</p>
                    
                </section>
                <section class="content-ppad">
                    <h2>Banner funktionalitet</h2>
                    <p>Cookie banners funktionalitet bliv udviklet i plain JS, med Custom HTML tags. Kerne funktion er at banneret ud fra en lang liste blockere alle 3-parts scripts (cookies), såsom Google Analytics etc.</p>
                    <p>Scriptet går hele DOM-Træet igennem og scanner for scripts som matcher listen af black listed scripts. Så snart den finder script tags som indeholder "injection" scripts som f.eks.</p>
    <code class="code-editor">
        <pre>
            &lt;script&gt;
                (function(){
                    var s = document.createElement("script");
                    s.type = "text/javascript";
                    s.async = true;
                    s.src = "https://connect.facebook.com/events.js";
                    var x = document.getElementsByTagName("script")[0];
                    x.parentNode.insertBefore(s, x);
                })()
            &lt;/script&gt;
        </pre>
    </code>
                    <p>For at kunne scanne hjemmesiden for ændringer som der sker på siden under loading, benytter jeg mig af "MutationObserver". MutationObserver kigger på ændringer som sker i DOM-træet. Udfra denne information og de forgivet Regex og script blocker
                    cookie banneren alle scripts med, type="text/plain" hvorefter de scripts bliver fjernet fra DOM-træet.</p>
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
        technology: "JS"
    },
    {
        id: "intastellar-consents-platform",
        name: "Intastellar Consents Platform",
        screenshot: intastellarConsentsLogin,
        highlight: true,
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
        type: "SaaS - Solutions",
        technology: "ReactJS, MySQL"
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
        id: "danfoss-insite",
        name: "Danfoss Alsense Insite",
        screenshot: null,
        description: {
            de: "",
            da: `
            <section class="content-ppad">
                <h2>Projektbeskrivelse</h2>
                <p>Under min uddannelse som Multimediedesigner var jeg heldig at kunne være en del af Danfoss, samt skive min hovedopgave sammen med dem.</p>
                <p>Jeg vælgte at går ind i at kode en af deres løsninger som Danfoss på den tid har udviklet på. Jeg fik udviklet løsning i ReactJS, som til dato var skrevet i AnagularJS. Jeg fik valgt ReactJS pga. at løsningen skulle på et tidspunkt sammles og integres i Danfoss Alsense.</p>
                <p>Alsense er udviklet i ReactJS, så gav det for mig god mening at udvikle platformen, med det nye design i ReactJS.</p>
            </section>
            <section class="content-ppad">
                <h2>Design</h2>
            </section>
            `,
            en: ""
        },
        short_description: {
            de: "",
            da: `Som min Hovedopgave fik jeg muligheden at skrive den sammen med Danfoss Climate Solutions. Jeg valgte opgaven at Redesigne og ny udvikle deres digitale platform Alsense InSite. Jeg udviklede det nye design i ReactJS.`,
            en: ""
        },
        github: null,
        url: "https://www.danfoss.com/en/products/dcs/monitoring-and-services/alsense-insite/",
        type: "SaaS Solutions",
        technology: "ReactJS"
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
    },
    {
        id: "just-drink",
        name: "Just Drink",
        screenshot: null,
        description: {
            de: "",
            da: "Under mit Studie som Mutlimediedesigner, fik jeg muligheden at udvikle en Webapp for en fiktiv kunde. Jeg valgte at udvikle en Webapp for en fiktiv kunde som sku.",
            en: ""
        },
        short_description: {
            de: "",
            da: "Under mit Studie som Mutlimediedesigner, fik jeg muligheden at udvikle en Webapp for en fiktiv kunde. Jeg valgte at udvikle en Webapp for en fiktiv kunde som skule have en App hvor med man kan bestille drikkevarer til ens fest. Ala Just Eat,",
            en: ""
        },
        github: "https://github.com/felixaschultz/Just-Drink",
        url: null,
        type: "Web Development",
        technology: "HTML, CSS, JS"
    },
    {
        id: "cykelfaergen-api",
        name: "Cykelfærgen Sejlplan API & Konfigurator",
        screenshot: null,
        description: {
            de: `
            <section class="content-ppad">
                <h2>Projektübersicht</h2>
                <p>
                    Ich habe eine API für die Cykelfærgen Flensborg Fjord entwickelt, die es ermöglicht, den Fahrplan von ihrer Website abzurufen.
                    Die API ist in PHP geschrieben und verwendet MySQL als Datenbank. Sie ist darauf ausgelegt, die Fahrpläne für bestimmte Routen abzurufen.
                </p>
            </section>
            
            <section class="content-ppad">
                <h2>Konfigurator für Fahrpläne</h2>
                <p>
                    Ein Konfigurator wurde entwickelt, um Partnern von Cykelfærgen und anderen Website-Besitzern zu helfen, ihren Fahrplan in ihre eigenen Websites zu integrieren.
                </p>
            </section>
            
            <section class="content-ppad">
                <h2>Plattformfunktionen</h2>
                <p>
                    Die Plattform ist in PHP und MySQL entwickelt und bietet Benutzern die Möglichkeit, zwischen verschiedenen Fahrplänen zu wählen.
                    Man kann wählen, alle Fahrpläne anzuzeigen oder nur einen einzelnen Fahrplan.
                </p>
                <p>
                    Benutzer können die Fahrpläne anpassen, indem sie ihre Markenfarben auswählen, und sie können verschiedenen Domänennamen Fahrplänen zuordnen.
                    Es gibt auch Unterstützung für drei Sprachen: Dänisch, Deutsch und Englisch.
                </p>
            </section>
            
            <section class="content-ppad">
                <h2>Implementierung von Fahrplänen</h2>
                <p>
                    Um den Fahrplan auf der eigenen Website anzuzeigen, arbeite ich mit XMLHttpRequest() zum Abrufen von Daten.
                    In diesem HTTP-Request sende ich einen API-Schlüssel, der die erforderlichen Informationen aus der Datenbank abruft.
                    Gleichzeitig wird überprüft, ob die Domain der Website genehmigt ist, und wenn ja, wird auch überprüft, ob sie mit einer bestimmten Sprache verknüpft ist.
                </p>
                <p>
                    Nachdem alle diese Überprüfungen durchgeführt wurden, wird der Fahrplan generiert und an den Clienten zurückgesendet, wo er dem HTML-Container hinzugefügt wird, wie zuvor angegeben.
                </p>
            </section>        
            `,
            da: `
            <section class="content-ppad">
                <h2>Project Overview</h2>
                <p>
                    Jeg har udviklet en API til Cykelfærgen Flensborg Fjord, som gør det muligt at hente sejlplanen fra deres hjemmeside.
                    API'en er kodet i PHP og benytter MySQL som database. Den er designet til at hente sejlplanerne for specifikke ruter.
                </p>
            </section>
        
            <section class="content-ppad">
                <h2>Konfigurator for Sejlplaner</h2>
                <p>
                    En konfigurator er udviklet for at hjælpe Cykelfærgens partnere og andre hjemmesideejere med at integrere deres sejlplan på deres egne hjemmesider.
                </p>
            </section>
        
            <section class="content-ppad">
                <h2>Platformfunktionaliteter</h2>
                <p>
                    Platformen er udviklet i PHP og MySQL og giver brugerne mulighed for at vælge mellem forskellige sejlplaner.
                    Man kan vælge at vise alle sejlplaner eller kun en enkelt sejlplan.
                </p>
                <p>
                    Brugere kan tilpasse sejlplanerne ved at vælge deres brandfarver, og de kan tilknytte forskellige domænenavne til sejlplanerne.
                    Der er også understøttelse af tre sprog: dansk, tysk og engelsk.
                </p>
            </section>
        
            <section class="content-ppad">
                <h2>Implementering af Sejlplaner</h2>
                <p>
                    For at vise sejlplanen på ens hjemmeside arbejder jeg med XMLHttpRequest() til at hente data.
                    I denne HTTP-anmodning sender jeg en API-nøgle, der henter de nødvendige oplysninger fra databasen.
                    Samtidig kontrolleres det, om hjemmesidens domænenavn er godkendt, og hvis det er tilfældet, tjekkes det også, om det er knyttet til et bestemt sprog.
                </p>
                <p>
                    Når alle disse kontroller er gennemført, genereres sejlplanen og sendes tilbage til klienten, hvor den tilføjes HTML-containeren, som blev angivet.
                </p>
            </section>
            `,
            en: `
            <section class="content-ppad">
                <h2>Project Overview</h2>
                <p>
                    I have developed an API for Cykelfærgen Flensborg Fjord that allows retrieving the schedule from their website.
                    The API is coded in PHP and uses MySQL as a database. It is designed to fetch schedules for specific routes.
                </p>
            </section>
            
            <section class="content-ppad">
                <h2>Schedule Configurator</h2>
                <p>
                    A configurator has been developed to assist Cykelfærgen's partners and other website owners in integrating their schedule into their own websites.
                </p>
            </section>
            
            <section class="content-ppad">
                <h2>Platform Features</h2>
                <p>
                    The platform is developed in PHP and MySQL, providing users with the option to choose between different schedules.
                    Users can choose to display all schedules or only a single schedule.
                </p>
                <p>
                    Users have the option to customize schedules by selecting their brand colors, and they can associate different domain names with schedules.
                    There is also support for three languages: Danish, German, and English.
                </p>
            </section>
            
            <section class="content-ppad">
                <h2>Implementation of Schedules</h2>
                <p>
                    To display the schedule on a website, I use XMLHttpRequest() to fetch data.
                    In this HTTP request, I send an API key that retrieves the necessary information from the database.
                    Simultaneously, it checks if the website's domain name is approved, and if so, it also checks if it is associated with a specific language.
                </p>
                <p>
                    After all these checks are completed, the schedule is generated and sent back to the client, where it is added to the HTML container as specified.
                </p>
            </section>        
            `
        },
        short_description: {
            de: "",
            da: "",
            en: ""
        },
        github: null,
        url: "https://developers.cykelfaergen.info/timetable/js",
        type: "FE Development",
        technology: "JS"
    },
    {
        id: "balticfinance-uploadformular",
        name: "Baltic Finance Uploadformular",
        screenshot: null,
        description: {
            de: "",
            da: `
                <section class="content-ppad">
                    <p>Jeg havde muligheden at udvikle en uploadformular for balticfinance, som skulle kunne håndtere upload af filer og sende dem videre til balticfinance.</p>
                    <p>Jeg fik fra virksomheden opstillet nogle krav som formularet skulle kunne. Kravne var:</p>
                    <ul>
                        <li>Upload af filer</li>
                        <li>Skulle kunne validere skadenummer i rigtige format</li>
                        <li>Skulle kunne validere om filerne var i rigtige format (*.jpg, *.jpeg, *.png, *.pdf, *.gif, *.zip, *.webp)</li>
                        <li>Uploaded skulle først ske når skadenummeret er i rigtig format</li>
                        <li>Send filerne videre til balticfinance</li>
                        <li>Send en bekræftelse til brugeren</li>
                        <li>Upload en kopi til nextcloud</li>
                    </ul>
                </section>
                <section class="content-ppad">
                    <h2>Formularen</h2>
                    <p>Formularen blev udviklet i PHP og HTML, hvor jeg benyttede mig af PHP til at validere og håndtere upload af filer. I projekt beskrivelsen fik jeg udover kravne også et design som jeg tog udgangspunktet i.</p>
                    <p>Jeg fik started med at bygge selve formularet i HTML & CSS, da det var noget der tog kortest tid for mig at bygge. Derefter bygyndte jeg på selve upload funktionalitet.</p>
                </section>
                <section class="content-ppad">
                    <h3>Upload funktion</h3>
                    <p>Upload funktionen blev udviklet i PHP, hvor jeg benyttede mig af PHP´s indbygget funktioner til at håndtere upload af filer. PHP´s indbygget funktioner er:</p>
                    <ul>
                        <li>move_uploaded_file()</li>
                        <li>$_FILES</li>
                        <li>$_POST</li>
                    </ul>
                    <p>Der blev implementeret nogle checks for at være sikker på at være sikker på at filerne og brugeren som uploader dokumenterne, er en kunde af balticfinance.</p>
                    <code class="code-editor">
<pre>
&lt;?php
    // Check om requesten kom fra en POST request og formularet
    if(!isset($_POST["verify_key"]) || !isset($_SESSION["verify_key"]) || $_SESSION["verify_key"] != $_POST["verify_key"]){
        header("HTTP/1.1 401 Verificerings kode stemmer ikke overens!<br>Session: ".$_SESSION["verify_key"]."<br>Verify: ".$_POST["verify_key"]);
        die();
    }
    // Check om Password matcher
    if(!in_array($_POST["password"], $_ENV["PASSWORD"])){
        header("HTTP/1.1 401 Forkert kodeord! ".$_POST["password"]);
        die();
    }

    for($i=0;$i<count($_FILES['file']['name']);$i++) {
        $file_name = $_FILES['file']['name'][$i];
        $file_size =$_FILES['file']['size'][$i];
        $file_tmp =$_FILES['file']['tmp_name'][$i];
        $file_type=$_FILES['file']['type'][$i];   
        $file_ext = pathinfo($file_name, PATHINFO_EXTENSION);
        array_push($data, $file_name);

        if(in_array($file_ext,$allowed_types)=== false){
            header("HTTP/1.1 415 Filtype er ikke tilladt. Vælg venligst mellem: JPEG, PNG, PDF, ZIP, GIF eller WEBP fil");
        }

        if($file_size > 15000000){
            header("HTTP/1.1 403 En eller flere filer er for stort. Maks 15MB");
        }

        
    }

    if(empty($errors)){
        $folder_name = date("dmY", time()) . "_" . date("H:i", time()) . "_" . $calim_no . "/";
        if (!file_exists($folder_name) && $allowed) {
            mkdir($folder_name, 0777, true);

            $json_array = array (
                "claim_no" => $calim_no,
                "file" => $_FILES['file']['name'],
                "name" => $_POST["name"],
                "email" => $_POST["email"],
                "phone" => $_POST["phone"],
                "who_are_you" => $_POST["who_are_you"],
                "message" => $_POST["message"]
            );

            $json = json_encode($json_array);
            file_put_contents($folder_name . "/details.json", $json);
</pre>

                    </code>
                    <p>Der laves en details.json fil i en mappe med et case nummer, dato, og tid som indholder</p>
                    <ul>
                        <li>Navn</li>
                        <li>Email</li>
                        <li>Case Nummer</li>
                        <li>Telefon nummer</li>
                        <li>Meddelse</li>
                        <li>Indsender</li>
                    </ul>
                    <code class="code-editor">
<pre>
    if(empty($errors)){
        $folder_name = date("dmY", time()) . "_" . date("H:i", time()) . "_" . $calim_no . "/";
        if (!file_exists($folder_name) && $allowed) {
            mkdir($folder_name, 0777, true);

            $json_array = array (
                "claim_no" => $calim_no,
                "file" => $_FILES['file']['name'],
                "name" => $_POST["name"],
                "email" => $_POST["email"],
                "phone" => $_POST["phone"],
                "who_are_you" => $_POST["who_are_you"],
                "message" => $_POST["message"]
            );

            $json = json_encode($json_array);
            file_put_contents($folder_name . "/details.json", $json);

            echo count($_FILES['file']['name']);
            echo $_FILES['file']['name'];

            for($i=0;$i$lt;count($_FILES['file']['name']);$i++) {
                echo "hej";
                $file_name = $_FILES['file']['name'][$i];
                $file_size =$_FILES['file']['size'][$i];
                $file_tmp =$_FILES['file']['tmp_name'][$i];
                $file_type=$_FILES['file']['type'][$i];   
                $movedFiles = move_uploaded_file($file_tmp,$folder_name.$file_name);
            }
        }else{
            $errors[] = "Something went wrong with creating the folder: " . $folder_name;
        }
    }else{
        echo "Hej";
        print_r($errors);
    }
</pre>
                    </code>
                    <p>Disse informationer bliver sammentidligt også sendt til nextcloud som et backup. For at kunne sende og uploade alt til nextcloud benytter jeg mig af cURL.</p>
                    <p></p>
                    <code class="code-editor">
<pre>
if($movedFiles){
    $ch = curl_init($webDAVurl . '/' . $folder_name);
    curl_setopt($ch, CURLOPT_USERPWD, $webDAVuser . ':' . $webDAVpassword);
    curl_setopt($ch,CURLOPT_HTTPHEADER, array('Authorization: Basic '. base64_encode($webDAVuser . ':' . $webDAVpassword)));
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'MKCOL');
    curl_exec($ch);
    
    $dir = scandir($folder_name);
    foreach($dir as $file){
        if(is_file($folder_name.$file)){

            $file_path = $folder_name . $file;
            $url = $webDAVurl . $folder_name . str_replace(" ", "-", $file);
            $username = $webDAVuser;
            $password = $webDAVpassword;

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_USERPWD, $webDAVuser . ':' . $webDAVpassword);
            curl_setopt($ch,CURLOPT_HTTPHEADER, array('Authorization: Basic '. base64_encode($webDAVuser . ':' . $webDAVpassword)));
            curl_setopt($ch, CURLOPT_UPLOAD, true);
            curl_setopt($ch, CURLOPT_PUT, true);
            curl_setopt($ch, CURLOPT_INFILE, fopen($file_path, 'rb'));
            curl_setopt($ch, CURLOPT_INFILESIZE, filesize($file_path));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
            $response = curl_exec($ch);
            
            if (curl_errno($ch)) {
                curl_setopt($curl, CURLOPT_VERBOSE, true);
                curl_setopt($curl, CURLOPT_STDERR, fopen('php://stderr', 'w'));
                header("HTTP/1.1 401 Something went wrong with uploading your files.");
            }

            curl_close($ch);
        }
   
</pre>
                    </code>
                </section>
            `,
            en: ""
        },
        short_description: {
            de: "",
            da: "",
            en: ""
        },
        github: null,
        url: "https://customerupload.balticfinance.com",
        type: "Web Development",
        technology: "HTML, CSS, JS, PHP"
    },
    {
        id: "analytics-candidatedk",
        name: "Analytics for Candidate.dk",
        screenshot: candidatedk,
        highlight: true,
        short_description: {
            de: "",
            da: `Under min uddannelse hos EAAA har jeg arbejde på deres digitale platform candidate.dk, hvor deres studerene fra uddannelser, Multimedieuddannelse, PBA i Digital Concept Udvikling og PBA i Webudvikling.
                Jeg fik udviklet en tracking script som trackede daily active users, logged in users. device, screen size, browser, screensize, user acquisition og user languages.
                `,
            en: ""
        },
        description: {
            de: "",
            da: `
                <section class="content-ppad">
                    <p>Jeg sad primært på at viderudvikle og bug fixing admin dashboard. Der blev implementeret Analytics data, via egen udviklet tracking script. Der trackes daily active users, logged in users. device, screen size, browser, screensize, user acquisition og user languages.</p>
                    <p></p>
                </section>
                `,
            en: ""
        },
        github: null,
        url: "https://candidate.dk",
        type: "Web Development",
        technology: "MongoDB, RemixJS",
    }
    /* {
        id: "event-planer",
        name: "Event Planner",
        screenshot: null,
        short_description: {
            de: "",
            da: "",
            en: ""
        },
        description: {
            de: "",
            da: `
    < section class="content-ppad" >
                    <h2>Beskrivelse</h2>
                    <p>Som mit 2 Semester eksamensprojekt på Professionsbachelor i Webudvikling var opgaven at udvikle en Webapp hvor man kan planlægge et event.</p>
                    <p></p>
                </ >
    `
        },
        github: "https://github.com/felixaschultz/eventplaner",
        url: "https://event.inta.dev",
        type: "Web Development",
        technology: "Remix, ReactJS, MongoDB, Tailwind"
    } */
]