
/* =========================================
   ADMINISTRATION - KOFFI-AGROKRO
   Gestion des fiches commémoratives
========================================= */

const CLE_MEMORIAL = "koffiAgrokroMemorialsV1";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("form-commemoratif");
  const liste = document.getElementById("liste-personnes");
  const champId = document.getElementById("fiche-id");
  const champNom = document.getElementById("nom");
  const champQuartier = document.getElementById("quartier");
  const champNaissance = document.getElementById("date-naissance");
  const champDeces = document.getElementById("date-deces");
  const champPhoto = document.getElementById("chemin-photo");
  const champMessage = document.getElementById("message");

  const boutonEnregistrer = document.getElementById("submitButton");
  const boutonAnnuler = document.getElementById("cancelEdit");
  const titreFormulaire = document.getElementById("formTitle");
  const messageAdmin = document.getElementById("adminMessage");
  const compteur = document.getElementById("totalFiches");

  // Vérification des éléments HTML
  if (!form || !liste) {
    console.error("Formulaire ou liste introuvable. Vérifiez admin.html.");
    return;
  }

  // Lire les fiches enregistrées
  function lireFiches() {
    try {
      return JSON.parse(localStorage.getItem(CLE_MEMORIAL) || "[]");
    } catch (erreur) {
      console.error("Erreur de lecture :", erreur);
      return [];
    }
  }

  // Sauvegarder les fiches
  function sauvegarderFiches(fiches) {
    localStorage.setItem(CLE_MEMORIAL, JSON.stringify(fiches));
  }

  // Sécuriser les textes affichés
  function securiserTexte(valeur = "") {
    return String(valeur).replace(/[&<>"']/g, caractere => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[caractere]);
  }

  // Afficher un message
  function afficherMessage(texte, erreur = false) {
    messageAdmin.textContent = texte;
    messageAdmin.style.color = erreur ? "#a52b25" : "#174b3a";
  }

  // Calculer l'âge au décès
  function calculerAge(naissance, deces) {
    if (!naissance || !deces) return "";

    const n = new Date(naissance + "T00:00:00");
    const d = new Date(deces + "T00:00:00");

    let age = d.getFullYear() - n.getFullYear();

    if (
      d.getMonth() < n.getMonth() ||
      (d.getMonth() === n.getMonth() && d.getDate() < n.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : "";
  }

  // Afficher toutes les fiches
  function afficherFiches() {
    const fiches = lireFiches();

    compteur.textContent =
      fiches.length + (fiches.length > 1 ? " fiches" : " fiche");

    liste.innerHTML = "";

    if (fiches.length === 0) {
      liste.innerHTML = `
        <p class="empty-text">
          Aucune fiche enregistrée pour le moment.
        </p>
      `;
      return;
    }

    fiches.forEach((fiche, index) => {
      const carte = document.createElement("article");
      carte.className = "personne-card";

      carte.innerHTML = `
        ${
          fiche.photo
            ? `<img src="${securiserTexte(fiche.photo)}"
                alt="Photo de ${securiserTexte(fiche.name)}">`
            : ""
        }

        <div class="personne-infos">
          <h3>${securiserTexte(fiche.name)}</h3>
          <p><strong>Quartier :</strong>
            ${securiserTexte(fiche.quartier || "Non renseigné")}
          </p>
          <p><strong>Naissance :</strong>
            ${securiserTexte(fiche.birth || "Non renseignée")}
          </p>
          <p><strong>Décès :</strong>
            ${securiserTexte(fiche.death || "Non renseigné")}
          </p>
          <p><strong>Âge au décès :</strong>
            ${securiserTexte(String(calculerAge(fiche.birth, fiche.death)))}
            ${fiche.birth && fiche.death ? "ans" : ""}
          </p>
          <p>${securiserTexte(fiche.note || "")}</p>
        </div>

        <div class="personne-actions">
          <button type="button" class="btn-edit" data-action="modifier"
            data-index="${index}">Modifier</button>

          <button type="button" class="btn-delete" data-action="supprimer"
            data-index="${index}">Supprimer</button>
        </div>
      `;

      liste.appendChild(carte);
    });
  }

  // Ajouter ou modifier une fiche
  form.addEventListener("submit", event => {
    event.preventDefault();

    const nom = champNom.value.trim();
    const quartier = champQuartier.value;
    const naissance = champNaissance.value;
    const deces = champDeces.value;

    if (!nom || !quartier) {
      afficherMessage("Veuillez renseigner le nom et le quartier.", true);
      return;
    }

    if (naissance && deces && deces < naissance) {
      afficherMessage(
        "La date de décès ne peut pas précéder la naissance.",
        true
      );
      return;
    }

    const fiches = lireFiches();
    const id = champId.value;

    const fiche = {
      id: id || (Date.now().toString() + Math.random().toString(16).slice(2)),
      name: nom,
      quartier: quartier,
      birth: naissance,
      death: deces,
      photo: champPhoto.value.trim(),
      note: champMessage.value.trim()
    };

    try {
      if (id) {
        const index = fiches.findIndex(
          personne => String(personne.id) === id
        );

        if (index === -1) {
          afficherMessage("Fiche introuvable.", true);
          return;
        }

        fiches[index] = fiche;
        sauvegarderFiches(fiches);
        afficherMessage("La fiche a été modifiée avec succès.");
      } else {
        fiches.unshift(fiche);
        sauvegarderFiches(fiches);
        afficherMessage("La personne a été enregistrée avec succès.");
      }

      form.reset();
      champId.value = "";
      boutonEnregistrer.textContent = "Enregistrer la fiche";
      boutonAnnuler.hidden = true;
      titreFormulaire.textContent = "Ajouter une personne disparue";

      afficherFiches();

    } catch (erreur) {
      console.error("Erreur d'enregistrement :", erreur);
      afficherMessage("Erreur lors de l'enregistrement de la fiche.", true);
    }
  });

  // Modifier ou supprimer une fiche
  liste.addEventListener("click", event => {
    const bouton = event.target.closest("button[data-action]");
    if (!bouton) return;

    const index = Number(bouton.dataset.index);
    const fiches = lireFiches();
    const fiche = fiches[index];

    if (!fiche) return;

    if (bouton.dataset.action === "modifier") {
      champId.value = fiche.id || "";
      champNom.value = fiche.name || "";
      champQuartier.value = fiche.quartier || "";
      champNaissance.value = fiche.birth || "";
      champDeces.value = fiche.death || "";
      champPhoto.value = fiche.photo || "";
      champMessage.value = fiche.note || "";

      titreFormulaire.textContent = "Modifier une fiche";
      boutonEnregistrer.textContent = "Enregistrer les modifications";
      boutonAnnuler.hidden = false;

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Voulez-vous vraiment supprimer cette fiche ?")) {
        return;
      }

      fiches.splice(index, 1);
      sauvegarderFiches(fiches);
      afficherFiches();
      afficherMessage("La fiche a été supprimée.");
    }
  });

  // Annuler une modification
  boutonAnnuler.addEventListener("click", () => {
    form.reset();
    champId.value = "";
    titreFormulaire.textContent = "Ajouter une personne disparue";
    boutonEnregistrer.textContent = "Enregistrer la fiche";
    boutonAnnuler.hidden = true;
    afficherMessage("");
  });

  // Actualiser la liste si un autre onglet modifie les fiches
  window.addEventListener("storage", event => {
    if (event.key === CLE_MEMORIAL) {
      afficherFiches();
    }
  });

  // Premier affichage
  afficherFiches();

});
