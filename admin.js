const { createClient } = window.supabase;

const sb = createClient(
  CAFE_CONFIG.SUPABASE_URL,
  CAFE_CONFIG.SUPABASE_KEY
);

let settings = {};
let cats = [];
let products = [];

const $ = id => document.getElementById(id);

function msg(text) {
  const el = $('msg');

  if (el) {
    el.textContent = text;

    setTimeout(() => {
      el.textContent = '';
    }, 4000);
  }
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


/* =========================
   LOGIN
========================= */

async function login() {

  const email = $('email')?.value?.trim();
  const password = $('password')?.value || '';

  if (!email || !password) {
    msg('ایمیل و رمز عبور را وارد کنید.');
    return;
  }

  const { error } = await sb.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg('ورود ناموفق بود: ' + error.message);
    return;
  }

  msg('ورود موفق بود.');

  setTimeout(() => {
    location.reload();
  }, 700);
}


async function logout() {

  await sb.auth.signOut();

  location.reload();
}


/* =========================
   AUTH CHECK
========================= */

async function checkAuth() {

  const { data } = await sb.auth.getSession();

  const session = data?.session;

  const loginBox = $('loginBox');
  const adminBox = $('adminBox');

  if (session) {

    if (loginBox) {
      loginBox.style.display = 'none';
    }

    if (adminBox) {
      adminBox.style.display = 'block';
    }

    await load();

  } else {

    if (loginBox) {
      loginBox.style.display = 'block';
    }

    if (adminBox) {
      adminBox.style.display = 'none';
    }
  }
}


/* =========================
   LOAD DATA
========================= */

async function load() {

  try {

    const [s, c, p] = await Promise.all([

      sb
        .from('site_settings')
        .select('data')
        .eq('id', 'main')
        .single(),

      sb
        .from('categories')
        .select('*')
        .order('sort_order'),

      sb
        .from('products')
        .select('*')
        .order('sort_order')

    ]);


    if (s.error) {
      console.error('settings error:', s.error);
      msg('خطا در دریافت تنظیمات: ' + s.error.message);
      return;
    }

    if (c.error) {
      console.error('categories error:', c.error);
      msg('خطا در دریافت دسته‌بندی‌ها: ' + c.error.message);
      return;
    }

    if (p.error) {
      console.error('products error:', p.error);
      msg('خطا در دریافت محصولات: ' + p.error.message);
      return;
    }


    settings = s.data?.data || {};
    cats = c.data || [];
    products = p.data || [];


    renderProducts();
    renderCategories();
    renderSettings();

  } catch (err) {

    console.error(err);

    msg('خطای غیرمنتظره در اتصال به دیتابیس.');

  }
}


/* =========================
   TABS
========================= */

function tab(name) {

  document
    .querySelectorAll('.tab-content')
    .forEach(el => {
      el.style.display = 'none';
    });


  const target = $(name);

  if (target) {
    target.style.display = 'block';
  }


  document
    .querySelectorAll('[data-tab]')
    .forEach(el => {

      el.classList.toggle(
        'active',
        el.dataset.tab === name
      );

    });
}


/* =========================
   SETTINGS
========================= */

function renderSettings() {

  const h = settings.home || {};
  const b = settings.brand || {};
  const a = settings.appearance || {};
  const q = settings.qr || {};
  const f = settings.footer || {};


  if ($('homeTitle'))
    $('homeTitle').value = h.title || '';

  if ($('homeText'))
    $('homeText').value = h.text || '';

  if ($('homeKicker'))
    $('homeKicker').value = h.kicker || '';

  if ($('homeButton'))
    $('homeButton').value = h.button || 'مشاهده منو';


  if ($('logo'))
    $('logo').value = b.logo || '';

  if ($('phone'))
    $('phone').value = b.phone || '';

  if ($('instagram'))
    $('instagram').value = b.instagram || '';

  if ($('address'))
    $('address').value = b.address || '';

  if ($('hours'))
    $('hours').value = b.hours || '';


  if ($('hero'))
    $('hero').value = h.hero || '';


  if ($('accent'))
    $('accent').value = a.accent || '#d6a85b';

  if ($('bg'))
    $('bg').value = a.bg || '#090909';

  if ($('card'))
    $('card').value = a.card || '#151515';


  if ($('qrUrl'))
    $('qrUrl').value = q.url || '';

  if ($('qrSize'))
    $('qrSize').value = q.size || 240;

  if ($('qrLabel'))
    $('qrLabel').value =
      q.label ||
      'برای مشاهده منوی کافه جیگر اسکن کنید';


  if ($('designer'))
    $('designer').value = f.designer || '';

  if ($('footerShow'))
    $('footerShow').checked =
      f.show !== false;
}


/* =========================
   SAVE SETTINGS
========================= */

