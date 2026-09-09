const {createClient}=window.supabase;
const sb=createClient(CAFE_CONFIG.SUPABASE_URL,CAFE_CONFIG.SUPABASE_KEY);
let settings={},cats=[],products=[],selected='all';
const fallback='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80';
const $=id=>document.getElementById(id); const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>new Intl.NumberFormat('fa-IR').format(Number(n||0))+' تومان';
async function load(){
 if(!CAFE_CONFIG.SUPABASE_URL.startsWith('http')){document.body.innerHTML='<div style="padding:30px;text-align:center">ابتدا اطلاعات Supabase را در config.js وارد کنید.</div>';return}
 const [s,c,p]=await Promise.all([sb.from('site_settings').select('data').eq('id',1).single(),sb.from('categories').select('*').eq('active',true).order('sort_order'),sb.from('products').select('*').eq('available',true).order('sort_order')]);
 if(s.error||c.error||p.error){console.error(s.error,c.error,p.error);document.body.innerHTML='<div style="padding:30px;text-align:center">خطا در اتصال به دیتابیس. تنظیمات Supabase و SQL را بررسی کنید.</div>';return}
 settings=s.data.data||{};cats=c.data||[];products=p.data||[];render();
}
function render(){
 const h=settings.home||{},b=settings.brand||{},a=settings.appearance||{};
 document.documentElement.style.setProperty('--accent',a.accent||'#d6a85b');document.documentElement.style.setProperty('--bg',a.bg||'#090909');document.documentElement.style.setProperty('--card',a.card||'#151515');
 $('hero').style.backgroundImage=`url("${h.hero||fallback}")`; $('heroTitle').textContent=h.title||'کافه جیگر';$('heroText').textContent=h.text||'';$('kicker').textContent=h.kicker||'';$('heroBtn').textContent=h.button||'مشاهده منو';
 if(b.logo){$('logo').src=b.logo;$('logo').style.display='block'} else $('logo').style.display='none';
 $('sectionTitle').textContent='منوی کافه';$('phone').textContent=b.phone||'—';$('instagram').textContent=b.instagram||'—';$('address').textContent=b.address||'—';$('hours').textContent=b.hours||'—';
 $('designer').textContent=(settings.footer?.show!==false)?(settings.footer?.designer||''):'';
 renderCats();renderProducts();renderQR();
}
function renderCats(){let html='<button class="cat '+(selected==='all'?'active':'')+'" onclick="pick(\'all\')">همه</button>';html+=cats.map(c=>`<button class="cat ${selected===c.id?'active':''}" onclick="pick('${esc(c.id)}')">${esc(c.name)}</button>`).join('');$('cats').innerHTML=html}
function pick(id){selected=id;renderCats();renderProducts()}
function renderProducts(){const q=($('search').value||'').trim().toLowerCase();let list=products.filter(p=>(selected==='all'||p.category_id===selected)&&(!q||(`${p.name} ${p.description||''}`).toLowerCase().includes(q)));$('count').textContent=list.length+' آیتم';$('grid').innerHTML=list.map(p=>{let cat=cats.find(c=>c.id===p.category_id);let discounted=Number(p.discount)>0?Math.round(Number(p.price)*(1-Number(p.discount)/100)):Number(p.price);return `<article class="product">${p.image_url?`<img class="pimg" src="${esc(p.image_url)}">`:'<div class="pimg"></div>'}<div class="pbody">${p.featured?'<span class="badge">ویژه</span>':''}<h3>${esc(p.name)}</h3><div class="desc">${esc(p.description||'')}</div><div style="font-size:10px;color:#777">${esc(cat?.name||'')}</div><div class="price">${money(discounted)} ${p.discount?`<span class="old">${money(p.price)}</span>`:''}</div></div></article>`}).join('')||'<div style="color:#888">آیتمی پیدا نشد.</div>'}
function renderQR(){let q=settings.qr||{},url=q.url||location.href;let src=`https://api.qrserver.com/v1/create-qr-code/?size=${q.size||240}x${q.size||240}&data=${encodeURIComponent(url)}`;$('qrPublicImg').src=src;$('qrPublicLabel').textContent=q.label||'برای مشاهده منوی کافه جیگر اسکن کنید';$('qrPublicLink').href=url;$('qrPublicLink').textContent=url}
load();
