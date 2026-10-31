
/* =========================================
   CONFIGURATION SUPABASE
========================================= */

const SUPABASE_URL = "COLLE_ICI_TON_PROJECT_URL";
const SUPABASE_ANON_KEY = "COLLE_ICI_TA_CLE_PUBLIQUE";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* =========================================
   INITIALISATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const year = document.getElementById("currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  chargerSuggestionsPubliees();
});

/* =========================================
   CHARGER LES SUGGESTIONS PUBLIÉES
========================================= */

async function chargerSuggestionsPubliees() {

  const zone = document.getElementById("publishedSuggestions");

  zone.textContent = "Chargement des suggestions...";

  try {

    const { data, error } = await db
      .from("suggestions")
      .select("id,nom,type,message,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;

    zone.replaceChildren();

    if (!data || data.length === 0) {
      zone.textContent = "Aucune suggestion publiée pour le moment.";
      return;
    }

    for (const suggestion of data) {

      const carte = document.createElement("article");
      carte.className = "message-card";

      const titre = document.createElement("h3");
      titre.textContent = suggestion.type || "Message";

      const auteur = document.createElement("p");
      auteur.className = "muted";
      auteur.textContent =
        "Publié par : " + (suggestion.nom || "Anonyme");

      const message = document.createElement("p");
      message.className = "message-text";
      message.textContent = suggestion.message || "";

      const date = document.createElement("p");
      date.className = "status";
      date.textContent = suggestion.created_at
        ? "Date : " +
          new Date(suggestion.created_at).toLocaleDateString("fr-FR")
        : "";

      const titreReponses = document.createElement("h4");
      titreReponses.textContent = "Réponses";

      const listeReponses = document.createElement("div");
      listeReponses.className = "reply-list";

      carte.append(
        titre,
        auteur,
        message,
        date,
        titreReponses,
        listeReponses
      );

      await chargerReponses(suggestion.id, listeReponses);

      // Formulaire de réponse
      const formulaire = document.createElement("form");
      formulaire.className = "reply-form";

      const labelNom = document.createElement("label");
      labelNom.textContent = "Votre nom";

      const champNom = document.createElement("input");
      champNom.type = "text";
      champNom.maxLength = 100;
      champNom.required = true;

      const labelMessage = document.createElement("label");
      labelMessage.textContent = "Votre réponse";

      const champMessage = document.createElement("textarea");
      champMessage.rows = 3;
      champMessage.maxLength = 2000;
      champMessage.required = true;

      const bouton = document.createElement("button");
      bouton.className = "button";
      bouton.type = "submit";
      bouton.textContent = "Envoyer ma réponse";

      const feedback = document.createElement("p");
      feedback.className = "feedback";
      feedback.setAttribute("role", "status");

      formulaire.append(
        labelNom,
        champNom,
        labelMessage,
        champMessage,
        bouton,
        feedback
      );

      formulaire.addEventListener("submit", async event => {

        event.preventDefault();

        const nom = champNom.value.trim();
        const texte = champMessage.value.trim();

        if (!nom || !texte) {
          feedback.textContent = "Veuillez remplir les deux champs.";
          return;
        }

        bouton.disabled = true;
        feedback.textContent = "Envoi de votre réponse...";

        try {

          const { error } = await db
            .from("replies")
            .insert({
              suggestion_id: suggestion.id,
              nom: nom,
              message: texte,
              status: "pending"
            });

          if (error) throw error;

          formulaire.reset();

          feedback.textContent =
            "Merci ! Votre réponse attend la validation de l'administration.";

        } catch (error) {

          console.error(error);

          feedback.textContent =
            "Impossible d'envoyer votre réponse. Réessayez plus tard.";

        }

        bouton.disabled = false;
      });

      carte.appendChild(formulaire);
      zone.appendChild(carte);
    }

  } catch (error) {

    console.error("Erreur suggestions :", error);

    zone.textContent =
      "Impossible de charger les suggestions. Vérifiez la configuration Supabase.";
  }
}

/* =========================================
   CHARGER LES RÉPONSES PUBLIÉES
========================================= */

async function chargerReponses(suggestionId, zone) {

  const { data, error } = await db
    .from("replies")
    .select("id,nom,message,created_at")
    .eq("suggestion_id", suggestionId)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  zone.replaceChildren();

  if (error) {

    console.error(error);
    zone.textContent = "Impossible de charger les réponses.";
    return;
  }

  if (!data || data.length === 0) {
    zone.textContent = "Aucune réponse pour le moment.";
    return;
  }

  data.forEach(reponse => {

    const element = document.createElement("div");
    element.className = "reply-item";

    const auteur = document.createElement("strong");
    auteur.textContent = reponse.nom || "Anonyme";

    const texte = document.createElement("p");
    texte.textContent = reponse.message || "";

    element.append(auteur, texte);
    zone.appendChild(element);
  });
}
