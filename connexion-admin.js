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
  message.textContent = "Vérification en cours...";

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const { data: admin, error: adminError } = await db
      .from("site_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError) throw adminError;

    if (!admin) {
      await db.auth.signOut();
      throw new Error("Ce compte n'est pas autorisé à administrer le site.");
    }

    message.textContent = "Connexion réussie !";
    window.location.href = "./admin.html";

  } catch (error) {
    console.error(error);
    message.textContent = error.message || "Échec de connexion.";
  } finally {
    button.disabled = false;
  }
});