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
  { id: "periode6", symbol: "🌳", name: "6 Perioden dabei", erreicht: () => vergangenePerioden().length >= 6 }
];

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

const abzeichenScreen = document.getElementById("abzeichen-screen");
const abzeichenListe = document.getElementById("abzeichen-liste");
const abzeichenOeffnen = document.getElementById("abzeichen-oeffnen");
const abzeichenSchliessen = document.getElementById("abzeichen-schliessen");

const popupScreen = document.getElementById("popup-screen");
const popupSymbol = document.getElementById("popup-symbol");
const popupTitel = document.getElementById("popup-titel");
const popupText = document.getElementById("popup-text");
const popupOk = document.getElementById("popup-ok");

const toast = document.getElementById("toast");

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

  // Fehlende Felder ergänzen (für ältere gespeicherte Daten)
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

function zeigePopup(symbol, titel, text) {
  popupWarteschlange.push({ symbol: symbol, titel: titel, text: text });
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
  popupScreen.hidden = false;
}

popupOk.addEventListener("click", naechstesPopup);

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

  // Erinnerung ans Pufferkonto, falls etwas übrig ist
  if (letzte.ueberschuss > 0) {
    text = text + "<br><br>💸 <strong>Pufferkonto nicht vergessen:</strong><br>" +
           "Überweise " + chf(letzte.ueberschuss) + " auf dein Pufferkonto.";
  }

  // Neue Abzeichen direkt darunter anhängen
  const neue = pruefeAbzeichen();
  if (neue.length > 0) {
    text = text + "<br><br>Neue Abzeichen:<br>" + abzeichenAlsText(neue);
  }

  zeigePopup(symbol, titel, text);
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
  const kategorie = ausgabe.kategorie || "Ohne Kategorie";
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