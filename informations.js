document.addEventListener("DOMContentLoaded", () => {
  const formInfo = document.getElementById("form-information");
  const grid = document.getElementById("informationsGrid");

  // Charger les informations enregistrées (ici en LocalStorage pour l'exemple, ou via Supabase)
  function chargerInformations() {
    if (!grid) return;
    const infos = JSON.parse(localStorage.getItem("koffi_infos")) || [];
    
    if (infos.length === 0) {
      grid.innerHTML = `<p class="empty-text">Aucune information publiée pour le moment.</p>`;
      return;
    }

    grid.innerHTML = infos.map(info => `
      <article class="info-card">
        <span class="badge-cat" style="font-size:11px; color:#d4af37; font-weight:bold; text-transform:uppercase;">${info.categorie} • ${info.date}</span>
        <h3>${info.titre}</h3>
        <p>${info.description}</p>
      </article>
    `).join("");
  }

  // Enregistrer une nouvelle information depuis l'admin
  if (formInfo) {
    formInfo.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const nouvelleInfo = {
        titre: document.getElementById("info-titre").value,
        date: document.getElementById("info-date").value,
        categorie: document.getElementById("info-categorie").value,
        description: document.getElementById("info-description").value
      };

      const infos = JSON.parse(localStorage.getItem("koffi_infos")) || [];
      infos.unshift(nouvelleInfo); // Ajoute en premier
      localStorage.setItem("koffi_infos", JSON.stringify(infos));

      alert("Information publiée avec succès !");
      formInfo.reset();
    });
  }

  chargerInformations();
});