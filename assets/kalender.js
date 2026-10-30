// Skolekalenderen vist i MG Interns eget design.
// Data: assets/kalender-data.js (genereres fra smbi med tools/opdater-kalender.mjs).
// Bruges af kalendersiden og af "Kommende" på forsiden og arrangementssiden.
(function () {
  var K = window.MG_KALENDER;
  if (!K) return;

  var MDR = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
  var DAGE = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];

  function dato(s) { var p = s.split("-"); return new Date(+p[0], p[1] - 1, +p[2]); }
  function noegle(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function plus(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function ugedag(d) { return (d.getDay() + 6) % 7; }
  function kort(d) { return d.getDate() + ". " + MDR[d.getMonth()].slice(0, 3) + "."; }
  function periode(b) {
    if (!b.til) return DAGE[ugedag(b.fra)] + " " + b.fra.getDate() + ". " + MDR[b.fra.getMonth()];
    return b.fra.getMonth() === b.til.getMonth() ? b.fra.getDate() + ".–" + kort(b.til) : kort(b.fra) + "–" + kort(b.til);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var idag = new Date(); idag.setHours(0, 0, 0, 0);

  // Personalets møder står i data som koder (M, PR, LF, FC) – skriv dem ud.
  var ALLE = K.BEGIVENHEDER.map(function (b, i) {
    return {
      i: i, fra: dato(b.d), til: b.til ? dato(b.til) : null,
      hold: b.h === "alle" ? "alle" : b.h ? b.h.split(" ") : [],
      type: b.t, tekst: b.kode ? K.KODER[b.kode] || b.x : b.x, note: b.n || ""
    };
  }).sort(function (a, b) { return a.fra - b.fra || a.i - b.i; });

  function slut(b) { return b.til || b.fra; }

  // Filter: hold = "" (alle hold) eller fx "2g". andre = vis også personale/besøgende.
  function passer(b, f) {
    if (f.typer && f.typer.indexOf(b.type) === -1) return false;
    if (b.hold === "alle") return true;
    if (!b.hold.length) return !!f.andre;
    return !f.hold || b.hold.indexOf(f.hold) !== -1;
  }
  function holdTekst(b) { return b.hold === "alle" ? "Hele skolen" : b.hold.length ? b.hold.join(" · ") : "Personale / andre"; }

  function kommende(f, antal) {
    return ALLE.filter(function (b) { return slut(b) >= idag && passer(b, f); }).slice(0, antal);
  }

  // Eksporteres til forsiden og andre sider
  window.MG_KAL = { ALLE: ALLE, TYPER: K.TYPER, passer: passer, kommende: kommende, periode: periode, MDR: MDR, esc: esc, idag: idag };

  // Lille datoliste: <ul class="liste" data-kal-kommende="5">
  document.querySelectorAll("[data-kal-kommende]").forEach(function (ul) {
    var hits = kommende({ hold: "", andre: false }, +ul.getAttribute("data-kal-kommende") || 5);
    ul.innerHTML = hits.map(function (b) {
      var t = K.TYPER[b.type];
      return '<li><div class="dato">' + b.fra.getDate() + "<small>" + MDR[b.fra.getMonth()].slice(0, 3) + "</small></div>" +
        "<div><strong>" + t.tegn + " " + esc(b.tekst) + "</strong><span>" + esc(periode(b)) + " · " + esc(holdTekst(b)) +
        (b.note ? " · " + esc(b.note) : "") + "</span></div></li>";
    }).join("") || "<li>Ingen kommende begivenheder i kalenderen.</li>";
  });

  // Datoer ind i tekst: <span data-kal-dato="^OD-dag$">
  document.querySelectorAll("[data-kal-dato]").forEach(function (el) {
    var re = new RegExp(el.getAttribute("data-kal-dato"), "i");
    var hits = ALLE.filter(function (b) { return re.test(b.tekst); });
    var naeste = hits.filter(function (b) { return slut(b) >= idag; });
    var vis = naeste.length ? naeste : hits.slice(-1);
    if (vis.length) el.textContent = vis.map(function (b) { return periode(b) + " " + b.fra.getFullYear(); }).join(", ") + (naeste.length ? "" : " (overstået)");
  });

  // ─── Selve kalendersiden ──────────────────────────────────
  var rod = document.getElementById("kalender");
  if (!rod) return;

  var tilstand = { hold: "", andre: false, visning: "liste", typer: Object.keys(K.TYPER), maaned: null, forbi: false };
  try {
    var gemt = JSON.parse(localStorage.getItem("mg-kalender") || "{}");
    if (typeof gemt.hold === "string") tilstand.hold = gemt.hold;
    if (gemt.andre) tilstand.andre = true;
    if (gemt.visning === "maaned") tilstand.visning = "maaned";
  } catch (e) {}
  function gem() {
    try { localStorage.setItem("mg-kalender", JSON.stringify({ hold: tilstand.hold, andre: tilstand.andre, visning: tilstand.visning })); } catch (e) {}
  }

  var start = dato(K.AAR.fra), slutAar = dato(K.AAR.til);
  var iAaret = idag >= start && idag <= slutAar;
  tilstand.maaned = iAaret ? new Date(idag.getFullYear(), idag.getMonth(), 1) : new Date(start.getFullYear(), start.getMonth(), 1);

  var $ = function (s) { return rod.querySelector(s); };

  // Kontroller
  $("#kal-hold").innerHTML = [""].concat(K.HOLD).map(function (h) {
    return '<button type="button" data-hold="' + h + '">' + (h || "Alle hold") + "</button>";
  }).join("");
  $("#kal-typer").innerHTML = Object.keys(K.TYPER).map(function (k) {
    var t = K.TYPER[k];
    return '<button type="button" data-type="' + k + '" style="--f:' + t.farve + ";--k:" + t.kant + '"><span aria-hidden="true">' + t.tegn + "</span> " + t.navn + "</button>";
  }).join("");
  $("#kal-aar").textContent = K.AAR.navn;

  rod.addEventListener("click", function (e) {
    var k = e.target.closest("button");
    if (!k) return;
    if (k.hasAttribute("data-hold")) tilstand.hold = k.getAttribute("data-hold");
    else if (k.hasAttribute("data-type")) {
      var t = k.getAttribute("data-type"), i = tilstand.typer.indexOf(t);
      if (i === -1) tilstand.typer.push(t); else tilstand.typer.splice(i, 1);
      if (!tilstand.typer.length) tilstand.typer = Object.keys(K.TYPER);
    }
    else if (k.hasAttribute("data-visning")) tilstand.visning = k.getAttribute("data-visning");
    else if (k.id === "kal-forrige") tilstand.maaned = new Date(tilstand.maaned.getFullYear(), tilstand.maaned.getMonth() - 1, 1);
    else if (k.id === "kal-naeste") tilstand.maaned = new Date(tilstand.maaned.getFullYear(), tilstand.maaned.getMonth() + 1, 1);
    else if (k.id === "kal-idag") { tilstand.maaned = new Date(idag.getFullYear(), idag.getMonth(), 1); }
    else if (k.id === "kal-ics") return hentIcs();
    else if (k.id === "kal-forbi") tilstand.forbi = !tilstand.forbi;
    else return;
    gem(); tegn();
  });
  $("#kal-andre").addEventListener("change", function (e) { tilstand.andre = e.target.checked; gem(); tegn(); });

  function synlige() { return ALLE.filter(function (b) { return passer(b, tilstand); }); }

  function chip(b) {
    var t = K.TYPER[b.type];
    return '<div class="kal-chip" style="--f:' + t.farve + ";--k:" + t.kant + '"' + (b.note ? ' title="' + esc(b.note) + '"' : "") + ">" +
      '<span aria-hidden="true">' + t.tegn + "</span> " + esc(b.tekst) +
      (!tilstand.hold || b.hold === "alle" || !b.hold.length ? ' <em>' + esc(b.hold === "alle" ? "Alle" : b.hold.length ? b.hold.join(" ") : "Pers.") + "</em>" : "") +
      "</div>";
  }

  function tegnListe() {
    var grupper = {}, fraMaaned = new Date(idag.getFullYear(), idag.getMonth(), 1);
    var skjult = iAaret && !tilstand.forbi ? synlige().filter(function (b) { return slut(b) < fraMaaned; }).length : 0;
    synlige().forEach(function (b) {
      if (skjult && slut(b) < fraMaaned) return;
      var m = b.fra.getFullYear() + "-" + b.fra.getMonth();
      (grupper[m] = grupper[m] || []).push(b);
    });
    var html = "";
    Object.keys(grupper).forEach(function (m) {
      var liste = grupper[m], f = liste[0].fra;
      var noter = (K.MAANEDSNOTER || {})[noegle(f).slice(0, 7)] || [];
      html += '<section class="kal-maaned"><h2>' + MDR[f.getMonth()][0].toUpperCase() + MDR[f.getMonth()].slice(1) + " " + f.getFullYear() + "</h2>";
      if (noter.length) html += '<p class="kal-noter">' + noter.map(esc).join(" · ") + "</p>";
      html += '<ul class="kal-liste">';
      liste.forEach(function (b) {
        var t = K.TYPER[b.type], forbi = slut(b) < idag, nu = !forbi && b.fra <= idag;
        html += '<li class="' + (forbi ? "forbi" : "") + (nu ? " nu" : "") + '" data-dato="' + noegle(b.fra) + '" style="--f:' + t.farve + ";--k:" + t.kant + '">' +
          '<div class="kal-dag"><strong>' + b.fra.getDate() + "</strong><small>" + DAGE[ugedag(b.fra)].slice(0, 3) + "</small></div>" +
          '<div class="kal-tekst"><strong><span aria-hidden="true">' + t.tegn + "</span> " + esc(b.tekst) + "</strong>" +
          "<span>" + (b.til ? esc(periode(b)) + " · " : "") + esc(holdTekst(b)) + (b.note ? " · " + esc(b.note) : "") + "</span></div>" +
          '<span class="kal-type">' + t.navn + "</span></li>";
      });
      html += "</ul></section>";
    });
    var knap = iAaret ? '<button type="button" id="kal-forbi" class="kal-forbi-knap">' +
      (tilstand.forbi ? "Skjul tidligere måneder" : "Vis tidligere måneder (" + skjult + " begivenheder)") + "</button>" : "";
    $("#kal-indhold").innerHTML = knap + (html || '<p class="kal-tom">Ingen begivenheder med de valgte filtre.</p>');
  }

  function tegnMaaned() {
    var m = tilstand.maaned, forste = new Date(m.getFullYear(), m.getMonth(), 1);
    var cur = plus(forste, -ugedag(forste));
    var pr = {};
    synlige().forEach(function (b) {
      for (var d = b.fra; d <= slut(b); d = plus(d, 1)) {
        if (ugedag(d) > 4 && b.type !== "ferie" && b.til) continue; // lange perioder fylder ikke weekenden
        (pr[noegle(d)] = pr[noegle(d)] || []).push(b);
      }
    });
    var html = '<div class="kal-maanedbar"><button type="button" id="kal-forrige" aria-label="Forrige måned">←</button>' +
      "<h2>" + MDR[m.getMonth()][0].toUpperCase() + MDR[m.getMonth()].slice(1) + " " + m.getFullYear() + "</h2>" +
      '<button type="button" id="kal-naeste" aria-label="Næste måned">→</button>' +
      (iAaret ? '<button type="button" id="kal-idag" class="kal-idag-knap">I dag</button>' : "") + "</div>";
    html += '<div class="kal-gitter" role="grid"><div class="kal-ugedage" role="row">' +
      DAGE.map(function (d) { return '<div role="columnheader">' + d.slice(0, 3) + "</div>"; }).join("") + "</div>";
    do {
      html += '<div class="kal-uge" role="row">';
      for (var i = 0; i < 7; i++) {
        var k = noegle(cur), anden = cur.getMonth() !== m.getMonth();
        var cls = "kal-celle" + (anden ? " anden" : "") + (i > 4 ? " weekend" : "") + (+cur === +idag ? " idag" : "");
        html += '<div class="' + cls + '" role="gridcell"><span class="kal-nr">' + cur.getDate() + "</span>" +
          (anden ? "" : (pr[k] || []).map(chip).join("")) + "</div>";
        cur = plus(cur, 1);
      }
      html += "</div>";
    } while (cur.getMonth() === m.getMonth());
    html += "</div>";
    $("#kal-indhold").innerHTML = html;
  }

  function tegn() {
    rod.querySelectorAll("[data-hold]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-hold") === tilstand.hold); });
    rod.querySelectorAll("[data-type]").forEach(function (b) { b.setAttribute("aria-pressed", tilstand.typer.indexOf(b.getAttribute("data-type")) !== -1); });
    rod.querySelectorAll("[data-visning]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-visning") === tilstand.visning); });
    $("#kal-andre").checked = tilstand.andre;
    $("[data-type=\"pers\"]").hidden = !tilstand.andre;

    var naeste = kommende(tilstand, 1)[0];
    $("#kal-status").innerHTML = naeste
      ? "Næste for <strong>" + (tilstand.hold || "alle hold") + "</strong>: " + K.TYPER[naeste.type].tegn + " " + esc(naeste.tekst) + " – " + esc(periode(naeste))
      : "Ingen flere begivenheder i " + K.AAR.navn + ".";

    if (tilstand.visning === "maaned") tegnMaaned(); else tegnListe();
  }

  // .ics-fil med det aktuelle filter, til Outlook, Google Kalender og telefonen
  function hentIcs() {
    var f = function (d) { return noegle(d).replace(/-/g, ""); };
    var linjer = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MG Intern//Skolekalender//DA", "CALSCALE:GREGORIAN", "X-WR-CALNAME:MG " + K.AAR.navn + (tilstand.hold ? " " + tilstand.hold : "")];
    synlige().forEach(function (b) {
      linjer.push("BEGIN:VEVENT", "UID:mg-" + f(b.fra) + "-" + b.i + "@mg-intern", "DTSTAMP:" + f(idag) + "T000000Z",
        "DTSTART;VALUE=DATE:" + f(b.fra), "DTEND;VALUE=DATE:" + f(plus(slut(b), 1)),
        "SUMMARY:" + (b.tekst + (b.hold === "alle" || !b.hold.length ? "" : " (" + b.hold.join(" ") + ")")).replace(/([,;])/g, "\\$1"),
        "DESCRIPTION:" + (K.TYPER[b.type].navn + (b.note ? " – " + b.note : "")).replace(/([,;])/g, "\\$1"),
        "TRANSP:TRANSPARENT", "END:VEVENT");
    });
    linjer.push("END:VCALENDAR");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([linjer.join("\r\n")], { type: "text/calendar" }));
    a.download = "mg-kalender-" + K.AAR.navn.replace("–", "-") + (tilstand.hold ? "-" + tilstand.hold : "") + ".ics";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  tegn();
})();
