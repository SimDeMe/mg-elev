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
    { t: "Skolens kalender", h: "sider/kalender.html", k: "kalender datoer begivenheder ferie skema uge" },
    { t: "PDF-værktøjer", h: "sider/vaerktoejer.html#pdf", k: "pdf saml flet opdel komprimer billeder scan" },
    { t: "Andre værktøjer", h: "sider/vaerktoejer.html#andre", k: "timer gruppe generator tilfældig lectio office" },
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

  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<div class="topbar"><div class="wrap">' +
        '<span>Intern side for elever og lærere · ingen personoplysninger</span>' +
        '<a href="' + cfg.links.lectio + '" target="_blank" rel="noopener">Lectio ↗</a>' +
      "</div></div>" +
      '<header class="site-header"><div class="wrap header-inner">' +
        '<a class="brand" href="' + root + 'index.html">' +
          '<span class="brand-mark" aria-hidden="true">MG</span>' +
          '<span class="brand-text"><strong>Middelfart Gymnasium</strong><small>Intern</small></span>' +
        "</a>" +
        '<button class="menu-toggle" aria-expanded="false" aria-controls="hovedmenu">Menu</button>' +
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
      '<footer class="site-footer"><div class="wrap footer-grid">' +
        "<div><strong>Middelfart Gymnasium · Intern</strong>" +
        "<p>Samlet overblik over værktøjer og information for elever og lærere. Siden er offentlig og indeholder ingen personoplysninger.</p></div>" +
        "<div><strong>Genveje</strong><ul>" +
          '<li><a href="' + cfg.links.lectio + '" target="_blank" rel="noopener">Lectio</a></li>' +
          '<li><a href="' + cfg.links.office + '" target="_blank" rel="noopener">Office 365</a></li>' +
          '<li><a href="' + cfg.links.skolensHjemmeside + '" target="_blank" rel="noopener">Skolens officielle hjemmeside</a></li>' +
        "</ul></div>" +
        "<div><strong>Fejl eller forslag?</strong>" +
        "<p>Mangler der noget, eller er en oplysning forkert? Sig det til en lærer eller til kontoret.</p></div>" +
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
