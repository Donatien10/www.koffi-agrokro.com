
const ADMIN_SUPABASE_URL = "https://whloiwfehqbhscilssbx.supabase.co";
const ADMIN_SUPABASE_KEY = "sb_publishable_0nR5whwcOoke1vflByOcEQ_gArsisLh";

const adminDB = window.supabase.createClient(
  ADMIN_SUPABASE_URL,
  ADMIN_SUPABASE_KEY
);

(async function verifierAdministrateur() {
  try {
    const { data, error } = await adminDB.auth.getSession();

    if (error || !data.session) {
      window.location.replace("./connexion-admin.html");
      return;
    }

    const { data: admin, error: adminError } = await adminDB
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.session.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      console.error("Erreur de vérification administrateur :", adminError);
      await adminDB.auth.signOut();
      window.location.replace("./connexion-admin.html");
      return;
    }

    console.log("Administrateur autorisé !");
    document.dispatchEvent(new Event("admin-auth-ready"));

  } catch (error) {
    console.error("Erreur de sécurité :", error);
    window.location.replace("./connexion-admin.html");
  }
})();
