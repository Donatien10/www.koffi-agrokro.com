
const SUGGESTIONS_ADMIN_URL =
  "https://whloiwfehqbhscilssbx.supabase.co";

const SUGGESTIONS_ADMIN_KEY =
  "sb_publishable_0nR5whwcOoke1vflByOcEQ_gArsisLh";

const suggestionsAdminDB = window.supabase.createClient(
  SUGGESTIONS_ADMIN_URL,
  SUGGESTIONS_ADMIN_KEY
);

document.addEventListener("DOMContentLoaded", () => {
  const liste = document.getElementById("liste-suggestions");
  const total = document.getElementById("totalSuggestions");
  const message = document.getElementById("messageSuggestions");

  if (!liste || !total || !message) {
    console.error("Les éléments HTML des suggestions sont introuvables.");
    return;
  }

  chargerSuggestions();

  async function chargerSuggestions() {
    liste.textContent = "Chargement des suggestions...";
    message.textContent = "";

    const { data, error } = await suggestionsAdminDB
      .from("suggestions")
      .select("id, nom, type, message, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      liste.textContent =
        "Impossible de charger les suggestions. Vérifiez les autorisations Supabase.";
      total.textContent = "0 suggestion";
      return;
    }

    total.textContent =
      data.length + (data.length > 1 ? " suggestions" : " suggestion");

    if (data.length === 0) {
      liste.textContent = "Aucune suggestion pour le moment.";
      return;
    }

    liste.replaceChildren();

    data.forEach((suggestion) => {
      const carte = document.createElement("article");
      carte.className = "suggestion-admin-card";

      const titre = document.createElement("h3");
      titre.textContent = suggestion.nom || "Visiteur";

      const type = document.createElement("p");
      type.textContent = "Type : " + (suggestion.type || "Non précisé");

      const contenu = document.createElement("p");
      contenu.textContent = suggestion.message || "";

      const statut = document.createElement("p");
      statut.textContent = "Statut : " + (suggestion.status || "Non défini");

      const date = document.createElement("small");
      date.textContent = suggestion.created_at
        ? new Date(suggestion.created_at).toLocaleString("fr-FR")
        : "Date inconnue";

      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.textContent = "Supprimer la suggestion";
      bouton.className = "btn-supprimer-suggestion";

      bouton.addEventListener("click", async () => {
        const confirmation = confirm(
          "Voulez-vous vraiment supprimer cette suggestion et toutes ses réponses ?"
        );

        if (!confirmation) return;

        bouton.disabled = true;
        bouton.textContent = "Suppression...";

        const { error: erreurReponses } = await suggestionsAdminDB
          .from("replies")
          .delete()
          .eq("suggestion_id", suggestion.id);

        if (erreurReponses) {
          console.error(erreurReponses);
          alert("Impossible de supprimer les réponses. Vérifiez les droits Supabase.");
          bouton.disabled = false;
          bouton.textContent = "Supprimer la suggestion";
          return;
        }

        const { error: erreurSuggestion } = await suggestionsAdminDB
          .from("suggestions")
          .delete()
          .eq("id", suggestion.id);

        if (erreurSuggestion) {
          console.error(erreurSuggestion);
          alert("Impossible de supprimer la suggestion. Vérifiez les droits Supabase.");
          bouton.disabled = false;
          bouton.textContent = "Supprimer la suggestion";
          return;
        }

        message.textContent = "Suggestion supprimée avec succès.";
        chargerSuggestions();
      });

      carte.append(
        titre,
        type,
        contenu,
        statut,
        date,
        bouton
      );

      liste.appendChild(carte);
    });
  }
});
