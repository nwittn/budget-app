// 🧪 Testmodus: z. B. "2026-10-26" eintragen, um ein anderes Datum zu simulieren.
// Im Testmodus wird NICHTS gespeichert. Danach unbedingt wieder auf null setzen!
const TEST_DATUM = null;

const STICHTAG = 25; // Zeitraum beginnt am 25., endet am 24.
const EIN_TAG = 24 * 60 * 60 * 1000; // Millisekunden pro Tag
const PUNKTE_EINGABE = 10;
const PUNKTE_KATEGORIE = 5;
const PUNKTE_CHALLENGE = 20;
const PUNKTE_PERIODE = 50;
const PUNKTE_UNTER_BUDGET = 100;
const VERLAUF_PERIODEN = 12; // so viele Perioden zeigt die Auswertung "Verlauf"
const PUNKTE_PRO_FRANKEN_GESPART = 1; // Spar-Punkte: pro gesparten Franken am Periodenende
const AUSREISSER_PROZENT = 30; // ab so viel % über dem Durchschnitt gibt es einen Hinweis
const AUSREISSER_MIN_CHF = 20; // ... und nur, wenn es mindestens so viele Franken mehr sind
const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

// Spar-Ziele fürs Pufferkonto (für Abzeichen und Fortschrittsanzeige)
const SPAR_ZIELE = [
  { id: "spar100", betrag: 100, symbol: "🐷", name: "CHF 100 gespart" },
  { id: "spar500", betrag: 500, symbol: "🏦", name: "CHF 500 gespart" },
  { id: "spar1000", betrag: 1000, symbol: "🚀", name: "CHF 1'000 gespart" },
  { id: "spar2500", betrag: 2500, symbol: "🏝️", name: "CHF 2'500 gespart" }
];

const LOB = [
  "Super gemacht! 🎉",
  "Stark, wieder eingetragen! 💪",
  "Du hast den Überblick! 👀",
  "Yes! Weiter so! 🚀",
  "Budget-Profi am Werk! ⭐",
  "Erledigt! Gönn dir ein Schulterklopfen 🙌"
];

// Tages-Challenges: jeden Tag ist eine andere dran
const CHALLENGES = [
  { text: "Trag heute 1 Ausgabe ein", ziel: 1, nurMitKategorie: false },
  { text: "Trag heute 2 Ausgaben ein", ziel: 2, nurMitKategorie: false },
  { text: "Gib heute 2 Ausgaben eine Kategorie", ziel: 2, nurMitKategorie: true },
  { text: "Trag heute 3 Ausgaben ein", ziel: 3, nurMitKategorie: false }
];

// Abzeichen: "erreicht" prüft, ob es freigeschaltet ist
const ABZEICHEN = [
  { id: "erste", symbol: "🌱", name: "Erster Eintrag", erreicht: () => daten.eintraegeGesamt >= 1 },
  { id: "zehn", symbol: "🔟", name: "10 Einträge", erreicht: () => daten.eintraegeGesamt >= 10 },
  { id: "fuenfzig", symbol: "🏅", name: "50 Einträge", erreicht: () => daten.eintraegeGesamt >= 50 },
  { id: "streak3", symbol: "🔥", name: "3 Tage in Folge", erreicht: () => berechneStreak() >= 3 },
  { id: "streak7", symbol: "🌟", name: "7 Tage in Folge", erreicht: () => berechneStreak() >= 7 },
  { id: "challenge1", symbol: "🎯", name: "Erste Challenge", erreicht: () => anzahlChallenges() >= 1 },
  { id: "challenge10", symbol: "🏆", name: "10 Challenges", erreicht: () => anzahlChallenges() >= 10 },
  { id: "punkte500", symbol: "💎", name: "500 Punkte", erreicht: () => daten.punkte >= 500 },
  { id: "periode1", symbol: "📅", name: "Erste Periode dabei", erreicht: () => vergangenePerioden().length >= 1 },
  { id: "budget1", symbol: "💰", name: "Unter Budget geblieben", erreicht: () => anzahlUnterBudget() >= 1 },
  { id: "budget3", symbol: "👑", name: "3× unter Budget", erreicht: () => anzahlUnterBudget() >= 3 },
  { id: "periode6", symbol: "🌳", name: "6 Perioden dabei", erreicht: () => vergangenePerioden().length >= 6 },
  { id: "punkte1000", symbol: "🌈", name: "1000 Punkte", erreicht: () => daten.punkte >= 1000 }
].concat(SPAR_ZIELE.map(ziel => ({
  id: ziel.id,
  symbol: ziel.symbol,
  name: ziel.name,
  erreicht: () => pufferTotal() >= ziel.betrag
})));

// --- Elemente aus dem HTML holen ---
const startScreen = document.getElementById("start-screen");
const setupScreen = document.getElementById("setup-screen");
const restGesamtEl = document.getElementById("rest-gesamt");
const restProTagEl = document.getElementById("rest-pro-tag");
const punkteAnzeige = document.getElementById("punkte-anzeige");
const streakAnzeige = document.getElementById("streak-anzeige");
const challengeText = document.getElementById("challenge-text");
const challengeStatus = document.getElementById("challenge-status");
const budgetInput = document.getElementById("budget-input");
const setupHinweis = document.getElementById("setup-hinweis");
const setupSpeichern = document.getElementById("setup-speichern");
const budgetAendern = document.getElementById("budget-aendern");
const plusButton = document.getElementById("plus-button");

const ausgabeScreen = document.getElementById("ausgabe-screen");
const ausgabeForm = document.getElementById("ausgabe-form");
const ausgabeTitel = document.getElementById("ausgabe-titel");
const betragInput = document.getElementById("betrag-input");
const kategorieInput = document.getElementById("kategorie-input");
const ausgabeHinweis = document.getElementById("ausgabe-hinweis");
const ausgabeAbbrechen = document.getElementById("ausgabe-abbrechen");
const ausgabeLoeschen = document.getElementById("ausgabe-loeschen");

const listeScreen = document.getElementById("liste-screen");
const listeZeitraum = document.getElementById("liste-zeitraum");
const ausgabenListe = document.getElementById("ausgaben-liste");
const listeLeer = document.getElementById("liste-leer");
const listeOeffnen = document.getElementById("liste-oeffnen");
const listeSchliessen = document.getElementById("liste-schliessen");

const verlaufScreen = document.getElementById("verlauf-screen");
const verlaufListe = document.getElementById("verlauf-liste");
const verlaufLeer = document.getElementById("verlauf-leer");
const verlaufOeffnen = document.getElementById("verlauf-oeffnen");
const verlaufSchliessen = document.getElementById("verlauf-schliessen");

const auswertungScreen = document.getElementById("auswertung-screen");
const auswertungOeffnen = document.getElementById("auswertung-oeffnen");
const auswertungSchliessen = document.getElementById("auswertung-schliessen");
const ansichtPeriodeButton = document.getElementById("ansicht-periode");
const ansichtVerlaufButton = document.getElementById("ansicht-verlauf");
const auswertungPeriode = document.getElementById("auswertung-periode");
const auswertungVerlauf = document.getElementById("auswertung-verlauf");
const periodeAuswahl = document.getElementById("periode-auswahl");
const periodeTotal = document.getElementById("periode-total");
const periodeBalken = document.getElementById("periode-balken");
const ansichtWochentageButton = document.getElementById("ansicht-wochentage");
const auswertungWochentage = document.getElementById("auswertung-wochentage");
const ausreisserEl = document.getElementById("ausreisser");
const wochentagZeitraum = document.getElementById("wochentag-zeitraum");
const wochentagFazit = document.getElementById("wochentag-fazit");
const wochentagBalken = document.getElementById("wochentag-balken");
const pufferKarte = document.getElementById("puffer-karte");
const kategorieAuswahl = document.getElementById("kategorie-auswahl");
const verlaufTotal = document.getElementById("verlauf-total");
const verlaufBalken = document.getElementById("verlauf-balken");

