
// =============================================
// KOFFI-AGROKRO - SCRIPT GENERAL
// =============================================

// Clé utilisée pour enregistrer les hommages
const KEY = "koffiAgrokroMemorialsV1";

// Sélecteur simplifié
const $ = selector => document.querySelector(selector);


// =============================================
// LECTURE DES HOMMAGES
// =============================================

function readPeople() {
    try {
        const data = JSON.parse(localStorage.getItem(KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur de lecture des hommages :", error);
        return [];
    }
}


// =============================================
// PROTECTION DU CONTENU HTML
// =============================================

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}


// =============================================
// CALCUL DE L'ÂGE AU DÉCÈS
// =============================================

function calculateAge(birth, death) {
    if (!birth || !death) return null;

    const b = new Date(birth + "T00:00:00");
    const d = new Date(death + "T00:00:00");

    if (
        Number.isNaN(b.getTime()) ||
        Number.isNaN(d.getTime()) ||
        d < b
    ) {
        return null;
    }

    let age = d.getFullYear() - b.getFullYear();

    if (
        d.getMonth() < b.getMonth() ||
        (
            d.getMonth() === b.getMonth() &&
            d.getDate() < b.getDate()
        )
    ) {
        age--;
    }

    return age;
}


// =============================================
// FORMATAGE DES DATES
// =============================================

function formatDate(date) {
    if (!date) return "Non renseignée";

    const value = new Date(date + "T00:00:00");

    if (Number.isNaN(value.getTime())) {
        return "Non renseignée";
    }

    return value.toLocaleDateString("fr-FR");
}


// =============================================
// AFFICHAGE DU MÉMORIAL
// =============================================

function renderMemorial() {
    const grid = $("#memorialGrid");
    const search = $("#memorialSearch");
    const count = $("#memorialCount");

    if (!grid) return;

    const query = search
        ? search.value.trim().toLowerCase()
        : "";

    const people = readPeople().filter(person => {
        const text = [
            person.name || "",
            person.quartier || "",
            person.place || ""
        ].join(" ").toLowerCase();

        return text.includes(query);
    });

    if (count) {
        count.textContent =
            people.length +
            (people.length > 1 ? " hommages" : " hommage");
    }

    if (!people.length) {
        grid.innerHTML = `
            <div class="empty-state">
                Aucun hommage enregistré pour le moment.
            </div>
        `;
        return;
    }

    // Regroupement par quartier
    const groups = {};

    people.forEach(person => {
        const quartier =
            person.quartier || "Quartier non renseigné";

        if (!groups[quartier]) {
            groups[quartier] = [];
        }

        groups[quartier].push(person);
    });

    const sortedQuartiers = Object.keys(groups).sort(
        (a, b) => a.localeCompare(b, "fr", { numeric: true })
    );

    // Création des cartes
    grid.innerHTML = sortedQuartiers.map(quartier => {
        const cards = groups[quartier].map(person => {
            const age = calculateAge(
                person.birth,
                person.death
            );

            const photo = person.photo
                ? `
                    <img
                        class="memorial-photo"
                        src="${escapeHTML(person.photo)}"
                        alt="Portrait de ${escapeHTML(person.name || "la personne honorée")}"
                        loading="lazy"
                    >
                `
                : `
                    <div class="memorial-photo photo-placeholder">
                        👤
                    </div>
                `;

            return `
                <article class="memorial-card">
                    ${photo}

                    <div class="memorial-info">
                        <h3>${escapeHTML(person.name || "Nom non renseigné")}</h3>

                        <p>
                            <strong>Naissance :</strong>
                            ${formatDate(person.birth)}
                        </p>

                        <p>
                            <strong>Décès :</strong>
                            ${formatDate(person.death)}
                        </p>

                        <p>
                            <strong>Âge :</strong>
                            ${
                                age === null
                                    ? "Non calculable"
                                    : age + " ans"
                            }
                        </p>

                        ${
                            person.note
                                ? `<p>${escapeHTML(person.note)}</p>`
                                : ""
                        }
                    </div>
                </article>
            `;
        }).join("");

        return `
            <section class="memorial-group">
                <h3 class="memorial-group-title">
                    ${escapeHTML(quartier)}
                </h3>

                <div class="memorial-group-grid">
                    ${cards}
                </div>
            </section>
        `;
    }).join("");
}


// =============================================
// RECHERCHE DES PERSONNES
// =============================================

const searchInput = $("#memorialSearch");

if (searchInput) {
    searchInput.addEventListener("input", renderMemorial);
}


// =============================================
// ACTUALISATION ENTRE LES ONGLETS
// =============================================

window.addEventListener("storage", event => {
    if (event.key === KEY) {
        renderMemorial();
    }
});


// =============================================
// MENU MOBILE
// =============================================

const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.textContent = "☰";
        });
    });
}


