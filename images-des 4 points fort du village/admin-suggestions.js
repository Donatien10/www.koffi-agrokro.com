
/* =========================================
   GESTION ADMINISTRATEUR DES SUGGESTIONS
   KOFFI-AGROKRO
========================================= */

const suggestionsAdminDB = window.supabase.createClient(
  "https://whloiwfehqbhscilssbx.supabase.co",
  "sb_publishable_0nR5whwcOoke1vflByOcEQ_gArsisLh"
);

document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("liste-suggestions");
  const compteur = document.getElementById("totalSuggestions");
  const feedback = document.getElementById("messageSuggestions");

  if (!zone) return;

  function message(texte, erreur = false) {
    if (!feedback) return;
    feedback.textContent = texte;
    feedback.style.color = erreur ? "#a52b25" : "#174b3a";
  }

  function securiserTexte(valeur) {
    return String(valeur || "");
  }

  async function chargerSuggestionsAdmin() {
    zone.textContent = "Chargement des suggestions...";
    message("");

    const { data, error } = await suggestionsAdminDB
      .from("suggestions")
      .select("id, nom, type, message, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur de chargement :", error);
      zone.textContent = "Impossible de charger les suggestions.";
      message(error.message, true);
      return;
    }

    compteur.textContent =
      data.length + (data.length > 1 ? " suggestions" : " suggestion");

    zone.replaceChildren();

    if (data.length === 0) {
      zone.textContent = "Aucune suggestion enregistrée.";
      return;
    }

    for (const suggestion of data) {
      const carte = document.createElement("article");
      carte.className = "message-card";
      carte.style.border = "1px solid #ddd";
      carte.style.padding = "18px";
      carte.style.marginBottom = "15px";
      carte.style.borderRadius = "10px";

      const titre = document.createElement("h3");
      titre.textContent = suggestion.type || "Suggestion";

      const auteur = document.createElement("p");
      auteur.textContent = "Auteur : " + securiserTexte(suggestion.nom);

      const contenu = document.createElement("p");
      contenu.textContent = securiserTexte(suggestion.message);

      const statut = document.createElement("p");
      statut.textContent = "Statut : " + suggestion.status;

      const date = document.createElement("p");
      date.textContent = suggestion.created_at
        ? "Date : " + new Date(suggestion.created_at).toLocaleString("fr-FR")
        : "";

      const boutonSupprimer = document.createElement("button");
      boutonSupprimer.type = "button";
      boutonSupprimer.textContent = "Supprimer la suggestion";
      boutonSupprimer.style.background = "#b42318";
      boutonSupprimer.style.color = "white";
      boutonSupprimer.style.padding = "10px 15px";
      boutonSupprimer.style.border = "none";
      boutonSupprimer.style.borderRadius = "6px";
      boutonSupprimer.style.cursor = "pointer";

      boutonSupprimer.addEventListener("click", async () => {
        const confirmation = confirm(
          "Voulez-vous vraiment supprimer cette suggestion et toutes ses réponses ?"
        );

        if (!confirmation) return;

        boutonSupprimer.disabled = true;
        boutonSupprimer.textContent = "Suppression...";

        try {
          // Supprimer d'abord les réponses associées
          const { error: erreurReponses } = await suggestionsAdminDB
            .from("replies")
            .delete()
            .eq("suggestion_id", suggestion.id);

          if (erreurReponses) throw erreurReponses;

          // Supprimer ensuite la suggestion
          const { error: erreurSuggestion } = await suggestionsAdminDB
            .from("suggestions")
            .delete()
            .eq("id", suggestion.id);

          if (erreurSuggestion) throw erreurSuggestion;

          message("Suggestion et réponses supprimées.");
          await chargerSuggestionsAdmin();

        } catch (erreur) {
          console.error("Erreur de suppression :", erreur);
          message(
            "Suppression impossible : " + erreur.message,
            true
          );
          boutonSupprimer.disabled = false;
          boutonSupprimer.textContent = "Supprimer la suggestion";
        }
      });

      carte.append(
        titre,
        auteur,
        contenu,
        statut,
        date,
        boutonSupprimer
      );

      zone.appendChild(carte);
    }
  }

  chargerSuggestionsAdmin();

});
