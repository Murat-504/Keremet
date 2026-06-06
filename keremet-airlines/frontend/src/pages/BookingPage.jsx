// BookingPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Shield } from 'lucide-react';
import { fetchFlightsThunk, createBookingThunk } from '../store';

const fmt = n => (n || 0).toLocaleString('ru') + ' сом';
const TAKEN = new Set(['2A','2B','5C','7D','8A','8F','11B','12C','14D','15A','16E','3F','9B','10C']);
const COLS = ['A','B','C','D','E','F'];

export function BookingPage() {
  const { flightId } = useParams();
  const [sp]  = useSearchParams();
  const dispatch   = useNavigate();
  const navigate   = useNavigate();
  const reduxDispatch = useDispatch();
  const { list }   = useSelector(s => s.flights);
  const { user }   = useSelector(s => s.auth);

  const cls = sp.get('cls') || 'economy';
  const [step, setStep]   = useState(0);
  const [seat, setSeat]   = useState(null);
  const [pax,  setPax]    = useState({ fn:'', ln:'', pass:'', email: user?.email || '', phone:'' });
  const [busy, setBusy]   = useState(false);

  useEffect(() => {
    if (!list.length) reduxDispatch(fetchFlightsThunk({}));
  }, []);

  const f = list.find(x => x.id === +flightId);
  if (!f) return <div style={{ paddingTop:100, textAlign:'center', color:'rgba(232,237,245,.5)' }}>Загрузка рейса...</div>;

  const price = (cls === 'economy' ? f.economy_price : f.business_price) + 350;
  const STEPS = ['Пассажир', 'Выбор места', 'Оплата'];

  const handlePay = async () => {
    setBusy(true);
    const res = await reduxDispatch(createBookingThunk({
      flight_id: f.id,
      passenger_name: `${pax.fn} ${pax.ln}`.trim(),
      passport: pax.pass,
      email: pax.email,
      phone: pax.phone,
      seat_number: seat,
      class: cls,
    }));
    setBusy(false);
    if (!res.error) navigate('/done');
  };

  return (
    <div style={{ paddingTop:90, minHeight:'100vh' }}>
      <div style={{ maxWidth:780, margin:'0 auto', padding:'28px 24px' }}>
        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:36 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', ...(i < STEPS.length-1 ? { flex:1 } : {}) }}>
              <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, border:`2px solid ${i<=step?'#C9A84C':'rgba(201,168,76,.2)'}`, background: i<step?'#C9A84C':i===step?'rgba(201,168,76,.15)':'rgba(12,30,53,.7)', color: i<step?'#05111F':i===step?'#C9A84C':'rgba(232,237,245,.4)', transition:'all .3s' }}>
                {i < step ? <Check size={15} /> : i+1}
              </div>
              <span style={{ fontSize:12, color: step===i?'#C9A84C':'rgba(232,237,245,.4)', marginLeft:7, whiteSpace:'nowrap' }}>{s}</span>
              {i < STEPS.length-1 && <div style={{ flex:1, height:2, background: i<step?'#C9A84C':'rgba(201,168,76,.12)', margin:'0 10px' }} />}
            </div>
          ))}
        </div>

        {/* Flight bar */}
        <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:14, marginBottom:26 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>{f.from_city} → {f.to_city}</div>
            <div style={{ fontSize:12, color:'rgba(232,237,245,.5)', marginTop:3 }}>{f.flight_number} · {f.flight_date} · {String(f.departure_time||'').slice(0,5)}–{String(f.arrival_time||'').slice(0,5)} · {cls==='economy'?'Эконом':'Бизнес'}</div>
          </div>
          <div style={{ color:'#C9A84C', fontWeight:700, fontSize:18 }}>{fmt(cls==='economy'?f.economy_price:f.business_price)}</div>
        </div>

        {/* STEP 0 */}
        {step === 0 && (
          <div className="anim-up">
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, marginBottom:22 }}>Данные пассажира</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
              {[['fn','Имя','Иван'],['ln','Фамилия','Иванов'],['pass','Паспорт / ИИН','КР1234567'],['email','Email','ivan@mail.kg'],['phone','Телефон','+996 700 000000']].map(([k,l,ph]) => (
                <div key={k}>
                  <div style={{ fontSize:11, color:'rgba(232,237,245,.5)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                  <input value={pax[k]} onChange={e=>setPax({...pax,[k]:e.target.value})} placeholder={ph}
                    style={{ width:'100%', padding:'12px 14px', borderRadius:10, background:'rgba(5,17,31,.7)', border:'1px solid rgba(201,168,76,.18)', color:'#E8EDF5', fontSize:14 }} />
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} style={{ padding:'13px 34px', borderRadius:11, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:15, cursor:'pointer' }}>Далее →</button>
          </div>
        )}

        {/* STEP 1 - seats */}
        {step === 1 && (
          <div className="anim-up">
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, marginBottom:8 }}>Выбор места</h2>
            <p style={{ color:'rgba(232,237,245,.5)', fontSize:13, marginBottom:16 }}>
              {f.aircraft} · {seat ? <><strong style={{color:'#C9A84C'}}>Выбрано: {seat}</strong></> : 'Нажмите на свободное место'}
            </p>
            <div style={{ display:'flex', gap:16, marginBottom:14 }}>
              {[['rgba(16,185,129,.12)','rgba(16,185,129,.4)','#10B981','Свободно'],
                ['rgba(100,116,139,.1)','rgba(100,116,139,.2)','rgba(100,116,139,.4)','Занято'],
                ['rgba(201,168,76,.2)','#C9A84C','#C9A84C','Выбрано']].map(([bg,brd,clr,lbl]) => (
                <div key={lbl} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                  <div style={{ width:24, height:24, borderRadius:5, background:bg, border:`1.5px solid ${brd}` }} />
                  <span style={{ color:'rgba(232,237,245,.5)' }}>{lbl}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:14, padding:20, overflowX:'auto', marginBottom:20 }}>
              <div style={{ display:'flex', gap:5, paddingLeft:28, marginBottom:8 }}>
                {COLS.map((c, i) => <div key={c} style={{ width:28, textAlign:'center', fontSize:9, color:'rgba(232,237,245,.35)', fontWeight:600, ...(i===2?{marginRight:14}:{}) }}>{c}</div>)}
              </div>
              {Array.from({ length:20 }, (_, r) => (
                <div key={r} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                  <div style={{ width:22, fontSize:9, color:'rgba(232,237,245,.2)', textAlign:'right', paddingRight:5 }}>{r+1}</div>
                  {COLS.map((c, ci) => {
                    const id = `${r+1}${c}`;
                    const taken = TAKEN.has(id);
                    const sel   = seat === id;
                    return (
                      <div key={c} onClick={() => !taken && setSeat(sel ? null : id)} style={{
                        width:28, height:28, borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:600, transition:'all .15s', cursor: taken?'not-allowed':'pointer',
                        background: sel?'rgba(201,168,76,.25)':taken?'rgba(100,116,139,.1)':'rgba(16,185,129,.12)',
                        border:`1.5px solid ${sel?'#C9A84C':taken?'rgba(100,116,139,.2)':'rgba(16,185,129,.4)'}`,
                        color: sel?'#C9A84C':taken?'rgba(100,116,139,.4)':'#10B981',
                        transform: sel?'scale(1.1)':'',
                        ...(ci===2?{marginRight:14}:{})
                      }}>{id}</div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep(0)} style={{ padding:'12px 24px', borderRadius:10, background:'transparent', border:'1px solid rgba(201,168,76,.35)', color:'#C9A84C', fontSize:14, cursor:'pointer' }}>← Назад</button>
              <button onClick={() => setStep(2)} disabled={!seat} style={{ padding:'12px 30px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:14, cursor: seat?'pointer':'not-allowed', opacity: seat?1:.45 }}>Далее →</button>
            </div>
          </div>
        )}

        {/* STEP 2 - payment */}
        {step === 2 && (
          <div className="anim-up">
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, marginBottom:22 }}>Оплата</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:22 }}>
              {[['Номер карты','0000 0000 0000 0000'],['Имя на карте','IVAN IVANOV'],['Срок действия','MM/YY'],['CVV','•••']].map(([l,ph]) => (
                <div key={l}>
                  <div style={{ fontSize:11, color:'rgba(232,237,245,.5)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                  <input placeholder={ph} style={{ width:'100%', padding:'12px 14px', borderRadius:10, background:'rgba(5,17,31,.7)', border:'1px solid rgba(201,168,76,.18)', color:'#E8EDF5', fontSize:14 }} />
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:14, padding:20, marginBottom:20 }}>
              <div style={{ fontWeight:600, marginBottom:12 }}>Итого к оплате</div>
              {[['Авиабилет', fmt(cls==='economy'?f.economy_price:f.business_price)], ['Сервисный сбор','350 сом']].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13, color:'rgba(232,237,245,.5)' }}><span>{l}</span><span>{v}</span></div>
              ))}
              <div style={{ borderTop:'1px solid rgba(201,168,76,.15)', paddingTop:10, display:'flex', justifyContent:'space-between', fontWeight:700, color:'#C9A84C', fontSize:18 }}>
                <span>ИТОГО</span><span>{fmt(price)}</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'rgba(232,237,245,.5)', marginBottom:18 }}>
              <Shield size={14} /> Ваши данные защищены шифрованием SSL/TLS
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep(1)} style={{ padding:'12px 24px', borderRadius:10, background:'transparent', border:'1px solid rgba(201,168,76,.35)', color:'#C9A84C', fontSize:14, cursor:'pointer' }}>← Назад</button>
              <button onClick={handlePay} disabled={busy} style={{ padding:'12px 32px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                {busy ? 'Обработка...' : `Оплатить ${fmt(price)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;
