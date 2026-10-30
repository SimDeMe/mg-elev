# AGENTS.md – MG Intern

Denne fil beskriver formålet med projektet og de regler, som alle (mennesker og AI-agenter) skal følge, når de arbejder i repoet.

## Formål

**MG Intern** er en intern informations- og værktøjsside for **Middelfart Gymnasium**. Siden samler de ting, som både **lærere og elever** har brug for i hverdagen, ét sted:

- Skolens kalender (den eksisterende kalender, som pt. ligger på smbi.dk)
- Værktøjer, fx PDF-værktøjer (pt. på smbi.dk)
- Information om flerfaglige forløb (fx AT, SRO, SRP, DHO, SSO, NV, AP)
- Information om arrangementer som Operation Dagsværk, aktivitetsdag, introdage, fester mv.
- Praktisk information (eksamen, IT, studiemiljø, gode links)

Siden er **ikke** en erstatning for Lectio, Teams/Office 365 eller skolens officielle hjemmeside – den er et overblik, der linker videre.

I første omgang er siden en **demo til lokal visning** (fx for rektor). Den skal kunne åbnes direkte i en browser uden server, build-step eller login.

## Den vigtigste regel: Intet personfølsomt

Siden har **ingen login** og skal kunne ligge **fuldt offentligt** på internettet. Derfor gælder:

**Må IKKE stå på siden (eller i repoet):**

- Navne på elever – heller ikke i eksempler, billedtekster eller filnavne
- Navne, e-mails, telefonnumre eller billeder af enkeltpersoner (heller ikke lærere), medmindre det allerede er offentliggjort af skolen i en officiel funktion – og også her er udgangspunktet: brug funktionsadresser (fx "kontoret", "studievejledningen") i stedet for personer
- Klasselister, holdlister, skemaer med navne, karakterer, fravær, eksamensplaner med navne
- CPR-numre, adresser, helbreds-, sociale eller andre følsomme oplysninger
- Interne dokumenter, referater, personalesager eller noget, der er fortroligt
- Adgangskoder, API-nøgler, interne links med tokens, delingslinks til OneDrive/Teams med "alle med linket"
- Billeder, hvor personer kan genkendes

**Må gerne stå på siden:**

- Generel information om forløb, arrangementer, regler og procedurer
- Datoer og tidspunkter for skolens fælles begivenheder
- Links til offentlige værktøjer og til systemer, der selv kræver login (fx Lectio)
- Funktionsbaserede kontaktoplysninger (fx skolens hovednummer/kontoret)

Er du i tvivl, så **lad det være ude** og spørg en ansvarlig voksen på skolen.

## Teknisk opsætning

- Ren statisk HTML, CSS og vanilla JavaScript. Ingen frameworks, ingen build, ingen afhængigheder.
- Skal virke via `file://` (dobbeltklik på `index.html`). Derfor indlæses fælles header/footer via JavaScript-strenge i `assets/site.js` – ikke via `fetch`.
- Ingen cookies, ingen tracking, ingen analytics, ingen eksterne scripts eller fonte (siden skal kunne ligge offentligt uden cookiebanner).
- Eksterne links (smbi.dk, Lectio osv.) samles i `assets/config.js`, så de kan rettes ét sted.

### Struktur

```
index.html            Forside med genveje og overblik
sider/kalender.html   Skolens kalender (liste/måned, filter pr. hold, .ics)
sider/vaerktoejer.html PDF-værktøjer og andre værktøjer
sider/forloeb.html    Flerfaglige forløb
sider/arrangementer.html Operation Dagsværk, aktivitetsdag m.m.
sider/praktisk.html   Praktisk info, eksamen, IT, links
assets/style.css      Al styling (farver som CSS-variabler i :root)
assets/site.js        Fælles header, navigation, footer, søgning
assets/config.js      Alle eksterne URL'er
assets/kalender.js    Kalendervisning + "Kommende" på forsiden (data-kal-*)
assets/kalender-data.js GENERERET – kalenderens data fra smbi
tools/opdater-kalender.mjs Henter kalenderdata fra smbi.dk
```

### Kalenderen

Kalenderens kilde er `skolekalender/data.js` i repoet SimDeMe/smbi (smbi.dk). Den rettes **dér**, og hentes herover med:

```
node tools/opdater-kalender.mjs                      # fra smbi.dk
node tools/opdater-kalender.mjs ../smbi/skolekalender/data.js   # fra lokal kopi
```

`assets/kalender-data.js` må ikke rettes i hånden. Kalenderen må kun indeholde fælles begivenheder for hold, klasser og personale – aldrig navne på elever eller enkeltpersoner.

### Konventioner

- Sprog: dansk.
- Nye sider: kopiér en eksisterende side i `sider/`, behold `<div id="site-header">` og `<div id="site-footer">`, og tilføj siden til `NAV` i `assets/site.js`.
- Indhold, der ikke er bekræftet af skolen, markeres med klassen `udkast` / teksten "Udkast", indtil det er verificeret.
- Hold siden tilgængelig: semantisk HTML, alt-tekster, god kontrast, virker på mobil.