const abzeichenScreen = document.getElementById("abzeichen-screen");
const abzeichenListe = document.getElementById("abzeichen-liste");
const abzeichenOeffnen = document.getElementById("abzeichen-oeffnen");
const abzeichenSchliessen = document.getElementById("abzeichen-schliessen");

const popupScreen = document.getElementById("popup-screen");
const popupSymbol = document.getElementById("popup-symbol");
const popupTitel = document.getElementById("popup-titel");
const popupText = document.getElementById("popup-text");
const popupOk = document.getElementById("popup-ok");
const popupAktion = document.getElementById("popup-aktion");

const toast = document.getElementById("toast");

// Alle Kategorien, direkt aus dem Auswahlfeld im HTML gelesen
const KATEGORIEN = Array.from(kategorieInput.options)
  .map(option => option.value)
  .filter(wert => wert !== "");
const OHNE_KATEGORIE = "Ohne Kategorie";

// --- Datum-Hilfen ---
function heute() {
  let d;
  if (TEST_DATUM) {
    d = new Date(TEST_DATUM + "T00:00:00");
  } else {
    d = new Date();
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

// Datum als Text "2026-10-08", um Tage zu vergleichen
function tagText(d) {
  const monat = String(d.getMonth() + 1).padStart(2, "0");
  const tag = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + monat + "-" + tag;
}

// Erster Tag der Periode, in der "datum" liegt (ohne Angabe: heute)
function zeitraumStart(datum) {
  const d = datum || heute();
  if (d.getDate() >= STICHTAG) {
    return new Date(d.getFullYear(), d.getMonth(), STICHTAG);
  }
  return new Date(d.getFullYear(), d.getMonth() - 1, STICHTAG);
}

// Letzter Tag der Periode, die bei "start" beginnt (ohne Angabe: aktuelle)
function zeitraumEnde(start) {
  const s = start || zeitraumStart();
  return new Date(s.getFullYear(), s.getMonth() + 1, STICHTAG - 1);
}

// Verbleibende Tage inkl. heute
function verbleibendeTage() {
  return Math.round((zeitraumEnde() - heute()) / EIN_TAG) + 1;
}

// z. B. "25. Sept. – 24. Okt."
function periodeText(start) {
  const format = { day: "numeric", month: "short" };
  return start.toLocaleDateString("de-CH", format) + " – " +
         zeitraumEnde(start).toLocaleDateString("de-CH", format);
}

// --- Daten laden und speichern ---
function ladeDaten() {
  const text = localStorage.getItem("budgetApp");
  let d;
  if (text) {
    d = JSON.parse(text);
  } else {
    d = { budget: null, ausgaben: [] };
  }
  return ergaenzeFelder(d);
}

// Fehlende Felder ergänzen (für ältere gespeicherte oder importierte Daten)
function ergaenzeFelder(d) {
  if (d.budget === undefined) {
    d.budget = null;
  }
  if (d.ausgaben === undefined) {
    d.ausgaben = [];
  }
  if (d.punkte === undefined) {
    d.punkte = 0;
  }
  if (d.eintraegeGesamt === undefined) {
    d.eintraegeGesamt = d.ausgaben.length;
  }
  if (d.eintragTage === undefined) {
    d.eintragTage = [];
    for (const ausgabe of d.ausgaben) {
      const t = tagText(new Date(ausgabe.datum));
      if (!d.eintragTage.includes(t)) {
        d.eintragTage.push(t);
      }
    }
  }
  if (d.challenges === undefined) {
    d.challenges = {};
  }
  if (d.abzeichen === undefined) {
    d.abzeichen = [];
  }
  if (d.budgetVerlauf === undefined) {
    d.budgetVerlauf = {}; // Budget pro Periode, z. B. { "2026-09-25": 800 }
  }
  if (d.gefeiertePerioden === undefined) {
    d.gefeiertePerioden = [];
  }
  return d;
}

function speichereDaten() {
  if (TEST_DATUM) {
    return; // im Testmodus nichts speichern
  }
  localStorage.setItem("budgetApp", JSON.stringify(daten));
}

let daten = ladeDaten();

// --- Berechnungen ---
function summeAusgaben() {
  const start = zeitraumStart();
  let summe = 0;
  for (const ausgabe of daten.ausgaben) {
    if (new Date(ausgabe.datum) >= start) {
      summe = summe + ausgabe.betrag;
    }
  }
  return summe;
}

function chf(betrag) {
  return "CHF " + betrag.toFixed(2);
}

// --- Popup (muss bestätigt werden) ---
const popupWarteschlange = []; // falls mehrere Popups gleichzeitig kommen

let popupAktionFunktion = null; // was der Zusatz-Button im Popup tun soll

// "aktion" ist optional, z. B. { text: "💾 Backup jetzt speichern", funktion: starteExport }
function zeigePopup(symbol, titel, text, aktion) {
  popupWarteschlange.push({ symbol: symbol, titel: titel, text: text, aktion: aktion });
  if (popupScreen.hidden) {
    naechstesPopup();
  }
}

function naechstesPopup() {
  const popup = popupWarteschlange.shift(); // nimmt das erste aus der Warteschlange
  if (popup === undefined) {
    popupScreen.hidden = true;
    return;
  }
  popupSymbol.textContent = popup.symbol;
  popupTitel.textContent = popup.titel;
  popupText.innerHTML = popup.text; // innerHTML, damit <br> als Zeilenumbruch wirkt

  // Zusatz-Button nur zeigen, wenn das Popup eine Aktion hat
  if (popup.aktion) {
    popupAktion.textContent = popup.aktion.text;
    popupAktionFunktion = popup.aktion.funktion;
    popupAktion.hidden = false;
  } else {
    popupAktionFunktion = null;
    popupAktion.hidden = true;
  }
  popupScreen.hidden = false;
}

popupOk.addEventListener("click", naechstesPopup);

popupAktion.addEventListener("click", function () {
  if (popupAktionFunktion) {
    popupAktionFunktion();
  }
  naechstesPopup();
});

// Macht aus einer Liste von Abzeichen einen Text, eines pro Zeile
function abzeichenAlsText(liste) {
  let text = "";
  for (const abzeichen of liste) {
    text = text + abzeichen.symbol + " " + abzeichen.name + "<br>";
  }
  return text;
}

// Alle neuen Abzeichen in EINEM Popup anzeigen
function zeigeNeueAbzeichen() {
  const neue = pruefeAbzeichen();

  if (neue.length === 0) {
    return;
  }

  if (neue.length === 1) {
    zeigePopup(neue[0].symbol, "Neues Abzeichen!", neue[0].name);
    return;
  }

  zeigePopup("🏆", neue.length + " neue Abzeichen!", abzeichenAlsText(neue));
}

// --- Frühere Perioden ---
// Sammelt alle Ausgaben vor der aktuellen Periode, gruppiert nach Periode
function vergangenePerioden() {
  const aktuellerStart = zeitraumStart();
  const gruppen = {};

  for (const ausgabe of daten.ausgaben) {
    const datum = new Date(ausgabe.datum);
    if (datum < aktuellerStart) {
      const start = zeitraumStart(datum);
      const key = tagText(start);
      if (gruppen[key] === undefined) {
        gruppen[key] = {
          start: start,
          ausgaben: [],
          summe: 0,
          budget: daten.budgetVerlauf[key] ?? daten.budget
        };
      }
      gruppen[key].ausgaben.push(ausgabe);
      gruppen[key].summe = gruppen[key].summe + ausgabe.betrag;
    }
  }

  const perioden = Object.values(gruppen);
  for (const periode of perioden) {
    periode.unterBudget = periode.summe <= periode.budget;
    periode.ueberschuss = periode.budget - periode.summe; // übrig gebliebenes Geld
    periode.ausgaben.reverse(); // neueste zuerst
  }
  perioden.sort((a, b) => b.start - a.start); // neueste Periode zuerst
  return perioden;
}

function anzahlUnterBudget() {
  return vergangenePerioden().filter(p => p.unterBudget).length;
}

// Summe aller Überschüsse = was insgesamt aufs Pufferkonto gehen sollte
function pufferTotal() {
  let summe = 0;
  for (const periode of vergangenePerioden()) {
    if (periode.ueberschuss > 0) {
      summe = summe + periode.ueberschuss;
    }
  }
  return summe;
}

// Karte oben auf der Abzeichen-Seite: Total und Fortschritt zum nächsten Spar-Abzeichen
function zeigePufferKarte() {
  const total = pufferTotal();
  let html = "<p class='puffer-titel'>💸 Insgesamt aufs Pufferkonto</p>" +
             "<p class='puffer-betrag'>" + chf(total) + "</p>";

  const naechstes = SPAR_ZIELE.find(ziel => total < ziel.betrag);
  if (naechstes) {
    const fortschritt = Math.min(100, (total / naechstes.betrag) * 100);
    html = html +
      "<div class='puffer-spur'><div class='puffer-fortschritt' style='width:" + fortschritt + "%'></div></div>" +
      "<p class='puffer-ziel'>Noch " + chf(naechstes.betrag - total) + " bis " +
      naechstes.symbol + " " + naechstes.name + "</p>";
  } else {
    html = html + "<p class='puffer-ziel'>Alle Spar-Abzeichen geschafft! 🎉</p>";
  }
  pufferKarte.innerHTML = html;
}

// Beim ersten Öffnen nach Periodenende: feiern, Punkte geben,
// an das Pufferkonto erinnern und alles zusammen in EINEM Popup anzeigen
function pruefePeriodenwechsel() {
  const perioden = vergangenePerioden();
  if (perioden.length === 0) {
    return;
  }
  const letzte = perioden[0];
  const key = tagText(letzte.start);
  if (daten.gefeiertePerioden.includes(key)) {
    return;
  }
  daten.gefeiertePerioden.push(key);

  // Nachricht zur Periode
  let punkte = PUNKTE_PERIODE;
  let symbol = "📅";
  let titel = "Periode abgeschlossen!";
  let text = "Danke fürs Dranbleiben, eine neue Periode beginnt.";
  if (letzte.unterBudget) {
    punkte = punkte + PUNKTE_UNTER_BUDGET;
    symbol = "💰";
    titel = "Periode geschafft!";
    text = "Du bist unter Budget geblieben.";
  }
  daten.punkte = daten.punkte + punkte;
  text = text + "<br><strong>+" + punkte + " Punkte</strong>";

  // Erinnerung ans Pufferkonto und Spar-Punkte, falls etwas übrig ist
  if (letzte.ueberschuss > 0) {
    const sparPunkte = Math.floor(letzte.ueberschuss * PUNKTE_PRO_FRANKEN_GESPART);
    daten.punkte = daten.punkte + sparPunkte;
    text = text + "<br><strong>+" + sparPunkte + " Spar-Punkte</strong>" +
           "<br><br>💸 <strong>Pufferkonto nicht vergessen:</strong><br>" +
           "Überweise " + chf(letzte.ueberschuss) + " auf dein Pufferkonto.<br>" +
           "Insgesamt gespart: <strong>" + chf(pufferTotal()) + "</strong>";
  }

  // Neue Abzeichen direkt darunter anhängen
  const neue = pruefeAbzeichen();
  if (neue.length > 0) {
    text = text + "<br><br>Neue Abzeichen:<br>" + abzeichenAlsText(neue);
  }

  // Erinnerung ans Backup
  text = text + "<br><br>💾 <strong>Backup nicht vergessen:</strong><br>" +
         "Speichere deine Daten und leg die Datei z. B. in Google Drive ab.";

  zeigePopup(symbol, titel, text, { text: "💾 Backup jetzt speichern", funktion: starteExport });
  konfetti();
}

function zeigeVerlauf() {
  const perioden = vergangenePerioden();
  verlaufListe.innerHTML = "";

  verlaufLeer.hidden = perioden.length > 0;
  verlaufLeer.textContent = "Noch keine abgeschlossene Periode. Die aktuelle endet am " +
    zeitraumEnde().toLocaleDateString("de-CH", { day: "numeric", month: "long" }) + ".";

  for (const periode of perioden) {
    const details = document.createElement("details");
    details.className = "periode";

    let symbol = "🌱";
    if (periode.unterBudget) {
      symbol = "✅";
    }

    let info = chf(periode.summe) + " von " + chf(periode.budget);
    if (periode.ueberschuss > 0) {
      info = info + "<br>💸 Überschuss fürs Pufferkonto: " + chf(periode.ueberschuss);
    }

    let html = "<summary>" + symbol + " " + periodeText(periode.start) +
               "<span class='periode-info'>" + info + "</span>" +
               "</summary><ul>";
    for (const ausgabe of periode.ausgaben) {
      html = html + "<li>" + eintragHTML(ausgabe) + "</li>";
    }
    html = html + "</ul>";

    details.innerHTML = html;
    verlaufListe.appendChild(details);
  }
}

// --- Auswertung ---
let auswertungAnsicht = "periode"; // "periode" oder "verlauf"

// Startdaten der letzten "anzahl" Perioden, neueste zuerst (inkl. aktueller)
function letztePeriodenStarts(anzahl) {
  const aktuell = zeitraumStart();
  const starts = [];
  for (let i = 0; i < anzahl; i++) {
    starts.push(new Date(aktuell.getFullYear(), aktuell.getMonth() - i, STICHTAG));
  }
  return starts;
}

// Alle Ausgaben, die in der Periode mit diesem Start liegen
function ausgabenDerPeriode(start) {
  const ende = new Date(start.getFullYear(), start.getMonth() + 1, STICHTAG); // erster Tag der nächsten Periode
  return daten.ausgaben.filter(function (ausgabe) {
    const datum = new Date(ausgabe.datum);
    return datum >= start && datum < ende;
  });
}

// Summiert die Ausgaben pro Kategorie, z. B. { "Sport": 45, "Ohne Kategorie": 12 }
function summenProKategorie(ausgaben) {
  const summen = {};
  for (const ausgabe of ausgaben) {
    const kategorie = ausgabe.kategorie || OHNE_KATEGORIE;
    summen[kategorie] = (summen[kategorie] || 0) + ausgabe.betrag;
  }
  return summen;
}

// Baut eine Balkenzeile: Name links, Betrag rechts, darunter der Balken
function balkenZeile(name, betrag, maximum, zusatz, laufend) {
  let breite = 0;
  if (maximum > 0) {
    breite = (betrag / maximum) * 100;
  }
  let klasse = "balken";
  if (laufend) {
    klasse = "balken laufend";
  }
  return "<div class='balken-zeile'>" +
           "<div class='balken-text'><span>" + name + "</span>" +
           "<strong>" + chf(betrag) + zusatz + "</strong></div>" +
           "<div class='balken-spur'><div class='" + klasse + "' style='width:" + breite + "%'></div></div>" +
         "</div>";
}

// Auswahlfeld "Periode" füllen: aktuelle Periode und alle früheren mit Ausgaben
function fuellePeriodenAuswahl() {
  const aktuell = zeitraumStart();
  const vorher = periodeAuswahl.value;
  periodeAuswahl.innerHTML = "";

  const starts = [aktuell];
  for (const periode of vergangenePerioden()) {
    starts.push(periode.start);
  }

  for (const start of starts) {
    const option = document.createElement("option");
    option.value = tagText(start);
    option.textContent = periodeText(start);
    if (start.getTime() === aktuell.getTime()) {
      option.textContent = option.textContent + " (aktuell)";
    }
    periodeAuswahl.appendChild(option);
  }

  if (vorher && starts.some(s => tagText(s) === vorher)) {
    periodeAuswahl.value = vorher; // Auswahl beibehalten
  }
}

// Auswahlfeld "Kategorie" füllen
function fuelleKategorieAuswahl() {
  if (kategorieAuswahl.options.length > 0) {
    return; // schon gefüllt
  }
  const alle = ["Alle Kategorien"].concat(KATEGORIEN, [OHNE_KATEGORIE]);
  for (const name of alle) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    kategorieAuswahl.appendChild(option);
  }
}

// Ansicht 1: Wie viel pro Kategorie in einer Periode?
function zeigeAuswertungPeriode() {
  const start = new Date(periodeAuswahl.value + "T00:00:00");
  const ausgaben = ausgabenDerPeriode(start);
  const summen = summenProKategorie(ausgaben);

  let total = 0;
  for (const ausgabe of ausgaben) {
    total = total + ausgabe.betrag;
  }
  const budget = daten.budgetVerlauf[tagText(start)] ?? daten.budget;
  periodeTotal.innerHTML = "Total: <strong>" + chf(total) + "</strong> von " + chf(budget);

  zeigeAusreisser(start, summen);

  // Kategorien nach Betrag sortieren, grösste zuerst
  const eintraege = Object.entries(summen).sort((a, b) => b[1] - a[1]);

  if (eintraege.length === 0) {
    periodeBalken.innerHTML = "<p class='balken-leer'>In dieser Periode gibt es noch keine Ausgaben.</p>";
    return;
  }

  const maximum = eintraege[0][1];
  let html = "";
  for (const [kategorie, betrag] of eintraege) {
    const prozent = Math.round((betrag / total) * 100);
    html = html + balkenZeile(kategorie, betrag, maximum, " · " + prozent + "%", false);
  }
  periodeBalken.innerHTML = html;
}

// Ansicht 2: Wie viel für eine Kategorie über mehrere Perioden?
function zeigeAuswertungVerlauf() {
  const kategorie = kategorieAuswahl.value;
  const aktuell = zeitraumStart();

  // Ältester Eintrag bestimmt, wie weit zurück wir schauen (max. VERLAUF_PERIODEN)
  let anzahl = 1;
  for (const ausgabe of daten.ausgaben) {
    const start = zeitraumStart(new Date(ausgabe.datum));
    const abstand = (aktuell.getFullYear() - start.getFullYear()) * 12 +
                    (aktuell.getMonth() - start.getMonth()) + 1;
    anzahl = Math.max(anzahl, abstand);
  }
  anzahl = Math.min(anzahl, VERLAUF_PERIODEN);

  const zeilen = [];
  for (const start of letztePeriodenStarts(anzahl)) {
    const summen = summenProKategorie(ausgabenDerPeriode(start));
    let betrag = 0;
    if (kategorie === "Alle Kategorien") {
      for (const wert of Object.values(summen)) {
        betrag = betrag + wert;
      }
    } else {
      betrag = summen[kategorie] || 0;
    }
    zeilen.push({ start: start, betrag: betrag, laufend: start.getTime() === aktuell.getTime() });
  }

  // Durchschnitt nur über abgeschlossene Perioden
  const abgeschlossen = zeilen.filter(z => !z.laufend);
  if (abgeschlossen.length > 0) {
    let summe = 0;
    for (const zeile of abgeschlossen) {
      summe = summe + zeile.betrag;
    }
    verlaufTotal.innerHTML = "Durchschnitt pro Periode: <strong>" +
      chf(summe / abgeschlossen.length) + "</strong>";
  } else {
    verlaufTotal.textContent = "Der Durchschnitt erscheint, sobald eine Periode abgeschlossen ist.";
  }

  const maximum = Math.max(...zeilen.map(z => z.betrag));
  let html = "";
  for (const zeile of zeilen) {
    let name = periodeText(zeile.start);
    if (zeile.laufend) {
      name = name + " (läuft)";
    }
    html = html + balkenZeile(name, zeile.betrag, maximum, "", zeile.laufend);
  }
  verlaufBalken.innerHTML = html;
}

// Ausreisser: Welche Kategorien liegen deutlich über dem Durchschnitt der Perioden davor?
function zeigeAusreisser(start, summen) {
  const fruehere = allePeriodenStarts().filter(s => s < start);
  if (fruehere.length === 0) {
    ausreisserEl.hidden = true; // noch nichts zum Vergleichen
    return;
  }

  // Durchschnitt pro Kategorie über die früheren Perioden
  const durchschnitt = {};
  for (const s of fruehere) {
    const summenFrueher = summenProKategorie(ausgabenDerPeriode(s));
    for (const [kategorie, betrag] of Object.entries(summenFrueher)) {
      durchschnitt[kategorie] = (durchschnitt[kategorie] || 0) + betrag / fruehere.length;
    }
  }

  const laeuft = start.getTime() === zeitraumStart().getTime();
  const auffaellig = [];
  for (const [kategorie, betrag] of Object.entries(summen)) {
    const schnitt = durchschnitt[kategorie] || 0;
    if (schnitt <= 0) {
      continue;
    }
    const prozent = Math.round(((betrag - schnitt) / schnitt) * 100);
    if (prozent >= AUSREISSER_PROZENT && betrag - schnitt >= AUSREISSER_MIN_CHF) {
      auffaellig.push({ kategorie: kategorie, betrag: betrag, schnitt: schnitt, prozent: prozent });
    }
  }
  auffaellig.sort((a, b) => b.prozent - a.prozent);

  let html = "";
  if (auffaellig.length === 0) {
    html = "<p>✅ Keine Kategorie liegt deutlich über deinem Durchschnitt.</p>";
  } else {
    for (const eintrag of auffaellig.slice(0, 3)) {
      let wort = "";
      if (laeuft) {
        wort = "schon ";
      }
      html = html + "<p>👀 <strong>" + eintrag.kategorie + "</strong> ist " + wort +
             eintrag.prozent + " % über deinem Durchschnitt<br>" +
             chf(eintrag.betrag) + " statt sonst " + chf(eintrag.schnitt) + "</p>";
    }
  }
  ausreisserEl.innerHTML = html;
  ausreisserEl.hidden = false;
}

// Ansicht 3: An welchen Wochentagen wird am meisten ausgegeben?
function zeigeAuswertungWochentage() {
  let ab = null; // ab welchem Datum gezählt wird (null = alles)
  const aktuell = zeitraumStart();
  if (wochentagZeitraum.value === "aktuell") {
    ab = aktuell;
  } else if (wochentagZeitraum.value === "3") {
    ab = new Date(aktuell.getFullYear(), aktuell.getMonth() - 2, STICHTAG);
  }

  const summen = [0, 0, 0, 0, 0, 0, 0]; // Montag bis Sonntag
  let total = 0;
  for (const ausgabe of daten.ausgaben) {
    const datum = new Date(ausgabe.datum);
    if (ab && datum < ab) {
      continue;
    }
    const tag = (datum.getDay() + 6) % 7; // JavaScript zählt ab Sonntag, wir ab Montag
    summen[tag] = summen[tag] + ausgabe.betrag;
    total = total + ausgabe.betrag;
  }

  if (total === 0) {
    wochentagFazit.innerHTML = "<p>In diesem Zeitraum gibt es noch keine Ausgaben.</p>";
    wochentagBalken.innerHTML = "";
    return;
  }

  const maximum = Math.max(...summen);
  const topTag = summen.indexOf(maximum);
  const wochenende = summen[5] + summen[6];
  wochentagFazit.innerHTML =
    "<p>📅 Am meisten gibst du am <strong>" + WOCHENTAGE[topTag] + "</strong> aus.</p>" +
    "<p>🛋️ Wochenende: <strong>" + Math.round((wochenende / total) * 100) + " %</strong> deiner Ausgaben</p>";

  let html = "";
  for (let i = 0; i < 7; i++) {
    const prozent = Math.round((summen[i] / total) * 100);
    html = html + balkenZeile(WOCHENTAGE[i], summen[i], maximum, " · " + prozent + "%", false);
  }
  wochentagBalken.innerHTML = html;
  // den stärksten Tag dunkler einfärben
  wochentagBalken.querySelectorAll(".balken")[topTag].classList.add("markiert");
}

function zeigeAuswertung() {
  ansichtPeriodeButton.classList.toggle("aktiv", auswertungAnsicht === "periode");
  ansichtVerlaufButton.classList.toggle("aktiv", auswertungAnsicht === "verlauf");
  ansichtWochentageButton.classList.toggle("aktiv", auswertungAnsicht === "wochentage");
  auswertungPeriode.hidden = auswertungAnsicht !== "periode";
  auswertungVerlauf.hidden = auswertungAnsicht !== "verlauf";
  auswertungWochentage.hidden = auswertungAnsicht !== "wochentage";

  if (auswertungAnsicht === "periode") {
    fuellePeriodenAuswahl();
    zeigeAuswertungPeriode();
  } else if (auswertungAnsicht === "verlauf") {
    fuelleKategorieAuswahl();
    zeigeAuswertungVerlauf();
  } else {
    zeigeAuswertungWochentage();
  }
}

auswertungOeffnen.addEventListener("click", function () {
  startScreen.hidden = true;
  auswertungScreen.hidden = false;
  zeigeAuswertung();
});

auswertungSchliessen.addEventListener("click", zeigeStart);

ansichtPeriodeButton.addEventListener("click", function () {
  auswertungAnsicht = "periode";
  zeigeAuswertung();
});

ansichtVerlaufButton.addEventListener("click", function () {
  auswertungAnsicht = "verlauf";
  zeigeAuswertung();
});

ansichtWochentageButton.addEventListener("click", function () {
  auswertungAnsicht = "wochentage";
  zeigeAuswertung();
});

wochentagZeitraum.addEventListener("change", zeigeAuswertungWochentage);
periodeAuswahl.addEventListener("change", zeigeAuswertungPeriode);
kategorieAuswahl.addEventListener("change", zeigeAuswertungVerlauf);

// --- Excel-Export ---
// Die Excel-Bibliothek wird erst beim ersten Export aus dem Internet geladen.
// Danach speichert der Service Worker sie, sodass sie auch offline funktioniert.
const EXCEL_BIBLIOTHEK = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
const exportButton = document.getElementById("export-button");

function ladeExcelBibliothek() {
  return new Promise(function (fertig, fehler) {
    if (window.XLSX) {
      fertig();
      return;
    }
    const skript = document.createElement("script");
    skript.src = EXCEL_BIBLIOTHEK;
    skript.onload = fertig;
    skript.onerror = fehler;
    document.head.appendChild(skript);
  });
}

// z. B. "25.09.2026 – 24.10.2026" (mit Jahr, für Excel)
function periodeTextMitJahr(start) {
  const format = { day: "2-digit", month: "2-digit", year: "numeric" };
  return start.toLocaleDateString("de-CH", format) + " – " +
         zeitraumEnde(start).toLocaleDateString("de-CH", format);
}

// Alle Perioden mit Ausgaben plus die aktuelle, älteste zuerst
function allePeriodenStarts() {
  const keys = new Set([tagText(zeitraumStart())]);
  for (const ausgabe of daten.ausgaben) {
    keys.add(tagText(zeitraumStart(new Date(ausgabe.datum))));
  }
  return Array.from(keys).sort().map(key => new Date(key + "T00:00:00"));
}

// Formatiert eine Spalte in einem Tabellenblatt (z. B. als Datum oder CHF)
function formatiereSpalte(blatt, spalte, format) {
  const bereich = XLSX.utils.decode_range(blatt["!ref"]);
  for (let zeile = 1; zeile <= bereich.e.r; zeile++) {
    const zelle = blatt[XLSX.utils.encode_cell({ r: zeile, c: spalte })];
    if (zelle && (zelle.t === "n" || zelle.t === "d")) {
      zelle.z = format;
    }
  }
}

function exportiereExcel() {
  const mappe = XLSX.utils.book_new();

  // Blatt 1: alle Ausgaben einzeln
  const ausgaben = daten.ausgaben.slice().sort((a, b) => new Date(a.datum) - new Date(b.datum));
  const zeilen1 = [["Datum", "Periode", "Kategorie", "Betrag (CHF)"]];
  for (const ausgabe of ausgaben) {
    const d = new Date(ausgabe.datum);
    zeilen1.push([
      new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      periodeTextMitJahr(zeitraumStart(d)),
      ausgabe.kategorie || OHNE_KATEGORIE,
      ausgabe.betrag
    ]);
  }
  const blatt1 = XLSX.utils.aoa_to_sheet(zeilen1, { cellDates: true });
  formatiereSpalte(blatt1, 0, "dd.mm.yyyy");
  formatiereSpalte(blatt1, 3, "0.00");
  blatt1["!cols"] = [{ wch: 12 }, { wch: 26 }, { wch: 36 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(mappe, blatt1, "Ausgaben");

  // Blatt 2: Kategorien × Perioden
  const starts = allePeriodenStarts();
  const kopf = ["Kategorie"].concat(starts.map(periodeTextMitJahr), ["Total"]);
  const zeilen2 = [kopf];
  const summenProPeriode = starts.map(start => summenProKategorie(ausgabenDerPeriode(start)));
  for (const kategorie of KATEGORIEN.concat([OHNE_KATEGORIE])) {
    const werte = summenProPeriode.map(summen => summen[kategorie] || 0);
    const total = werte.reduce((a, b) => a + b, 0);
    zeilen2.push([kategorie].concat(werte, [total]));
  }
  const totalZeile = ["Total"];
  for (let spalte = 1; spalte < kopf.length; spalte++) {
    let summe = 0;
    for (let zeile = 1; zeile < zeilen2.length; zeile++) {
      summe = summe + zeilen2[zeile][spalte];
    }
    totalZeile.push(summe);
  }
  zeilen2.push(totalZeile);
  const blatt2 = XLSX.utils.aoa_to_sheet(zeilen2);
  for (let spalte = 1; spalte < kopf.length; spalte++) {
    formatiereSpalte(blatt2, spalte, "0.00");
  }
  blatt2["!cols"] = [{ wch: 36 }].concat(kopf.slice(1).map(() => ({ wch: 24 })));
  XLSX.utils.book_append_sheet(mappe, blatt2, "Pro Kategorie");

  // Blatt 3: Übersicht pro Periode
  const zeilen3 = [["Periode", "Budget (CHF)", "Ausgegeben (CHF)", "Übrig (CHF)"]];
  for (const start of starts) {
    const budget = daten.budgetVerlauf[tagText(start)] ?? daten.budget;
    const ausgegeben = ausgabenDerPeriode(start).reduce((summe, a) => summe + a.betrag, 0);
    zeilen3.push([periodeTextMitJahr(start), budget, ausgegeben, budget - ausgegeben]);
  }
  const blatt3 = XLSX.utils.aoa_to_sheet(zeilen3);
  for (let spalte = 1; spalte <= 3; spalte++) {
    formatiereSpalte(blatt3, spalte, "0.00");
  }
  blatt3["!cols"] = [{ wch: 26 }, { wch: 14 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(mappe, blatt3, "Perioden");

  // Blatt 4: alle App-Daten für die Wiederherstellung (in Stücke geteilt,
  // weil eine Excel-Zelle höchstens 32'767 Zeichen fassen kann)
  const json = JSON.stringify(daten);
  const zeilen4 = [[BACKUP_KENNUNG + " – bitte nicht verändern"]];
  for (let i = 0; i < json.length; i = i + 30000) {
    zeilen4.push([json.slice(i, i + 30000)]);
  }
  XLSX.utils.book_append_sheet(mappe, XLSX.utils.aoa_to_sheet(zeilen4), "Backup");

  XLSX.writeFile(mappe, "Budget_Export_" + tagText(new Date()) + ".xlsx");
}

exportButton.addEventListener("click", starteExport);

function starteExport() {
  exportButton.disabled = true;
  exportButton.textContent = "Wird erstellt …";
  ladeExcelBibliothek()
    .then(function () {
      exportiereExcel();
      zeigeToast("📥 Excel-Datei gespeichert (Ordner Downloads)");
    })
    .catch(function () {
      zeigeToast("Für den ersten Export braucht es kurz Internet 🙂");
    })
    .finally(function () {
      exportButton.disabled = false;
      exportButton.textContent = "📥 Als Excel-Datei exportieren";
    });
}

// --- Backup importieren ---
const BACKUP_KENNUNG = "BUDGET-APP-BACKUP v1";
const importButton = document.getElementById("import-button");
const importSetup = document.getElementById("import-setup");
const importDatei = document.getElementById("import-datei");
const importScreen = document.getElementById("import-screen");
const importText = document.getElementById("import-text");
const importOk = document.getElementById("import-ok");
const importAbbrechen = document.getElementById("import-abbrechen");

let importDaten = null; // die gelesenen Backup-Daten, bis zur Bestätigung

// "25.09.2026" -> "2026-09-25"
function datumAusText(text) {
  const teile = String(text).trim().slice(0, 10).split(".");
  if (teile.length !== 3) {
    return null;
  }
  return teile[2] + "-" + teile[1] + "-" + teile[0];
}

// Liest die Daten aus einer Excel-Datei
function leseBackup(mappe) {
  // Fall 1: Blatt "Backup" vorhanden -> alles exakt wiederherstellen
  const backupBlatt = mappe.Sheets["Backup"];
  if (backupBlatt) {
    const zeilen = XLSX.utils.sheet_to_json(backupBlatt, { header: 1 });
    if (String(zeilen[0][0]).startsWith(BACKUP_KENNUNG)) {
      const json = zeilen.slice(1).map(zeile => zeile[0]).join("");
      return ergaenzeFelder(JSON.parse(json));
    }
  }

  // Fall 2: nur das Blatt "Ausgaben" -> Ausgaben (und Budgets) übernehmen
  const ausgabenBlatt = mappe.Sheets["Ausgaben"];
  if (!ausgabenBlatt) {
    return null;
  }
  const d = { budget: null, ausgaben: [], budgetVerlauf: {} };
  const zeilen = XLSX.utils.sheet_to_json(ausgabenBlatt, { header: 1 });
  for (const zeile of zeilen.slice(1)) {
    let datum = zeile[0];
    const betrag = Number(zeile[3]);
    if (!(datum instanceof Date)) {
      const text = datumAusText(datum);
      datum = text ? new Date(text + "T00:00:00") : null;
    }
    if (!datum || isNaN(datum) || isNaN(betrag) || betrag <= 0) {
      continue; // leere oder ungültige Zeile überspringen
    }
    let kategorie = String(zeile[2] || "");
    if (kategorie === OHNE_KATEGORIE) {
      kategorie = "";
    }
    const mittag = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate(), 12);
    d.ausgaben.push({ betrag: betrag, kategorie: kategorie, datum: mittag.toISOString() });
  }

  const periodenBlatt = mappe.Sheets["Perioden"];
  if (periodenBlatt) {
    for (const zeile of XLSX.utils.sheet_to_json(periodenBlatt, { header: 1 }).slice(1)) {
      const key = datumAusText(zeile[0]);
      const budget = Number(zeile[1]);
      if (key && budget > 0) {
        d.budgetVerlauf[key] = budget;
        d.budget = budget; // das letzte gilt als aktuelles Budget
      }
    }
  }

  // Abgeschlossene Perioden als "schon gefeiert" markieren (keine doppelten Punkte)
  const aktuellerKey = tagText(zeitraumStart());
  d.gefeiertePerioden = [];
  for (const ausgabe of d.ausgaben) {
    const key = tagText(zeitraumStart(new Date(ausgabe.datum)));
    if (key !== aktuellerKey && !d.gefeiertePerioden.includes(key)) {
      d.gefeiertePerioden.push(key);
    }
  }
  return ergaenzeFelder(d);
}

// Backup und aktuelle Daten zusammenführen: nichts geht verloren, nichts doppelt
function fuehreZusammen(backup, aktuell) {
  const schluessel = a => a.datum + "|" + a.betrag + "|" + a.kategorie;
  const imBackup = new Set(backup.ausgaben.map(schluessel));
  const ausgaben = backup.ausgaben.slice();
  for (const ausgabe of aktuell.ausgaben) {
    if (!imBackup.has(schluessel(ausgabe))) {
      ausgaben.push(ausgabe);
    }
  }
  ausgaben.sort((a, b) => new Date(a.datum) - new Date(b.datum));

  const vereinige = (a, b) => Array.from(new Set(a.concat(b)));
  return {
    budget: aktuell.budget ?? backup.budget,
    ausgaben: ausgaben,
    punkte: Math.max(backup.punkte, aktuell.punkte),
    eintraegeGesamt: Math.max(backup.eintraegeGesamt, aktuell.eintraegeGesamt, ausgaben.length),
    eintragTage: vereinige(backup.eintragTage, aktuell.eintragTage),
    challenges: Object.assign({}, backup.challenges, aktuell.challenges),
    abzeichen: vereinige(backup.abzeichen, aktuell.abzeichen),
    budgetVerlauf: Object.assign({}, backup.budgetVerlauf, aktuell.budgetVerlauf),
    gefeiertePerioden: vereinige(backup.gefeiertePerioden, aktuell.gefeiertePerioden)
  };
}

function waehleBackupDatei() {
  importDatei.value = ""; // damit dieselbe Datei auch zweimal gewählt werden kann
  importDatei.click();
}

importButton.addEventListener("click", waehleBackupDatei);
importSetup.addEventListener("click", waehleBackupDatei);

importDatei.addEventListener("change", function () {
  const datei = importDatei.files[0];
  if (!datei) {
    return;
  }
  ladeExcelBibliothek()
    .then(() => datei.arrayBuffer())
    .then(function (inhalt) {
      const mappe = XLSX.read(inhalt, { type: "array", cellDates: true });
      importDaten = leseBackup(mappe);
      if (importDaten === null || importDaten.ausgaben.length === 0) {
        zeigeToast("In dieser Datei habe ich keine Ausgaben gefunden 🤔");
        return;
      }
      const neu = fuehreZusammen(importDaten, daten).ausgaben.length - daten.ausgaben.length;
      importText.innerHTML =
        "Im Backup gefunden:<br><strong>" + importDaten.ausgaben.length + " Ausgaben</strong>, " +
        importDaten.punkte + " Punkte, " + importDaten.abzeichen.length + " Abzeichen<br><br>" +
        "Davon fehlen auf diesem Gerät: <strong>" + neu + " Ausgaben</strong><br><br>" +
        "Deine aktuellen Einträge bleiben erhalten.";
      importScreen.hidden = false;
    })
    .catch(function () {
      zeigeToast("Die Datei konnte nicht gelesen werden. Für den ersten Import braucht es Internet 🙂");
    });
});

importAbbrechen.addEventListener("click", function () {
  importDaten = null;
  importScreen.hidden = true;
});

importOk.addEventListener("click", function () {
  const vorher = daten.ausgaben.length;
  daten = fuehreZusammen(importDaten, daten);
  importDaten = null;
  importScreen.hidden = true;

  if (daten.budget !== null) {
    const aktuellerKey = tagText(zeitraumStart());
    if (daten.budgetVerlauf[aktuellerKey] === undefined) {
      daten.budgetVerlauf[aktuellerKey] = daten.budget;
    }
  }
  pruefeAbzeichen();
  speichereDaten();

  if (daten.budget === null) {
    zeigeSetup(); // im Backup war kein Budget, also jetzt eingeben
  } else {
    zeigeStart();
  }
  zeigePopup("✅", "Backup wiederhergestellt!",
    (daten.ausgaben.length - vorher) + " Ausgaben ergänzt.<br>Du hast jetzt " +
    daten.ausgaben.length + " Ausgaben und " + daten.punkte + " Punkte.");
});

// --- Streak ---
// Zählt Tage mit Einträgen. Ein verpasster Tag ist okay, erst 2 in Folge beenden den Streak.
function berechneStreak() {
  const tage = new Set(daten.eintragTage);
  const d = heute();
  if (!tage.has(tagText(d))) {
    d.setDate(d.getDate() - 1); // heute ist noch nicht vorbei
  }
  let anzahl = 0;
  let verpasstInFolge = 0;
  while (verpasstInFolge < 2) {
    if (tage.has(tagText(d))) {
      anzahl = anzahl + 1;
      verpasstInFolge = 0;
    } else {
      verpasstInFolge = verpasstInFolge + 1;
    }
    d.setDate(d.getDate() - 1);
  }
  return anzahl;
}

// --- Challenges ---
function heutigeChallenge() {
  const tagesNummer = Math.round(heute().getTime() / EIN_TAG);
  return CHALLENGES[tagesNummer % CHALLENGES.length];
}

function challengeFortschritt() {
  const challenge = heutigeChallenge();
  const heuteText = tagText(heute());
  let anzahl = 0;
  for (const ausgabe of daten.ausgaben) {
    const istHeute = tagText(new Date(ausgabe.datum)) === heuteText;
    const zaehlt = !challenge.nurMitKategorie || ausgabe.kategorie !== "";
    if (istHeute && zaehlt) {
      anzahl = anzahl + 1;
    }
  }
  return Math.min(anzahl, challenge.ziel);
}

function challengeErledigt() {
  return daten.challenges[tagText(heute())] === true;
}

function anzahlChallenges() {
  return Object.keys(daten.challenges).length;
}

// Gibt true zurück, wenn die Challenge gerade eben geschafft wurde
function pruefeChallenge() {
  if (challengeErledigt()) {
    return false;
  }
  if (challengeFortschritt() >= heutigeChallenge().ziel) {
    daten.challenges[tagText(heute())] = true;
    daten.punkte = daten.punkte + PUNKTE_CHALLENGE;
    return true;
  }
  return false;
}

// --- Abzeichen ---
// Gibt eine Liste der neu freigeschalteten Abzeichen zurück
function pruefeAbzeichen() {
  const neue = [];
  for (const abzeichen of ABZEICHEN) {
    if (!daten.abzeichen.includes(abzeichen.id) && abzeichen.erreicht()) {
      daten.abzeichen.push(abzeichen.id);
      neue.push(abzeichen);
    }
  }
  return neue;
}

function zeigeAbzeichenListe() {
  abzeichenListe.innerHTML = "";
  for (const abzeichen of ABZEICHEN) {
    const li = document.createElement("li");
    if (!daten.abzeichen.includes(abzeichen.id)) {
      li.className = "gesperrt";
    }
    li.innerHTML = "<span class='abzeichen-symbol'>" + abzeichen.symbol + "</span>" +
                   "<span>" + abzeichen.name + "</span>";
    abzeichenListe.appendChild(li);
  }
}

// --- Anzeige aktualisieren ---
function aktualisiereAnzeige() {
  const rest = daten.budget - summeAusgaben();
  restGesamtEl.textContent = chf(rest);
  restProTagEl.textContent = chf(rest / verbleibendeTage());
  punkteAnzeige.textContent = daten.punkte;

  const streak = berechneStreak();
  if (streak === 1) {
    streakAnzeige.textContent = "🔥 1 Tag in Folge";
  } else {
    streakAnzeige.textContent = "🔥 " + streak + " Tage in Folge";
  }

  const challenge = heutigeChallenge();
  challengeText.textContent = challenge.text;
  if (challengeErledigt()) {
    challengeStatus.textContent = "✅ Geschafft! +" + PUNKTE_CHALLENGE + " Punkte";
  } else {
    challengeStatus.textContent = challengeFortschritt() + " / " + challenge.ziel;
  }
}

// --- Belohnungen ---
let toastTimer = null;

function zeigeToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.hidden = true;
  }, 3500);
}

function zufaellig(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

function konfetti() {
  const farben = ["#7c5cff", "#ff6b9d", "#ffc93c", "#4cd4a0", "#4cb8ff"];
  for (let i = 0; i < 80; i++) {
    const teil = document.createElement("div");
    teil.className = "konfetti";
    teil.style.left = Math.random() * 100 + "vw";
    teil.style.background = zufaellig(farben);
    teil.style.animationDelay = Math.random() * 0.3 + "s";
    teil.style.setProperty("--drift", (Math.random() * 200 - 100) + "px");
    teil.style.setProperty("--drehung", Math.random() * 720 + "deg");
    teil.style.setProperty("--dauer", (1.5 + Math.random() * 1.5) + "s");
    document.body.appendChild(teil);
    setTimeout(function () {
      teil.remove();
    }, 3500);
  }
}

// --- Bildschirme wechseln ---
function zeigeStart() {
  setupScreen.hidden = true;
  listeScreen.hidden = true;
  verlaufScreen.hidden = true;
  auswertungScreen.hidden = true;
  abzeichenScreen.hidden = true;
  startScreen.hidden = false;
  aktualisiereAnzeige();
}

function zeigeSetup() {
  budgetInput.value = daten.budget ?? "";
  setupHinweis.hidden = true;
  startScreen.hidden = true;
  setupScreen.hidden = false;
}

// --- Budget einrichten ---
setupSpeichern.addEventListener("click", function () {
  const budget = parseFloat(budgetInput.value);
  if (isNaN(budget) || budget <= 0) {
    setupHinweis.textContent = "Trag hier dein Monatsbudget ein 🙂";
    setupHinweis.hidden = false;
    return;
  }
  daten.budget = budget;
  daten.budgetVerlauf[tagText(zeitraumStart())] = budget; // gilt für die aktuelle Periode
  speichereDaten();
  zeigeStart();
});

budgetAendern.addEventListener("click", zeigeSetup);

// --- Ausgabe erfassen und bearbeiten ---
let bearbeitenIndex = null; // null = neue Ausgabe, Zahl = bestehende bearbeiten
let loeschenBestaetigt = false; // wurde "Löschen" schon einmal angetippt?

function oeffneAusgabe(index) {
  if (typeof index === "number") {
    bearbeitenIndex = index;
    const ausgabe = daten.ausgaben[index];
    betragInput.value = ausgabe.betrag;
    kategorieInput.value = ausgabe.kategorie;
    ausgabeTitel.textContent = "Ausgabe bearbeiten";
    ausgabeLoeschen.hidden = false;
  } else {
    bearbeitenIndex = null;
    betragInput.value = "";
    kategorieInput.value = "";
    ausgabeTitel.textContent = "Neue Ausgabe";
    ausgabeLoeschen.hidden = true;
  }
  loeschenBestaetigt = false;
  ausgabeLoeschen.textContent = "Löschen";
  ausgabeHinweis.hidden = true;
  ausgabeScreen.hidden = false;
  betragInput.focus();
}

function schliesseAusgabe() {
  ausgabeScreen.hidden = true;
}

function nachAenderung() {
  speichereDaten();
  schliesseAusgabe();
  aktualisiereAnzeige();
  aktualisiereListe();
}

plusButton.addEventListener("click", function () {
  oeffneAusgabe();
});

ausgabeAbbrechen.addEventListener("click", schliesseAusgabe);

ausgabeForm.addEventListener("submit", function (event) {
  event.preventDefault(); // verhindert, dass die Seite neu lädt
  const betrag = parseFloat(betragInput.value);
  if (isNaN(betrag) || betrag <= 0) {
    ausgabeHinweis.textContent = "Nur noch den Betrag eintragen 🙂";
    ausgabeHinweis.hidden = false;
    return;
  }

  if (bearbeitenIndex === null) {
    // Neue Ausgabe speichern
    daten.ausgaben.push({
      betrag: betrag,
      kategorie: kategorieInput.value,
      datum: new Date().toISOString()
    });
    daten.eintraegeGesamt = daten.eintraegeGesamt + 1;
    const heuteText = tagText(heute());
    if (!daten.eintragTage.includes(heuteText)) {
      daten.eintragTage.push(heuteText);
    }

    // Punkte vergeben
    let neuePunkte = PUNKTE_EINGABE;
    if (kategorieInput.value !== "") {
      neuePunkte = neuePunkte + PUNKTE_KATEGORIE;
    }
    daten.punkte = daten.punkte + neuePunkte;
    let nachricht = zufaellig(LOB) + "  +" + neuePunkte + " Punkte";

    // Challenge prüfen (kurze Nachricht unten)
    if (pruefeChallenge()) {
      nachricht = nachricht + "\n🎯 Challenge geschafft! +" + PUNKTE_CHALLENGE;
    }

    // Abzeichen prüfen (Popup in der Mitte)
    zeigeNeueAbzeichen();

    nachAenderung();
    konfetti();
    zeigeToast(nachricht);
  } else {
    // Bestehende Ausgabe ändern
    daten.ausgaben[bearbeitenIndex].betrag = betrag;
    daten.ausgaben[bearbeitenIndex].kategorie = kategorieInput.value;
    nachAenderung();
    zeigeToast("Gespeichert ✓");
  }
});

ausgabeLoeschen.addEventListener("click", function () {
  if (!loeschenBestaetigt) {
    loeschenBestaetigt = true;
    ausgabeLoeschen.textContent = "Wirklich löschen? Nochmals tippen";
    return;
  }
  daten.ausgaben.splice(bearbeitenIndex, 1);
  nachAenderung();
  zeigeToast("Gelöscht ✓");
});

// --- Ausgaben-Liste (aktuelle Periode) ---
function eintragHTML(ausgabe) {
  const datum = new Date(ausgabe.datum).toLocaleDateString("de-CH", {
    day: "numeric",
    month: "short"
  });
  const kategorie = ausgabe.kategorie || OHNE_KATEGORIE;
  return "<span>" + datum + " · " + kategorie + "</span>" +
         "<strong>" + chf(ausgabe.betrag) + "</strong>";
}

function aktualisiereListe() {
  const start = zeitraumStart();
  listeZeitraum.textContent = periodeText(start);
  ausgabenListe.innerHTML = "";

  // Ausgaben dieses Zeitraums sammeln, mit ihrer Position im Speicher
  const eintraege = [];
  daten.ausgaben.forEach(function (ausgabe, index) {
    if (new Date(ausgabe.datum) >= start) {
      eintraege.push({ ausgabe: ausgabe, index: index });
    }
  });
  eintraege.reverse(); // neueste zuerst

  listeLeer.hidden = eintraege.length > 0;

  for (const eintrag of eintraege) {
    const li = document.createElement("li");
    li.innerHTML = eintragHTML(eintrag.ausgabe);
    li.addEventListener("click", function () {
      oeffneAusgabe(eintrag.index);
    });
    ausgabenListe.appendChild(li);
  }
}

listeOeffnen.addEventListener("click", function () {
  startScreen.hidden = true;
  listeScreen.hidden = false;
  aktualisiereListe();
});

listeSchliessen.addEventListener("click", zeigeStart);

// --- Verlauf-Seite ---
verlaufOeffnen.addEventListener("click", function () {
  listeScreen.hidden = true;
  verlaufScreen.hidden = false;
  zeigeVerlauf();
});

verlaufSchliessen.addEventListener("click", function () {
  verlaufScreen.hidden = true;
  listeScreen.hidden = false;
});

// --- Abzeichen-Seite ---
abzeichenOeffnen.addEventListener("click", function () {
  startScreen.hidden = true;
  abzeichenScreen.hidden = false;
  zeigePufferKarte();
  zeigeAbzeichenListe();
});

abzeichenSchliessen.addEventListener("click", zeigeStart);

// --- App starten ---
if (daten.budget !== null) {
  // Budget für die aktuelle Periode festhalten (wird von der letzten übernommen)
  const aktuellerKey = tagText(zeitraumStart());
  if (daten.budgetVerlauf[aktuellerKey] === undefined) {
    daten.budgetVerlauf[aktuellerKey] = daten.budget;
  }
  pruefePeriodenwechsel();
}
pruefeAbzeichen(); // bereits verdiente Abzeichen still nachtragen
speichereDaten();

if (daten.budget === null) {
  zeigeSetup();
} else {
  zeigeStart();
}