async function saveSettings() {

  const newSettings = {

    ...settings,

    home: {
      ...(settings.home || {}),

      title: $('homeTitle')?.value || '',
      text: $('homeText')?.value || '',
      kicker: $('homeKicker')?.value || '',
      button:
        $('homeButton')?.value ||
        'مشاهده منو',

      hero:
        $('hero')?.value || ''
    },


    brand: {
      ...(settings.brand || {}),

      logo:
        $('logo')?.value || '',

      phone:
        $('phone')?.value || '',

      instagram:
        $('instagram')?.value || '',

      address:
        $('address')?.value || '',

      hours:
        $('hours')?.value || ''
    },


    appearance: {
      ...(settings.appearance || {}),

      accent:
        $('accent')?.value || '#d6a85b',

      bg:
        $('bg')?.value || '#090909',

      card:
        $('card')?.value || '#151515'
    },


    qr: {
      ...(settings.qr || {}),

      url:
        $('qrUrl')?.value || '',

      size:
        Number($('qrSize')?.value || 240),

      label:
        $('qrLabel')?.value ||
        'برای مشاهده منوی کافه جیگر اسکن کنید'
    },


    footer: {
      ...(settings.footer || {}),

      designer:
        $('designer')?.value || '',

      show:
        $('footerShow')?.checked !== false
    }

  };


  const { error } = await sb
    .from('site_settings')
    .upsert({
      id: 'main',
      data: newSettings,
      updated_at: new Date().toISOString()
    });


  if (error) {

    console.error(error);

    msg(
      'خطا در ذخیره تنظیمات: ' +
      error.message
    );

    return;
  }


  settings = newSettings;

  msg('تنظیمات با موفقیت ذخیره شد. ✅');
}


/* =========================
   CATEGORIES
========================= */

function renderCategories() {

  const box = $('categoriesList');

  if (!box) return;


  box.innerHTML = cats.map(c => `

    <div class="admin-row">

      <div>
        <strong>${esc(c.name)}</strong>
        <small>
          ${c.active ? 'فعال' : 'غیرفعال'}
        </small>
      </div>

      <div>

        <button
          onclick="editCategory('${esc(c.id)}')">
          ویرایش
        </button>

        <button
          onclick="toggleCategory('${esc(c.id)}')">
          ${c.active ? 'غیرفعال کردن' : 'فعال کردن'}
        </button>

        <button
          onclick="deleteCategory('${esc(c.id)}')">
          حذف
        </button>

      </div>

    </div>

  `).join('');
}


function editCategory(id) {

  const c =
    cats.find(x => String(x.id) === String(id));

  if (!c) return;


  const name =
    prompt('نام دسته‌بندی:', c.name);

  if (name === null) return;

  const clean =
    name.trim();

  if (!clean) {
    msg('نام دسته‌بندی نمی‌تواند خالی باشد.');
    return;
  }


  updateCategory(
    c.id,
    clean
  );
}


async function updateCategory(id, name) {

  const { error } =
    await sb
      .from('categories')
      .update({
        name
      })
      .eq('id', id);


  if (error) {

    msg(
      'خطا در ویرایش دسته‌بندی: ' +
      error.message
    );

    return;
  }


  msg('دسته‌بندی ویرایش شد.');

  await load();
}


async function toggleCategory(id) {

  const c =
    cats.find(x => String(x.id) === String(id));

  if (!c) return;


  const { error } =
    await sb
      .from('categories')
      .update({
        active: !c.active
      })
      .eq('id', id);


  if (error) {

    msg(
      'خطا: ' +
      error.message
    );

    return;
  }


  await load();
}


async function deleteCategory(id) {

  const c =
    cats.find(x => String(x.id) === String(id));

  if (!c) return;


  if (
    !confirm(
      `دسته‌بندی «${c.name}» حذف شود؟`
    )
  ) {
    return;
  }


  const used =
    products.some(
      p => String(p.cat) === String(id)
    );


  if (used) {

    msg(
      'این دسته‌بندی دارای محصول است و فعلاً قابل حذف نیست.'
    );

    return;
  }


  const { error } =
    await sb
      .from('categories')
      .delete()
      .eq('id', id);


  if (error) {

    msg(
      'خطا در حذف: ' +
      error.message
    );

    return;
  }


  msg('دسته‌بندی حذف شد.');

  await load();
}


/* =========================
   ADD CATEGORY
========================= */

async function addCategory() {

  const input =
    $('newCategory');

  if (!input) return;


  const name =
    input.value.trim();


  if (!name) {

    msg('نام دسته‌بندی را وارد کنید.');

    return;
  }


  const id =
    name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '')
      +
      '-' +
      Date.now();


  const { error } =
    await sb
      .from('categories')
      .insert({
        id,
        name,
        sort_order: cats.length + 1,
        active: true
      });


  if (error) {

    msg(
      'خطا در ایجاد دسته‌بندی: ' +
      error.message
    );

    return;
  }


  input.value = '';

  msg('دسته‌بندی اضافه شد. ✅');

  await load();
}


/* =========================
   PRODUCTS
========================= */

