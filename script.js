
// =====================================
// KOFFI-AGROKRO - SCRIPT GENERAL
// =====================================

const KEY = 'koffiAgrokroMemorialsV1';

const $ = selector => document.querySelector(selector);

// =====================================
// GESTION DES HOMMAGES
// =====================================

function readPeople() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

// Protection du contenu HTML
function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

// Calcul de l'âge au décès
function calculateAge(birth, death) {
    if (!birth || !death) return null;

    const b = new Date(birth + 'T00:00:00');
    const d = new Date(death + 'T00:00:00');

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

// Formatage des dates
function formatDate(date) {
    if (!date) return 'Non renseignée';

    const value = new Date(date + 'T00:00:00');

    if (Number.isNaN(value.getTime())) {
        return 'Non renseignée';
    }

    return value.toLocaleDateString('fr-FR');
}

// Affichage du mémorial
function renderMemorial() {

    const grid = $('#memorialGrid');
    const search = $('#memorialSearch');
    const count = $('#memorialCount');

    if (!grid) return;

    const query = search
        ? search.value.trim().toLowerCase()
        : '';

    const people = readPeople().filter(person => {

        const text = [
            person.name || '',
            person.quartier || '',
            person.place || ''
        ].join(' ').toLowerCase();

        return text.includes(query);
    });

    if (count) {
        count.textContent =
            people.length +
            (people.length > 1 ? ' hommages' : ' hommage');
    }

    if (!people.length) {
        grid.innerHTML = `
            <div class="empty-state">
                Aucune fiche trouvée.
                Les hommages validés apparaîtront ici.
            </div>
        `;
        return;
    }

    const groups = {};

    people.forEach(person => {

        const quartier =
            person.quartier || 'Quartier non renseigné';

        if (!groups[quartier]) {
            groups[quartier] = [];
        }

        groups[quartier].push(person);
    });

    const sortedQuartiers = Object.keys(groups).sort(
        (a, b) => a.localeCompare(b, 'fr', { numeric: true })
    );

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
                        alt="Portrait de ${escapeHTML(person.name || 'la personne honorée')}"
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

                        <h3>${escapeHTML(person.name || 'Nom non renseigné')}</h3>

                        <p>
                            Naissance :
                            ${formatDate(person.birth)}
                        </p>

                        <p>
                            Décès :
                            ${formatDate(person.death)}
                        </p>

                        <p>
                            <strong>
                                ${
                                    age === null
                                        ? 'Âge non calculable'
                                        : age + ' ans'
                                }
                            </strong>
                        </p>

                        ${
                            person.note
                                ? `<p>${escapeHTML(person.note)}</p>`
                                : ''
                        }

                    </div>

                </article>
            `;

        }).join('');

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

    }).join('');
}

// Recherche dans le mémorial
const searchInput = $('#memorialSearch');

if (searchInput) {
    searchInput.addEventListener('input', renderMemorial);
}

// Actualisation des hommages entre onglets
window.addEventListener('storage', event => {
    if (event.key === KEY) {
        renderMemorial();
    }
});

// =====================================
// MENU MOBILE
// =====================================

const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');

if (menuToggle && mainNav) {

    menuToggle.addEventListener('click', () => {

        const isOpen = mainNav.classList.toggle('open');

        menuToggle.setAttribute(
            'aria-expanded',
            String(isOpen)
        );

        menuToggle.textContent = isOpen ? '✕' : '☰';

    });

    mainNav.querySelectorAll('a').forEach(link => {

        link.addEventListener('click', () => {

            mainNav.classList.remove('open');

            menuToggle.setAttribute(
                'aria-expanded',
                'false'
            );

            menuToggle.textContent = '☰';

        });

    });

}

// =====================================
// ANNEE AUTOMATIQUE
// =====================================

const year = $('#year');

if (year) {
    year.textContent = new Date().getFullYear();
}

// =====================================
// AFFICHAGE INITIAL
// =====================================

renderMemorial();
