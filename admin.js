
const KEY = 'koffiAgrokroMemorialsV1';

const form = document.querySelector('#personForm');
const list = document.querySelector('#adminList');

function readPeople() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function savePeople(people) {
  localStorage.setItem(KEY, JSON.stringify(people));
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function renderAdminList() {
  if (!list) return;

  const people = readPeople();

  if (people.length === 0) {
    list.innerHTML = `
      <p class="admin-help">
        Aucune fiche enregistrée pour le moment.
      </p>
    `;
    return;
  }

  list.innerHTML = people.map((person, index) => `
    <div class="admin-item">
      <span>
        <strong>${escapeHTML(person.name)}</strong><br>
        ${escapeHTML(person.quartier || 'Quartier non renseigné')}
        · Décès : ${escapeHTML(person.death || 'Non renseigné')}
      </span>

      <button
        type="button"
        class="delete-btn"
        data-index="${index}">
        Supprimer
      </button>
    </div>
  `).join('');

  list.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);

      if (!Number.isInteger(index)) return;

      if (confirm('Voulez-vous vraiment supprimer cette fiche ?')) {
        const people = readPeople();

        people.splice(index, 1);
        savePeople(people);
        renderAdminList();
      }
    });
  });
}

// Enregistrement d'une nouvelle personne
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(form);
    const person = Object.fromEntries(formData.entries());

    person.name = (person.name || '').trim();
    person.quartier = (person.quartier || '').trim();
    person.photo = (person.photo || '').trim();
    person.note = (person.note || '').trim();

    if (!person.name || !person.quartier ||
        !person.birth || !person.death) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    if (person.death < person.birth) {
      alert('La date de décès ne peut pas précéder la date de naissance.');
      return;
    }

    const people = readPeople();

    people.unshift(person);
    savePeople(people);

    form.reset();
    renderAdminList();

    alert('La fiche a été enregistrée avec succès.');
  });
}

// Affichage initial
renderAdminList();

// Actualisation si les données changent dans une autre page
window.addEventListener('storage', event => {
  if (event.key === KEY) {
    renderAdminList();
  }
});