function renderProducts() {

  const box =
    $('productsList');

  if (!box) return;


  box.innerHTML =
    products.map(p => {

      const cat =
        cats.find(
          c => String(c.id) === String(p.cat)
        );


      return `

        <div class="admin-row">

          <div>

            <strong>
              ${esc(p.name)}
            </strong>

            <div>
              ${esc(cat?.name || '')}
            </div>

            <small>
              ${Number(p.price || 0).toLocaleString('fa-IR')}
              تومان
            </small>

          </div>


          <div>

            <button
              onclick="editProduct(${p.id})">
              ویرایش
            </button>

            <button
              onclick="toggleProduct(${p.id})">
              ${p.available ? 'غیرفعال' : 'فعال'}
            </button>

            <button
              onclick="deleteProduct(${p.id})">
              حذف
            </button>

          </div>

        </div>

      `;

    }).join('');
}


/* =========================
   PRODUCT FORM
========================= */

function editProduct(id) {

  const p = id
    ? products.find(x => x.id == id)
    : {

        name: '',
        cat: cats[0]?.id || '',
        description: '',
        price: 0,
        old_price: 0,
        discount: 0,
        image_url: '',
        featured: false,
        available: true,
        sort_order:
          products.length + 1

      };


  if (!p) return;


  const name =
    prompt(
      'نام محصول:',
      p.name || ''
    );

  if (name === null) return;


  const description =
    prompt(
      'توضیحات محصول:',
      p.description || ''
    );

  if (description === null) return;


  const price =
    prompt(
      'قیمت:',
      p.price || 0
    );

  if (price === null) return;


  const oldPrice =
    prompt(
      'قیمت قبلی:',
      p.old_price || 0
    );

  if (oldPrice === null) return;


  const discount =
    prompt(
      'درصد تخفیف:',
      p.discount || 0
    );

  if (discount === null) return;


  const image =
    prompt(
      'لینک تصویر:',
      p.image_url || ''
    );

  if (image === null) return;


  const category =
    prompt(
      'شناسه دسته‌بندی:\n' +
      cats
        .map(c => `${c.id} = ${c.name}`)
        .join('\n'),
      p.cat || cats[0]?.id || ''
    );

  if (category === null) return;


  saveProduct(
    id,
    {
      name: name.trim(),
      cat: category.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      old_price: Number(oldPrice) || 0,
      discount: Number(discount) || 0,
      image_url: image.trim(),
      featured: !!p.featured,
      available: p.available !== false,
      sort_order: p.sort_order || products.length + 1
    }
  );
}


/* =========================
   SAVE PRODUCT
========================= */

async function saveProduct(id, data) {

  let result;


  if (id) {

    result =
      await sb
        .from('products')
        .update(data)
        .eq('id', id);

  } else {

    result =
      await sb
        .from('products')
        .insert(data);

  }


  if (result.error) {

    console.error(result.error);

    msg(
      'خطا در ذخیره محصول: ' +
      result.error.message
    );

    return;
  }


  msg('محصول با موفقیت ذخیره شد. ✅');

  await load();
}


/* =========================
   TOGGLE PRODUCT
========================= */

async function toggleProduct(id) {

  const p =
    products.find(
      x => x.id == id
    );

  if (!p) return;


  const { error } =
    await sb
      .from('products')
      .update({
        available: !p.available
      })
      .eq('id', id);


  if (error) {

    msg(
      'خطا: ' +
      error.message
    );

    return;
  }


  await load();
}


/* =========================
   DELETE PRODUCT
========================= */

async function deleteProduct(id) {

  const p =
    products.find(
      x => x.id == id
    );

  if (!p) return;


  if (
    !confirm(
      `محصول «${p.name}» حذف شود؟`
    )
  ) {
    return;
  }


  const { error } =
    await sb
      .from('products')
      .delete()
      .eq('id', id);


  if (error) {

    msg(
      'خطا در حذف محصول: ' +
      error.message
    );

    return;
  }


  msg('محصول حذف شد.');

  await load();
}


/* =========================
   NEW PRODUCT
========================= */

function newProduct() {

  editProduct(null);

}


/* =========================
   SEARCH
========================= */

function searchProducts() {

  const q =
    $('productSearch')?.value
      ?.trim()
      ?.toLowerCase() || '';


  const filtered =
    products.filter(p =>

      `${p.name} ${p.description || ''}`
        .toLowerCase()
        .includes(q)

    );


  const box =
    $('productsList');

  if (!box) return;


  box.innerHTML =
    filtered.map(p => {

      const cat =
        cats.find(
          c => String(c.id) === String(p.cat)
        );


      return `

        <div class="admin-row">

          <div>

            <strong>
              ${esc(p.name)}
            </strong>

            <div>
              ${esc(cat?.name || '')}
            </div>

            <small>
              ${Number(p.price || 0).toLocaleString('fa-IR')}
              تومان
            </small>

          </div>

          <div>

            <button
              onclick="editProduct(${p.id})">
              ویرایش
            </button>

            <button
              onclick="toggleProduct(${p.id})">
              ${p.available ? 'غیرفعال' : 'فعال'}
            </button>

            <button
              onclick="deleteProduct(${p.id})">
              حذف
            </button>

          </div>

        </div>

      `;

    }).join('');
}


/* =========================
   START
========================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    checkAuth();

  }
);


/* =========================
   AUTH STATE
========================= */

sb.auth.onAuthStateChange(
  (event, session) => {

    if (event === 'SIGNED_OUT') {
      location.reload();
    }

  }
);
