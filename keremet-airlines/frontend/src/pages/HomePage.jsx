import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Shield, Clock, Star, Globe, ArrowRight } from 'lucide-react';

const fmt = n => (n || 0).toLocaleString('ru') + ' сом';

function Stars() {
  const stars = useMemo(() => Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x:  (Math.sin(i * 7.3) * .5 + .5) * 100,
    y:  (Math.cos(i * 13.7) * .5 + .5) * 100,
    sz: 1 + (i % 3) * .5,
    del: (i * .4) % 4,
    dur: 2 + (i % 3),
    op:  .12 + (i % 5) * .07,
  })), []);
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:'absolute', left: s.x + '%', top: s.y + '%',
          width: s.sz, height: s.sz, borderRadius:'50%',
          background:'rgba(255,255,255,.9)', opacity: s.op,
          animation: `pulse ${s.dur}s ${s.del}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate  = useNavigate();
  const airports  = useSelector(s => s.airports.list);
  const [form, setForm] = useState({ from:'FRU', to:'OSS', date:'2025-06-15', pax:1 });

  const POPULAR = [
    { em:'🏔️', from:'Бишкек', to:'Ош',     price:'от 3 500 сом',  time:'1ч 30м', tc:'OSS' },
    { em:'🏛️', from:'Бишкек', to:'Москва',  price:'от 15 900 сом', time:'4ч 15м', tc:'SVO' },
    { em:'🕌', from:'Бишкек', to:'Стамбул', price:'от 22 500 сом', time:'5ч 20м', tc:'IST' },
    { em:'🌆', from:'Бишкек', to:'Дубай',   price:'от 28 000 сом', time:'4ч 45м', tc:'DXB' },
  ];

  const goSearch = () => navigate(`/flights?from=${form.from}&to=${form.to}&date=${form.date}&pax=${form.pax}`);

  const sel = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const iStyle = { padding:'12px 14px', borderRadius:10, background:'rgba(5,17,31,.7)', border:'1px solid rgba(201,168,76,.18)', color:'#E8EDF5', fontSize:14, width:'100%' };

  return (
    <div style={{ paddingTop:62 }}>
      {/* ── HERO ── */}
      <div style={{ position:'relative', minHeight:'100vh', display:'flex', overflow:'hidden', background:'radial-gradient(ellipse at 65% 20%,rgba(201,168,76,.07) 0%,transparent 55%),#05111F' }}>
        <Stars />
        <div style={{ position:'absolute', right:-60, top:'50%', transform:'translateY(-50%)', opacity:.04, pointerEvents:'none', color:'#C9A84C', animation:'float 6s ease-in-out infinite' }}>
          <svg width="520" height="520" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L9 11 .8 9.2c-.4-.1-.5-.6-.2-.9l5.3-4.6c.3-.3.8-.4 1.1-.1l1.6 1.1 2.8-2.8c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L9.8 6l1.1 1.6c.3.3.2.8-.1 1.1L6.2 14.2c-.3.3-.2.8.2.9z"/>
          </svg>
        </div>

        <div style={{ position:'relative', zIndex:2, maxWidth:1140, margin:'0 auto', padding:'110px 28px 70px', width:'100%' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.25)', borderRadius:30, padding:'5px 14px', marginBottom:22 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#C9A84C' }} />
            <span style={{ fontSize:11, color:'#C9A84C', letterSpacing:2, textTransform:'uppercase', fontWeight:500 }}>Авиакомпания Керемет — Кыргызстан</span>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(38px,6vw,68px)', fontWeight:700, lineHeight:1.08, marginBottom:18, maxWidth:640 }}>
            Летите туда,<br /><span style={{ color:'#C9A84C' }}>куда мечтаете</span>
          </h1>
          <p style={{ fontSize:16, color:'rgba(232,237,245,.5)', maxWidth:440, lineHeight:1.75, marginBottom:44 }}>
            Надёжный кыргызский перевозчик по внутренним и международным направлениям. Онлайн-бронирование за пару минут.
          </p>

          {/* Search form */}
          <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, padding:24, maxWidth:900, marginBottom:40 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto', gap:14, alignItems:'end' }}>
              {[['from','Откуда'],['to','Куда']].map(([k, l]) => (
                <div key={k}>
                  <div style={{ fontSize:11, color:'rgba(232,237,245,.5)', marginBottom:7, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                  <select value={form[k]} onChange={e => sel(k, e.target.value)} style={iStyle}>
                    {airports.length ? airports.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)
                      : [['FRU','Бишкек'],['OSS','Ош'],['SVO','Москва'],['IST','Стамбул'],['DXB','Дубай'],['ALA','Алматы']].map(([c,n]) => <option key={c} value={c}>{n} ({c})</option>)}
                  </select>
                </div>
              ))}
              <div>
                <div style={{ fontSize:11, color:'rgba(232,237,245,.5)', marginBottom:7, textTransform:'uppercase', letterSpacing:1 }}>Дата</div>
                <input type="date" value={form.date} onChange={e => sel('date', e.target.value)} min="2025-06-01" style={iStyle} />
              </div>
              <div>
                <div style={{ fontSize:11, color:'rgba(232,237,245,.5)', marginBottom:7, textTransform:'uppercase', letterSpacing:1 }}>Пассажиры</div>
                <select value={form.pax} onChange={e => sel('pax', e.target.value)} style={iStyle}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} пасс.</option>)}
                </select>
              </div>
              <button onClick={goSearch} style={{ display:'flex', alignItems:'center', gap:8, padding:'0 24px', height:48, borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:15, cursor:'pointer', whiteSpace:'nowrap' }}>
                <Search size={17} /> Найти рейс
              </button>
            </div>
          </div>

          <div style={{ display:'flex', gap:44 }}>
            {[['250 000+','пассажиров в год'],['15+','направлений'],['92%','пунктуальность']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:'#C9A84C' }}>{n}</div>
                <div style={{ fontSize:12, color:'rgba(232,237,245,.5)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ background:'#0C1E35', padding:'70px 28px' }}>
        <div style={{ maxWidth:1140, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, textAlign:'center', marginBottom:10 }}>
            Почему <span style={{ color:'#C9A84C' }}>Керемет</span>?
          </h2>
          <p style={{ textAlign:'center', color:'rgba(232,237,245,.5)', marginBottom:48, fontSize:15 }}>Мы заботимся о каждом пассажире на каждом этапе</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }}>
            {[[Shield,'Безопасность','Все рейсы сертифицированы международными авиастандартами IATA'],
              [Clock,'Пунктуальность','92% рейсов выполняются точно по расписанию без задержек'],
              [Star,'Сервис','Первоклассный сервис на борту и в аэропорту Манас'],
              [Globe,'Маршруты','15+ направлений по Кыргызстану и международным маршрутам'],
            ].map(([Icon, title, desc]) => (
              <div key={title} style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, padding:24, textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:13, background:'rgba(201,168,76,.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#C9A84C' }}><Icon size={22} /></div>
                <div style={{ fontWeight:600, fontSize:15, marginBottom:9 }}>{title}</div>
                <div style={{ color:'rgba(232,237,245,.5)', fontSize:13, lineHeight:1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── POPULAR ROUTES ── */}
      <div style={{ padding:'70px 28px', background:'#05111F' }}>
        <div style={{ maxWidth:1140, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, marginBottom:10 }}>
            Популярные <span style={{ color:'#C9A84C' }}>маршруты</span>
          </h2>
          <p style={{ color:'rgba(232,237,245,.5)', marginBottom:40, fontSize:15 }}>Самые востребованные направления</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {POPULAR.map(r => (
              <div key={r.tc} onClick={() => navigate(`/flights?from=FRU&to=${r.tc}&date=2025-06-15`)}
                style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, padding:24, cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,168,76,.4)'; e.currentTarget.style.transform='translateY(-5px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,168,76,.18)'; e.currentTarget.style.transform=''; }}>
                <div style={{ fontSize:34, marginBottom:14 }}>{r.em}</div>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8, fontWeight:600, fontSize:14 }}>
                  {r.from} <ArrowRight size={13} color='rgba(232,237,245,.4)' /> {r.to}
                </div>
                <div style={{ color:'#C9A84C', fontWeight:700, fontSize:20, marginBottom:4 }}>{r.price}</div>
                <div style={{ color:'rgba(232,237,245,.5)', fontSize:12 }}>⏱ {r.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background:'#0C1E35', borderTop:'1px solid rgba(201,168,76,.12)', padding:'28px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#C9A84C,#8B6914)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#05111F"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L9 11 .8 9.2c-.4-.1-.5-.6-.2-.9l5.3-4.6c.3-.3.8-.4 1.1-.1l1.6 1.1 2.8-2.8c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L9.8 6l1.1 1.6c.3.3.2.8-.1 1.1L6.2 14.2c-.3.3-.2.8.2.9z"/></svg>
          </div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:'#C9A84C' }}>КЕРЕМЕТ Airlines</span>
        </div>
        <p style={{ color:'rgba(232,237,245,.4)', fontSize:12 }}>© 2025 ОсОО «Авиакомпания Керемет» · Бишкек, Кыргызстан · info@keremet.kg</p>
        <p style={{ color:'rgba(232,237,245,.2)', fontSize:11, marginTop:5 }}>Stack: React.js · Redux Toolkit · Node.js/Express · PostgreSQL · JWT · Docker</p>
      </div>
    </div>
  );
}
