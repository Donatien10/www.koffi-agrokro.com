
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
// AFFICHAGE INITIAL
// =============================================

renderMemorial();
document.addEventListener("DOMContentLoaded", () => {
    const accueil = document.getElementById("accueil");

    if (!accueil) return;

 const imagesVillage = [
    "./07ddb9ef-2dee-4153-b75a-37cf729c03fc.png",
    "./images acceuil/38661747_1652628174862804_3766903459253583872_n.jpg",
    "./images acceuil/38801291_1652628141529474_6591800060827140096_n.jpg",
    "./images acceuil/image.jfif"
];
    let index = 0;

    function changerImage() {
        accueil.style.backgroundImage =
            `url("${imagesVillage[index]}")`;

        index = (index + 1) % imagesVillage.length;
    }

    changerImage();
    setInterval(changerImage, 5000);
});

// =============================================
// DÉFILEMENT DE L'IMAGE DU VILLAGE (QUARTIERS)
// =============================================

document.addEventListener("DOMContentLoaded", () => {
    const villageImg = document.getElementById("villageMainImg");

    if (!villageImg) return;

    // Liste des images qui vont défiler à côté des quartiers
    const villageImages = [
        "./les quartier du village/e5bd8bb2-d5b3-40f3-b8ee-789a40f4c249 (1).jpg",
        "./les quartier du village/0611117789547-web-tete.jpg",
        "./les quartier du village/BGS2D3MJI4YVUM65PBINSFQZBI.jpg"
    ];

    let currentIndex = 0;

    // Configuration de la transition fluide (fondu)
    villageImg.style.transition = "opacity 0.6s ease-in-out";

    function changeVillageImage() {
        // Effet de fondu sortant
        villageImg.style.opacity = 0;

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % villageImages.length;
            villageImg.src = villageImages[currentIndex];
            
            // Effet de fondu entrant
            villageImg.style.opacity = 1;
        }, 600); // Temps correspondant à la transition CSS
    }

    // Change l'image toutes les 4 secondes (4000 ms)
    setInterval(changeVillageImage, 4000);
});