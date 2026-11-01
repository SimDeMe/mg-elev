// Fælles header, navigation, footer og søgning.
// Indsættes via JavaScript (ikke fetch), så siden også virker via file://.
(function () {
  var root = document.body.getAttribute("data-root") || "";
  var cfg = window.MG_CONFIG || { links: {} };

  var NAV = [
    { id: "forside", titel: "Forside", href: "index.html" },
    { id: "kalender", titel: "Kalender", href: "sider/kalender.html" },
    { id: "vaerktoejer", titel: "Værktøjer", href: "sider/vaerktoejer.html" },
    { id: "forloeb", titel: "Flerfaglige forløb", href: "sider/forloeb.html" },
    { id: "arrangementer", titel: "Arrangementer", href: "sider/arrangementer.html" },
    { id: "praktisk", titel: "Praktisk info", href: "sider/praktisk.html" }
  ];

  // Søgeindeks: titel, sti og nøgleord. Udvid når der kommer nyt indhold.
  var SOEG = [
    { t: "Skolens kalender", h: "sider/kalender.html", k: "kalender datoer begivenheder ferie prøver eksamen studietur ics outlook 1g 2g 3g hf" },
    { t: "PDF-værktøjer", h: "sider/vaerktoejer.html#pdf", k: "pdf beskær del dobbeltsider ocr søgbar scan værksted" },
    { t: "Andre værktøjer", h: "sider/vaerktoejer.html#andre", k: "timer gruppe generator tilfældig lectio office" },
    { t: "Bordgruppe-generator", h: "vaerktoejer/bordgrupper/index.html", k: "bordgrupper grupper par bordplan lokale klasse lærer" },
    { t: "Vurder klassens normer", h: "vaerktoejer/normer/index.html", k: "normer ordensregler studieregler klasse vurdering lærer" },
    { t: "Eksamensbelastning", h: "vaerktoejer/eksamensbelastning/index.html", k: "eksamen censur årsprøve srp dho sro timer opgavefordeling lærer" },
    { t: "Turnering", h: "vaerktoejer/turnering/index.html", k: "turnering skak schweizer spil runder" },
    { t: "Rejsekasse", h: "vaerktoejer/rejsekasse/index.html", k: "rejsekasse studietur regnskab forskud udlæg kontanter valuta" },
    { t: "AT – Almen studieforberedelse", h: "sider/forloeb.html#at", k: "at almen studieforberedelse stx synopsis" },
    { t: "SRO / SRP", h: "sider/forloeb.html#srp", k: "sro srp studieretningsopgave studieretningsprojekt opgave vejleder" },
    { t: "DHO / SSO (HF)", h: "sider/forloeb.html#hf", k: "dho sso hf dansk historieopgave større skriftlig opgave" },
    { t: "NV og AP", h: "sider/forloeb.html#gf", k: "nv naturvidenskab ap almen sprogforståelse grundforløb 1g" },
    { t: "Operation Dagsværk", h: "sider/arrangementer.html#od", k: "operation dagsværk od arbejde indsamling" },
    { t: "Aktivitetsdag", h: "sider/arrangementer.html#aktivitet", k: "aktivitetsdag idræt sport motion" },
    { t: "Introdage og introtur", h: "sider/arrangementer.html#intro", k: "intro introtur 1g ny elev" },
    { t: "Fester og fællesarrangementer", h: "sider/arrangementer.html#fest", k: "fest gallafest julefrokost morgensang fællessamling" },
    { t: "Studieture og ekskursioner", h: "sider/arrangementer.html#studietur", k: "studietur ekskursion rejse" },
    { t: "Eksamen", h: "sider/praktisk.html#eksamen", k: "eksamen prøve snyd plagiat sygdom regler" },
    { t: "IT og printning", h: "sider/praktisk.html#it", k: "it wifi printer print lectio office teams kode" },
    { t: "Fravær og sygdom", h: "sider/praktisk.html#fravaer", k: "fravær sygdom syg melde" },
    { t: "Hjælp og vejledning", h: "sider/praktisk.html#hjaelp", k: "studievejledning hjælp trivsel lektiecafe vejledning" }
  ];

  var aktiv = document.body.getAttribute("data-side");

  function navHtml() {
    return NAV.map(function (n) {
      var cur = n.id === aktiv ? ' aria-current="page"' : "";
      return '<li><a href="' + root + n.href + '"' + cur + ">" + n.titel + "</a></li>";
    }).join("");
  }

  var kontakt = cfg.kontakt || {};
  var IKON_TLF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';
  var IKON_MAIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z"/></svg>';
  var IKON_UD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>';
  var IKON_MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>';

  function ekstern(url, tekst) {
    return '<a href="' + url + '" target="_blank" rel="noopener">' + tekst + "</a>";
  }

  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<div class="topbar"><div class="wrap">' +
        (kontakt.telefon ? '<a class="kun-bred" href="' + kontakt.telefonLink + '">' + IKON_TLF + "(+45) " + kontakt.telefon + "</a>" : "") +
        (kontakt.mail ? '<a class="kun-bred" href="mailto:' + kontakt.mail + '">' + IKON_MAIL + kontakt.mail + "</a>" : "") +
        ekstern(cfg.links.lectio, IKON_UD + "Lectio") +
        ekstern(cfg.links.office, IKON_UD + "Office 365") +
      "</div></div>" +
      '<header class="site-header"><div class="wrap header-inner">' +
        '<a class="brand" href="' + root + 'index.html" aria-label="MG Intern – forside">' +
          '<img src="' + root + 'assets/img/mg-logo.png" alt="Middelfart Gymnasium &amp; HF" width="213" height="76">' +
          '<span class="brand-tag">Intern</span>' +
        "</a>" +
        '<button class="menu-toggle" aria-expanded="false" aria-controls="hovedmenu" aria-label="Menu">' + IKON_MENU + "</button>" +
        '<nav id="hovedmenu" aria-label="Hovedmenu"><ul>' + navHtml() + "</ul></nav>" +
      "</div></header>";

    var knap = header.querySelector(".menu-toggle");
    var nav = header.querySelector("nav");
    knap.addEventListener("click", function () {
      var aaben = nav.classList.toggle("open");
      knap.setAttribute("aria-expanded", aaben);
    });
  }

  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML =
      '<footer class="site-footer"><div class="wrap">' +
        '<div class="footer-cta">' +
          "<p>Mangler der noget, eller er noget <strong>forkert?</strong></p>" +
          '<a class="knap" href="' + root + 'sider/praktisk.html#hjaelp">Sig det til os</a>' +
        "</div>" +
        '<div class="footer-grid">' +
          "<div>" +
            '<img src="' + root + 'assets/img/mg-logo-hvid.png" alt="Middelfart Gymnasium &amp; HF" width="213" height="76">' +
            "<p>MG Intern samler værktøjer og information for elever og lærere. Siden er offentlig og indeholder ingen personoplysninger.</p>" +
            (kontakt.telefon ? '<p><strong>Tlf. <a href="' + kontakt.telefonLink + '">' + kontakt.telefon + "</a></strong><br>" +
              '<strong><a href="mailto:' + kontakt.mail + '">' + kontakt.mail + "</a></strong></p>" : "") +
          "</div>" +
          "<div><h3>Links</h3><ul>" +
            "<li>" + ekstern(cfg.links.lectio, "Lectio") + "</li>" +
            "<li>" + ekstern(cfg.links.office, "Office 365") + "</li>" +
            "<li>" + ekstern(cfg.links.skolensHjemmeside, "middelfart-gym.dk") + "</li>" +
          "</ul></div>" +
          "<div><h3>Læs mere</h3><ul>" +
            NAV.slice(1, 4).map(function (n) { return '<li><a href="' + root + n.href + '">' + n.titel + "</a></li>"; }).join("") +
          "</ul></div>" +
          "<div><h3>I hverdagen</h3><ul>" +
            NAV.slice(4).map(function (n) { return '<li><a href="' + root + n.href + '">' + n.titel + "</a></li>"; }).join("") +
            '<li><a href="' + root + 'sider/praktisk.html#eksamen">Eksamen</a></li>' +
          "</ul></div>" +
        "</div>" +
        '<div class="footer-bund">MG Intern · Middelfart Gymnasium &amp; HF · Ingen cookies, ingen tracking</div>' +
      "</div></footer>";
  }

  // Indsæt eksterne links fra config: <a data-link="lectio">
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var url = cfg.links[a.getAttribute("data-link")];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
  });

  // Søgefelt på forsiden
  var felt = document.getElementById("soeg");
  var resultater = document.getElementById("soeg-resultater");
  if (felt && resultater) {
    felt.addEventListener("input", function () {
      var q = felt.value.trim().toLowerCase();
      if (!q) { resultater.innerHTML = ""; resultater.hidden = true; return; }
      var hits = SOEG.filter(function (s) {
        return (s.t + " " + s.k).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);
      resultater.hidden = false;
      resultater.innerHTML = hits.length
        ? hits.map(function (s) { return '<li><a href="' + root + s.h + '">' + s.t + "</a></li>"; }).join("")
        : '<li class="tom">Ingen resultater for "' + q.replace(/[<>&"]/g, "") + '"</li>';
    });
  }
})();
