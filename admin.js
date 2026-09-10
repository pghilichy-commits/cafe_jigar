/* =====================================================
   CAFE JIGAR - ADMIN PANEL
   Supabase Online Version
===================================================== */

const { createClient } = window.supabase;

const sb = createClient(
  CAFE_CONFIG.SUPABASE_URL,
  CAFE_CONFIG.SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);


/* =========================
   GLOBAL DATA
========================= */

let settings = {};
let cats = [];
let products = [];


/* =========================
   HELPERS
========================= */

const $ = id => document.getElementById(id);

function showStatus(text, success = false) {

  const el = $('status');

  if (!el) return;

  el.textContent = text;

  el.style.color = success
    ? '#8fffaa'
    : '#ff8f8f';
}


function esc(s) {

  return String(s ?? '').replace(
    /[&<>"']/g,
    m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m])
  );

}


/* =====================================================
   LOGIN
===================================================== */

async function signIn() {

  const email =
    $('email')?.value?.trim() || '';

  const password =
    $('password')?.value || '';


  if (!email || !password) {

    showStatus(
      'ایمیل و رمز عبور را وارد کنید.'
    );

    return;
  }


  showStatus(
    'در حال ورود...'
  );


  try {

    const {
      data,
      error
    } = await sb.auth.signInWithPassword({
      email: email,
      password: password
    });


    if (error) {

      console.error(
        'SUPABASE LOGIN ERROR:',
        error
      );

      showStatus(
        'ورود ناموفق بود: ' +
        error.message
      );

      return;
    }


    if (!data?.session) {

      showStatus(
        'ورود انجام شد ولی Session دریافت نشد.'
      );

      return;
    }


    showStatus(
      'ورود موفق بود. در حال بارگذاری پنل...',
      true
    );


    await showAdmin();


  } catch (err) {

    console.error(
      'LOGIN EXCEPTION:',
      err
    );

    showStatus(
      'خطای ورود: ' +
      (err.message || err)
    );

  }

}


/* =====================================================
   LOGOUT
===================================================== */

async function signOut() {

  try {

    const {
      error
    } = await sb.auth.signOut();


    if (error) {

      console.error(error);

      return;
    }


    location.reload();

  } catch (err) {

    console.error(err);

  }

}


/* =====================================================
   BACKWARD COMPATIBILITY
===================================================== */

function login() {

  return signIn();

}


function logout() {

  return signOut();

}


/* =====================================================
   SHOW ADMIN
===================================================== */

async function showAdmin() {

  const loginBox =
    $('login');

  const adminBox =
    $('app');


  if (loginBox) {

    loginBox.classList.add(
      'hidden'
    );

  }


  if (adminBox) {

    adminBox.classList.remove(
      'hidden'
    );

  }


  await load();

}


/* =====================================================
   AUTH CHECK
===================================================== */

async function checkAuth() {

  try {

    const {
      data,
      error
    } = await sb.auth.getSession();


    if (error) {

      console.error(
        'SESSION ERROR:',
        error
      );

      showStatus(
        'خطا در بررسی ورود: ' +
        error.message
      );

      return;
    }


    const session =
      data?.session;


    if (session) {

      await showAdmin();

    } else {

      const loginBox =
        $('login');

      const adminBox =
        $('app');


      if (loginBox) {

        loginBox.classList.remove(
          'hidden'
        );

      }


      if (adminBox) {

        adminBox.classList.add(
          'hidden'
        );

      }

    }

  } catch (err) {

    console.error(
      'AUTH CHECK ERROR:',
      err
    );

    showStatus(
      'خطا در اتصال به سیستم ورود.'
    );

  }

}


/* =====================================================
   LOAD DATABASE
===================================================== */

async function load() {

  try {

    showStatus(
      'در حال دریافت اطلاعات...'
    );


    const [
      settingsResult,
      categoriesResult,
      productsResult
    ] = await Promise.all([

      sb
        .from('site_settings')
        .select('data')
        .eq('id', 'main')
        .single(),

      sb
        .from('categories')
        .select('*')
        .order(
          'sort_order',
          { ascending: true }
        ),

      sb
        .from('products')
        .select('*')
        .order(
          'sort_order',
          { ascending: true }
        )

    ]);


    if (settingsResult.error) {

      console.error(
        settingsResult.error
      );

      showStatus(
        'خطا در تنظیمات: ' +
        settingsResult.error.message
      );

      return;
    }


    if (categoriesResult.error) {

      console.error(
        categoriesResult.error
      );

      showStatus(
        'خطا در دسته‌ها: ' +
        categories
