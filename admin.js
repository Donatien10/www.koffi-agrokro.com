/* =========================================
   ADMINISTRATION - KOFFI-AGROKRO
   Gestion des fiches commémoratives et des informations
========================================= */

const CLE_MEMORIAL = "koffiAgrokroMemorialsV1";
const CLE_INFORMATIONS = "informations_village";

document.addEventListener("DOMContentLoaded", () => {

  // --- 1. GESTION DES FICHES COMMÉMORATIVES ---
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

  if (!form || !liste) {
    console.error("Formulaire ou liste introuvable. Vérifiez admin.html.");
    return;
  }

  function lireFiches() {
    try {
      return JSON.parse(localStorage.getItem(CLE_MEMORIAL) || "[]");
    } catch (erreur) {
      console.error("Erreur de lecture :", erreur);
      return [];
    }
  }

  function sauvegarderFiches(fiches) {
    localStorage.setItem(CLE_MEMORIAL, JSON.stringify(fiches));
  }

  function securiserTexte(valeur = "") {
    return String(valeur).replace(/[&<>"']/g, caractere => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[caractere]);
  }

  function afficherMessage(texte, erreur = false) {
    if (!messageAdmin) return;
    messageAdmin.textContent = texte;
    messageAdmin.style.color = erreur ? "#a52b25" : "#174b3a";
  }

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

  function afficherFiches() {
    const fiches = lireFiches();
    if (compteur) {
      compteur.textContent = fiches.length + (fiches.length > 1 ? " fiches" : " fiche");
    }
    liste.innerHTML = "";

    if (fiches.length === 0) {
      liste.innerHTML = `<p class="empty-text">Aucune fiche enregistrée pour le moment.</p>`;
      return;
    }

    fiches.forEach((fiche, index) => {
      const carte = document.createElement("article");
      carte.className = "personne-card";

      carte.innerHTML = `
        ${fiche.photo ? `<img src="${securiserTexte(fiche.photo)}" alt="Photo de ${securiserTexte(fiche.name)}">` : ""}
        <div class="personne-infos">
          <h3>${securiserTexte(fiche.name)}</h3>
          <p><strong>Quartier :</strong> ${securiserTexte(fiche.quartier || "Non renseigné")}</p>
          <p><strong>Naissance :</strong> ${securiserTexte(fiche.birth || "Non renseignée")}</p>
          <p><strong>Décès :</strong> ${securiserTexte(fiche.death || "Non renseigné")}</p>
          <p><strong>Âge au décès :</strong> ${securiserTexte(String(calculerAge(fiche.birth, fiche.death)))} ${fiche.birth && fiche.death ? "ans" : ""}</p>
          <p>${securiserTexte(fiche.note || "")}</p>
        </div>
        <div class="personne-actions">
          <button type="button" class="btn-edit" data-action="modifier" data-index="${index}">Modifier</button>
          <button type="button" class="btn-delete" data-action="supprimer" data-index="${index}">Supprimer</button>
        </div>
      `;
      liste.appendChild(carte);
    });
  }

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
      afficherMessage("La date de décès ne peut pas précéder la naissance.", true);
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
        const index = fiches.findIndex(personne => String(personne.id) === id);
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
      if (boutonAnnuler) boutonAnnuler.hidden = true;
      if (titreFormulaire) titreFormulaire.textContent = "Ajouter une personne disparue";
      afficherFiches();
    } catch (erreur) {
      console.error("Erreur d'enregistrement :", erreur);
      afficherMessage("Erreur lors de l'enregistrement de la fiche.", true);
    }
  });

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

      if (titreFormulaire) titreFormulaire.textContent = "Modifier une fiche";
      boutonEnregistrer.textContent = "Enregistrer les modifications";
      if (boutonAnnuler) boutonAnnuler.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Voulez-vous vraiment supprimer cette fiche ?")) return;
      fiches.splice(index, 1);
      sauvegarderFiches(fiches);
      afficherFiches();
      afficherMessage("La fiche a été supprimée.");
    }
  });

  if (boutonAnnuler) {
    boutonAnnuler.addEventListener("click", () => {
      form.reset();
      champId.value = "";
      if (titreFormulaire) titreFormulaire.textContent = "Ajouter une personne disparue";
      boutonEnregistrer.textContent = "Enregistrer la fiche";
      boutonAnnuler.hidden = true;
      afficherMessage("");
    });
  }

  window.addEventListener("storage", event => {
    if (event.key === CLE_MEMORIAL) afficherFiches();
  });

  afficherFiches();


  // --- 2. GESTION DES INFORMATIONS DU VILLAGE ---
  const formInformation = document.getElementById("form-information");
  const adminList = document.getElementById("adminInformationsList");

  function chargerAdminInformations() {
    if (!adminList) return;
    const infos = JSON.parse(localStorage.getItem(CLE_INFORMATIONS) || "[]");

    if (infos.length === 0) {
      adminList.innerHTML = `<p class="empty-text" style="color: #888; font-style: italic;">Aucune information enregistrée pour le moment.</p>`;
      return;
    }

    adminList.innerHTML = infos.map((info, index) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #eee;">
        <div>
          <strong style="color: #1a1a1a; font-size: 15px;">${securiserTexte(info.titre)}</strong>
          <span style="font-size: 12px; color: #a67c2e; font-weight: bold; margin-left: 10px;">[${securiserTexte(info.categorie)}]</span>
          <span style="font-size: 12px; color: #666; margin-left: 5px;">- ${securiserTexte(info.date)}</span>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #555;">${securiserTexte(info.description.substring(0, 90))}...</p>
        </div>
        <button type="button" class="btn-delete-info" data-index="${index}" style="background-color: #d9534f; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600;">Supprimer</button>
      </div>
    `).join("");
  }

  if (adminList) {
    adminList.addEventListener("click", event => {
      const bouton = event.target.closest(".btn-delete-info");
      if (!bouton) return;

      const index = Number(bouton.dataset.index);
      if (confirm("Voulez-vous vraiment supprimer cette information du site ?")) {
        let infos = JSON.parse(localStorage.getItem(CLE_INFORMATIONS) || "[]");
        infos.splice(index, 1);
        localStorage.setItem(CLE_INFORMATIONS, JSON.stringify(infos));
        chargerAdminInformations();
      }
    });
  }

  if (formInformation) {
    formInformation.addEventListener("submit", function(e) {
      e.preventDefault();

      const nouvelleInfo = {
        id: Date.now().toString(),
        titre: document.getElementById("info-titre").value.trim(),
        date: document.getElementById("info-date").value,
        categorie: document.getElementById("info-categorie").value,
        description: document.getElementById("info-description").value.trim(),
        image: document.getElementById("info-image").value.trim() // Récupération de l'image
      };

      let informations = JSON.parse(localStorage.getItem(CLE_INFORMATIONS) || "[]");
      informations.unshift(nouvelleInfo);
      localStorage.setItem(CLE_INFORMATIONS, JSON.stringify(informations));

      alert("L'information a été publiée avec succès !");
      formInformation.reset();
      chargerAdminInformations();
    });
  }

  chargerAdminInformations();
});

// --- 3. AFFICHAGE SUR LA PAGE D'ACCUEIL (index.html) ---
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("informationsGrid");
  if (!grid) return;

  const infos = JSON.parse(localStorage.getItem(CLE_INFORMATIONS) || "[]");

  if (infos.length === 0) {
    grid.innerHTML = `<p class="empty-text">Aucune information publiée pour le moment.</p>`;
    return;
  }

  grid.innerHTML = infos.map(info => `
    <article class="info-card">
      ${info.image 
        ? `<div class="card-icon"><img src="${info.image}" alt="${info.titre}"></div>` 
        : `<div style="background:#e5e7eb; height:150px; display:flex; align-items:center; justify-content:center; color:#6b7280; font-weight:bold;">Information</div>`
      }
      <div style="padding: 15px;">
        <span style="font-size:11px; color:#a67c2e; font-weight:bold; text-transform:uppercase; display:block; margin-bottom: 6px;">${info.categorie} • ${info.date}</span>
        <h3 style="margin-top:0;">${info.titre}</h3>
        <p>${info.description}</p>
      </div>
    </article>
  `).join("");
});