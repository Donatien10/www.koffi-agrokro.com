
const SUPABASE_URL = "https://whloiwfehqbhscilssbx.supabase.co";
const SUPABASE_KEY = "sb_publishable_0nR5whwcOoke1vflByOcEQ_gArsisLh";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const message = document.getElementById("loginMessage");
  const button = document.getElementById("loginButton");

  button.disabled = true;
  message.style.color = "#666";
  message.textContent = "Vérification en cours...";

  try {
    // 1. Connexion au compte
    const { data, error } = await db.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    // 2. Afficher l'identifiant du compte connecté
    console.log("UID DU COMPTE CONNECTÉ :", data.user.id);

    // 3. Vérifier les droits administrateur
    const { data: admin, error: adminError } = await db
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    console.log("RÉSULTAT ADMIN :", admin);
    console.log("ERREUR ADMIN :", adminError);

    if (adminError) {
      throw new Error("Erreur Supabase : " + adminError.message);
    }

    if (!admin) {
      throw new Error(
        "Aucun accès administrateur trouvé pour cet UID : " + data.user.id
      );
    }

    // 4. Accès autorisé
    message.style.color = "green";
    message.textContent = "Connexion réussie !";

    window.location.href = "./admin.html";

  } catch (error) {
    console.error("ERREUR COMPLÈTE :", error);

    message.style.color = "#b42318";
    message.textContent = error.message || "Échec de connexion.";

  } finally {
    button.disabled = false;
  }
});
