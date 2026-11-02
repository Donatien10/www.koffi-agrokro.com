const SUPABASE_URL = "https://whloiwfehqbhscilssbx.supabase.co";

const SUPABASE_KEY = "sb_publishable_0nR5whwcOoke1vflByOcEQ_gArsisLh";

const adminDB = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

(async function verifierAdministrateur() {
  const { data, error } = await adminDB.auth.getSession();

  if (error || !data.session) {
    window.location.replace("./connexion-admin.html");
    return;
  }

  const { data: admin, error: adminError } = await adminDB
    .from("site_admins")
    .select("user_id")
    .eq("user_id", data.session.user.id)
    .maybeSingle();

  if (adminError || !admin) {
    await adminDB.auth.signOut();
    window.location.replace("./connexion-admin.html");
  }
})();