// =============================================
// ANNÉE AUTOMATIQUE
// =============================================

const year = $("#year");

if (year) {
    year.textContent = new Date().getFullYear();
}


// =============================================
// DÉFILEMENT AUTOMATIQUE DES IMAGES D'ACCUEIL
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    const accueil = document.querySelector("#accueil");

    if (!accueil) return;

    // LES IMAGES DE LA PAGE D'ACCUEIL
    const imagesAccueil = [
    "./07ddb9ef-2dee-4153-b75a-37cf729c03fc.png",
    "./831b8e48-253b-41eb-898d-6d93602501a4.jfif",
    "./d037e192-cfc6-42a3-a68c-522a1481fd43.jfif",
    "./a6d1dab1-312c-4795-8963-0561a5505670.jfif"
];

    let imageActuelle = 0;

    // Préchargement des images
    imagesAccueil.forEach(src => {
        const image = new Image();
        image.src = src;
    });

    function changerImageAccueil() {

        accueil.style.backgroundImage = `
            linear-gradient(
                rgba(0, 0, 0, 0.50),
                rgba(0, 0, 0, 0.50)
            ),
            url("${imagesAccueil[imageActuelle]}")
        `;

        imageActuelle =
            (imageActuelle + 1) % imagesAccueil.length;
    }

    // Première image
    changerImageAccueil();

    // Changement toutes les 5 secondes
    setInterval(changerImageAccueil, 5000);

});

// =============================================
// DÉFILEMENT AUTOMATIQUE DES IMAGES DU VILLAGE
// =============================================

document.addEventListener("DOMContentLoaded", () => {
    const villageImg = document.getElementById("villageMainImg");

    if (!villageImg) return;

    // LISTE DES IMAGES : Ajoutez vos nouvelles images ici au fur et à mesure !
    const villageImages = [
        "./photo pour le site/e5bd8bb2-d5b3-40f3-b8ee-789a40f4c249 (1).jfif", // Image 1 actuelle
        "./photo pour le site/a1c95f2b-cf51-422b-b6cf-a443e2a65f96.jfif",             // Image 2 à ajouter
        "./photo pour le site/19d63164-0a1e-4000-b2b0-38ec6fd73ad8.jfif",          // Image 3 à ajouter
        // Mettez ici d'autres images de votre choix de la même façon :
        // "./votre-dossier/nom-de-la-photo.jpg",
    ];

    let currentIndex = 0;

    // Applique un effet de fondu doux
    villageImg.style.transition = "opacity 0.6s ease-in-out";

    function changeVillageImage() {
        // Effet de fondu sortant (l'image s'efface)
        villageImg.style.opacity = 0;

        setTimeout(() => {
            // Passe à l'image suivante dans la liste
            currentIndex = (currentIndex + 1) % villageImages.length;
            villageImg.src = villageImages[currentIndex];
            
            // Effet de fondu entrant (la nouvelle image apparaît)
            villageImg.style.opacity = 1;
        }, 600); // Temps de la transition
    }

    // Change l'image automatiquement toutes les 4 secondes (4000 millisecondes)
    setInterval(changeVillageImage, 4000);
});


// =============================================
// ACCORDÉONS
// =============================================

document.querySelectorAll(".accordion-btn").forEach(button => {

    button.addEventListener("click", () => {

        const accordion = button.parentElement;

        accordion.classList.toggle("active");

    });

});


// =============================================
// AFFICHAGE INITIAL DU MÉMORIAL
// =============================================

renderMemorial();


document.addEventListener("DOMContentLoaded", function () {
  const assoButtons = document.querySelectorAll(".asso-tab-btn");
  const galleries = document.querySelectorAll(".asso-gallery");

  assoButtons.forEach(button => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");

      // Masquer toutes les galeries
      galleries.qforEach(gallery => {
        gallery.style.display = "none";
      });

      // Afficher uniquement la galerie ciblée
      const targetGallery = document.getElementById(targetId);
      if (targetGallery) {
        targetGallery.style.display = "block";
        // Faire défiler doucement la page vers les photos
        targetGallery.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});