import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart2, Plane, Package, Users, Settings, Plus, Edit, Trash2, X, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchFlightsThunk, fetchBookingsThunk, createFlightThunk, updateFlightThunk, deleteFlightThunk } from '../store';

const AIRPORTS = [
  {code:'FRU',city:'Бишкек'},{code:'OSS',city:'Ош'},{code:'JLB',city:'Джалал-Абад'},
  {code:'SVO',city:'Москва'},{code:'IST',city:'Стамбул'},{code:'DXB',city:'Дубай'},{code:'ALA',city:'Алматы'},
];

const REVENUE = [
  {m:'Янв',r:1250000,b:342},{m:'Фев',r:980000,b:268},{m:'Мар',r:1580000,b:421},
  {m:'Апр',r:1820000,b:498},{m:'Май',r:2150000,b:587},{m:'Июн',r:2480000,b:672},
];
const PIE = [
  {name:'Бишкек→Ош',v:35,c:'#C9A84C'},{name:'Бишкек→Москва',v:28,c:'#4A90D9'},
  {name:'Бишкек→Стамбул',v:22,c:'#10B981'},{name:'Бишкек→Дубай',v:15,c:'#F59E0B'},
];
const USERS_MOCK = [
  {id:1,name:'Айгуль Бекова',email:'aigul@mail.kg',phone:'+996 701 234567',bookings:5,spent:87500,since:'2024-03-15',status:'active'},
  {id:2,name:'Алибек Джумаев',email:'alibek@mail.kg',phone:'+996 550 345678',bookings:12,spent:324000,since:'2023-11-02',status:'active'},
  {id:3,name:'Нурия Сатылганова',email:'nuria@mail.kg',phone:'+996 777 456789',bookings:2,spent:45000,since:'2025-01-20',status:'active'},
  {id:4,name:'Тилек Осмонов',email:'tilek@mail.kg',phone:'+996 700 567890',bookings:8,spent:156000,since:'2024-07-08',status:'inactive'},
];

const fmt = n => (n||0).toLocaleString('ru') + ' сом';
const grid = 'rgba(201,168,76,.07)', tick = 'rgba(232,237,245,.35)';
const TT = { contentStyle:{ background:'#0C1E35', border:'1px solid rgba(201,168,76,.2)', borderRadius:10, color:'#E8EDF5', fontSize:12 } };
const EMPTY_FLIGHT = { flight_number:'', from_code:'FRU', to_code:'OSS', departure_time:'', arrival_time:'', duration:'', flight_date:'', aircraft:'Airbus A320', economy_price:'', business_price:'', economy_seats:150, business_seats:24 };

function NavItem({ id, icon: Icon, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 13px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:500, transition:'all .2s',
      background: active?'rgba(201,168,76,.14)':'transparent',
      color: active?'#C9A84C':'rgba(232,237,245,.5)',
      border: active?'1px solid rgba(201,168,76,.2)':'1px solid transparent',
    }}>
      <Icon size={16} />{label}
    </div>
  );
}

function StatCard({ label, value, change, icon: Icon }) {
  return (
    <div style={{ background:'rgba(5,17,31,.5)', border:'1px solid rgba(201,168,76,.18)', borderRadius:14, padding:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontSize:10, color:'rgba(232,237,245,.5)', textTransform:'uppercase', letterSpacing:1 }}>{label}</div>
        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(201,168,76,.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C9A84C' }}><Icon size={16}/></div>
      </div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, marginBottom:6 }}>{value}</div>
      <div style={{ fontSize:11, color:'#10B981' }}>↑ {change} за месяц</div>
    </div>
  );
}

export default function AdminPage() {
  const dispatch  = useDispatch();
  const [tab, setTab]     = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [fForm, setFForm] = useState(EMPTY_FLIGHT);
  const [editId, setEditId] = useState(null);
  const [bFilter, setBFilter] = useState('all');
  const [saveOk, setSaveOk] = useState(false);

  const { list: flights } = useSelector(s => s.flights);
  const { list: bookings } = useSelector(s => s.bookings);

  useEffect(() => {
    dispatch(fetchFlightsThunk({}));
    dispatch(fetchBookingsThunk());
  }, [dispatch]);

  const openAdd = () => { setFForm(EMPTY_FLIGHT); setEditId(null); setModal('flight'); };
  const openEdit = f => { setFForm({ flight_number:f.flight_number, from_code:f.from_code||'FRU', to_code:f.to_code||'OSS', departure_time:String(f.departure_time||'').slice(0,5), arrival_time:String(f.arrival_time||'').slice(0,5), duration:f.duration||'', flight_date:f.flight_date||'', aircraft:f.aircraft||'', economy_price:f.economy_price||'', business_price:f.business_price||'', economy_seats:f.economy_seats||150, business_seats:f.business_seats||24 }); setEditId(f.id); setModal('flight'); };
  const saveFlight = async () => {
    if (editId) await dispatch(updateFlightThunk({ id:editId, ...fForm }));
    else await dispatch(createFlightThunk(fForm));
    setModal(null);
  };
  const delFlight = id => { if (window.confirm('Удалить рейс?')) dispatch(deleteFlightThunk(id)); };

  const filteredB = bFilter === 'all' ? bookings : bookings.filter(b => b.status === bFilter);
  const totalRev  = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (+b.amount||0), 0);

  const inp = (key, label, ph, type='text') => (
    <div key={key}>
      <div style={{ fontSize:10, color:'rgba(232,237,245,.5)', marginBottom:5, textTransform:'uppercase', letterSpacing:1 }}>{label}</div>
      <input type={type} value={fForm[key]||''} onChange={e => setFForm({...fForm,[key]:e.target.value})} placeholder={ph}
        style={{ width:'100%', padding:'10px 13px', borderRadius:9, background:'rgba(5,17,31,.7)', border:'1px solid rgba(201,168,76,.18)', color:'#E8EDF5', fontSize:13 }} />
    </div>
  );

  const badge = s => {
    const map = { confirmed:['rgba(16,185,129,.15)','#10B981','✓ Подтв.'], pending:['rgba(245,158,11,.15)','#F59E0B','⏱ Ожид.'], cancelled:['rgba(239,68,68,.15)','#EF4444','✕ Отм.'] };
    const [bg, clr, lbl] = map[s] || map.pending;
    return <span style={{ background:bg, color:clr, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:600 }}>{lbl}</span>;
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', paddingTop:62 }}>
      {/* Sidebar */}
      <div style={{ width:220, flexShrink:0, background:'#0C1E35', borderRight:'1px solid rgba(201,168,76,.1)', padding:'20px 12px', display:'flex', flexDirection:'column', gap:3 }}>
        <div style={{ fontSize:9, color:'rgba(232,237,245,.25)', letterSpacing:2, textTransform:'uppercase', marginBottom:9, paddingLeft:13 }}>Навигация</div>
        {[['dashboard',BarChart2,'Дашборд'],['flights',Plane,'Рейсы'],['bookings',Package,'Бронирования'],['users',Users,'Пользователи'],['settings',Settings,'Настройки']].map(([id, Icon, label]) => (
          <NavItem key={id} id={id} icon={Icon} label={label} active={tab===id} onClick={() => setTab(id)} />
        ))}
        <div style={{ marginTop:'auto', background:'rgba(5,17,31,.5)', border:'1px solid rgba(201,168,76,.1)', borderRadius:12, padding:14 }}>
          <div style={{ fontSize:9, color:'rgba(232,237,245,.4)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Сейчас</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'#C9A84C' }}>{bookings.length}</div>
          <div style={{ fontSize:11, color:'rgba(232,237,245,.4)', marginBottom:8 }}>бронирований</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:'#10B981' }}>{flights.length}</div>
          <div style={{ fontSize:11, color:'rgba(232,237,245,.4)' }}>рейсов в расписании</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, padding:28, overflow:'auto' }}>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="anim-up">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
              <div>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30 }}>Дашборд</h1>
                <p style={{ color:'rgba(232,237,245,.5)', fontSize:13, marginTop:4 }}>Обзор авиакомпании «Керемет»</p>
              </div>
              <div style={{ fontSize:12, color:'rgba(232,237,245,.5)' }}>{new Date().toLocaleDateString('ru',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:15, marginBottom:22 }}>
              <StatCard label="Выручка (Июнь)" value="2 480 000 сом" change="+15.3%" icon={TrendingUp}/>
              <StatCard label="Бронирований" value={bookings.length+' шт'} change="+8.2%" icon={Package}/>
              <StatCard label="Рейсов" value={flights.length+' рейсов'} change="0%" icon={Plane}/>
              <StatCard label="Пользователей" value={USERS_MOCK.length+' чел'} change="+12.1%" icon={Users}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
              <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, padding:22 }}>
                <div style={{ fontWeight:600, marginBottom:3 }}>Выручка по месяцам</div>
                <div style={{ fontSize:12, color:'rgba(232,237,245,.5)', marginBottom:18 }}>2025, млн сом</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={REVENUE}>
                    <defs><linearGradient id="gld" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C9A84C" stopOpacity={.3}/><stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid}/>
                    <XAxis dataKey="m" tick={{fill:tick,fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:tick,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>(v/1000000).toFixed(1)+'М'}/>
                    <Tooltip {...TT} formatter={v=>[(v/1000000).toFixed(2)+' млн','Выручка']}/>
                    <Area type="monotone" dataKey="r" stroke="#C9A84C" strokeWidth={2.5} fill="url(#gld)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, padding:22 }}>
                <div style={{ fontWeight:600, marginBottom:3 }}>Маршруты</div>
                <div style={{ fontSize:12, color:'rgba(232,237,245,.5)', marginBottom:14 }}>Доля загрузки</div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart><Pie data={PIE} cx="50%" cy="50%" outerRadius={62} dataKey="v">{PIE.map((e,i)=><Cell key={i} fill={e.c}/>)}</Pie><Tooltip {...TT}/></PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:10 }}>
                  {PIE.map(r => <div key={r.name} style={{ display:'flex', alignItems:'center', gap:7, fontSize:11 }}><div style={{ width:8, height:8, borderRadius:'50%', background:r.c, flexShrink:0 }}/><span style={{ color:'rgba(232,237,245,.5)', flex:1 }}>{r.name}</span><span style={{ fontWeight:600 }}>{r.v}%</span></div>)}
                </div>
              </div>
            </div>
            <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, padding:22 }}>
              <div style={{ fontWeight:600, marginBottom:3 }}>Бронирования по месяцам</div>
              <div style={{ fontSize:12, color:'rgba(232,237,245,.5)', marginBottom:18 }}>Количество за 2025</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={REVENUE}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid}/>
                  <XAxis dataKey="m" tick={{fill:tick,fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:tick,fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip {...TT}/>
                  <Bar dataKey="b" fill="rgba(201,168,76,.7)" radius={[5,5,0,0]} name="Бронирований"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── FLIGHTS ── */}
        {tab === 'flights' && (
          <div className="anim-up">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30 }}>Управление рейсами</h1>
              <button onClick={openAdd} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                <Plus size={15}/> Добавить рейс
              </button>
            </div>
            <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'85px 1fr 75px 75px 105px 115px 80px', padding:'11px 18px', background:'rgba(5,17,31,.6)', fontSize:10, color:'rgba(232,237,245,.4)', textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>
                {['Рейс','Маршрут','Вылет','Прилёт','Дата','Цена эк.',''].map((h,i) => <div key={i}>{h}</div>)}
              </div>
              {flights.map(f => (
                <div key={f.id} style={{ display:'grid', gridTemplateColumns:'85px 1fr 75px 75px 105px 115px 80px', padding:'14px 18px', alignItems:'center', borderBottom:'1px solid rgba(201,168,76,.07)', transition:'background .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(201,168,76,.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <div style={{ fontWeight:700, color:'#C9A84C', fontSize:13 }}>{f.flight_number}</div>
                  <div><div style={{ fontSize:13, fontWeight:500 }}>{f.from_city||f.from_code} → {f.to_city||f.to_code}</div><div style={{ fontSize:11, color:'rgba(232,237,245,.5)' }}>{f.aircraft}</div></div>
                  <div style={{ fontSize:13 }}>{String(f.departure_time||'').slice(0,5)}</div>
                  <div style={{ fontSize:13 }}>{String(f.arrival_time||'').slice(0,5)}</div>
                  <div style={{ fontSize:12, color:'rgba(232,237,245,.5)' }}>{f.flight_date}</div>
                  <div style={{ fontSize:13, color:'#C9A84C', fontWeight:500 }}>{(+f.economy_price||0).toLocaleString('ru')} сом</div>
                  <div style={{ display:'flex', gap:5 }}>
                    <button onClick={() => openEdit(f)} style={{ background:'rgba(74,144,217,.12)', border:'none', color:'#4A90D9', padding:'5px 8px', borderRadius:7, cursor:'pointer' }}><Edit size={13}/></button>
                    <button onClick={() => delFlight(f.id)} style={{ background:'rgba(239,68,68,.1)', border:'none', color:'#EF4444', padding:'5px 8px', borderRadius:7, cursor:'pointer' }}><Trash2 size={13}/></button>
                  </div>
                </div>
              ))}
              {!flights.length && <div style={{ padding:40, textAlign:'center', color:'rgba(232,237,245,.4)' }}>Рейсы не найдены</div>}
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === 'bookings' && (
          <div className="anim-up">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30 }}>Бронирования</h1>
              <div style={{ display:'flex', gap:6 }}>
                {[['all','Все'],['confirmed','Подтв.'],['pending','Ожидание'],['cancelled','Отменены']].map(([s,l]) => (
                  <button key={s} onClick={() => setBFilter(s)} style={{ padding:'7px 13px', borderRadius:8, cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:500, background: bFilter===s?'rgba(201,168,76,.15)':'transparent', border:`1px solid ${bFilter===s?'rgba(201,168,76,.3)':'rgba(201,168,76,.12)'}`, color: bFilter===s?'#C9A84C':'rgba(232,237,245,.5)' }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'95px 1fr 80px 1fr 60px 105px 85px', padding:'11px 18px', background:'rgba(5,17,31,.6)', fontSize:10, color:'rgba(232,237,245,.4)', textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>
                {['Код','Пассажир','Рейс','Маршрут','Место','Сумма','Статус'].map((h,i) => <div key={i}>{h}</div>)}
              </div>
              {filteredB.map(b => (
                <div key={b.id} style={{ display:'grid', gridTemplateColumns:'95px 1fr 80px 1fr 60px 105px 85px', padding:'14px 18px', alignItems:'center', borderBottom:'1px solid rgba(201,168,76,.07)', transition:'background .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(201,168,76,.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <div style={{ color:'#C9A84C', fontWeight:700, fontSize:12 }}>{b.pnr}</div>
                  <div><div style={{ fontSize:13, fontWeight:500 }}>{b.user_name||b.passenger_name}</div><div style={{ fontSize:11, color:'rgba(232,237,245,.5)' }}>{b.email}</div></div>
                  <div style={{ fontSize:13 }}>{b.flight_number}</div>
                  <div style={{ fontSize:12, color:'rgba(232,237,245,.5)' }}>{b.from_city&&b.to_city?`${b.from_city} → ${b.to_city}`:'-'}</div>
                  <div style={{ fontSize:13 }}>{b.seat_number}</div>
                  <div style={{ fontSize:13, color:'#C9A84C', fontWeight:500 }}>{(+b.amount||0).toLocaleString('ru')} сом</div>
                  {badge(b.status)}
                </div>
              ))}
              {!filteredB.length && <div style={{ padding:40, textAlign:'center', color:'rgba(232,237,245,.4)' }}>Нет бронирований</div>}
            </div>
            <div style={{ marginTop:12, fontSize:13, color:'rgba(232,237,245,.5)' }}>
              Показано: <strong style={{color:'#E8EDF5'}}>{filteredB.length}</strong> · Выручка: <strong style={{color:'#C9A84C'}}>{fmt(totalRev)}</strong>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="anim-up">
            <div style={{ marginBottom:22 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30 }}>Пользователи</h1>
              <p style={{ color:'rgba(232,237,245,.5)', fontSize:13, marginTop:4 }}>Зарегистрировано: {USERS_MOCK.length} пользователя</p>
            </div>
            <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 90px 115px 115px 75px', padding:'11px 18px', background:'rgba(5,17,31,.6)', fontSize:10, color:'rgba(232,237,245,.4)', textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>
                {['Пользователь','Контакты','Брон.','Потрачено','Регистрация','Статус'].map((h,i)=><div key={i}>{h}</div>)}
              </div>
              {USERS_MOCK.map(u => (
                <div key={u.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 90px 115px 115px 75px', padding:'14px 18px', alignItems:'center', borderBottom:'1px solid rgba(201,168,76,.07)', transition:'background .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(201,168,76,.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,rgba(201,168,76,.3),rgba(201,168,76,.08))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#C9A84C', flexShrink:0 }}>{u.name[0]}</div>
                    <div><div style={{ fontSize:13, fontWeight:500 }}>{u.name}</div><div style={{ fontSize:11, color:'rgba(232,237,245,.5)' }}>ID: {u.id}</div></div>
                  </div>
                  <div><div style={{ fontSize:13 }}>{u.email}</div><div style={{ fontSize:11, color:'rgba(232,237,245,.5)' }}>{u.phone}</div></div>
                  <div style={{ fontSize:13 }}>{u.bookings}</div>
                  <div style={{ fontSize:12, color:'#C9A84C', fontWeight:500 }}>{Math.round(u.spent/1000)}к сом</div>
                  <div style={{ fontSize:12, color:'rgba(232,237,245,.5)' }}>{u.since}</div>
                  <span style={{ background: u.status==='active'?'rgba(16,185,129,.15)':'rgba(239,68,68,.15)', color: u.status==='active'?'#10B981':'#EF4444', padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:600 }}>{u.status==='active'?'Активен':'Неактив.'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div className="anim-up">
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, marginBottom:26 }}>Настройки системы</h1>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, maxWidth:720, marginBottom:24 }}>
              {[['Название компании','Авиакомпания Керемет'],['Email уведомлений','info@keremet.kg'],['Телефон поддержки','+996 312 55-00-00'],['Базовая валюта','KGS (Кыргызский сом)'],['Макс. пассажиров','9'],['SMTP сервер','smtp.mail.ru:465']].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize:10, color:'rgba(232,237,245,.5)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                  <input defaultValue={v} style={{ width:'100%', padding:'12px 14px', borderRadius:10, background:'rgba(5,17,31,.7)', border:'1px solid rgba(201,168,76,.18)', color:'#E8EDF5', fontSize:14 }} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setSaveOk(true); setTimeout(() => setSaveOk(false), 2500); }} style={{ padding:'12px 28px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:14, cursor:'pointer' }}>Сохранить изменения</button>
              <button style={{ padding:'12px 22px', borderRadius:10, background:'transparent', border:'1px solid rgba(201,168,76,.35)', color:'#C9A84C', fontSize:14, cursor:'pointer' }}>Сбросить</button>
            </div>
            {saveOk && <div style={{ marginTop:12, color:'#10B981', fontSize:13 }}>✓ Настройки сохранены!</div>}
          </div>
        )}
      </div>

      {/* ── FLIGHT MODAL ── */}
      {modal === 'flight' && (
        <div onClick={() => setModal(null)} style={{ position:'fixed', inset:0, background:'rgba(5,17,31,.9)', backdropFilter:'blur(6px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#0C1E35', border:'1px solid rgba(201,168,76,.18)', borderRadius:20, padding:32, width:540, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto', animation:'slideUp .3s ease-out' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#C9A84C' }}>{editId ? 'Редактировать рейс' : 'Добавить рейс'}</h2>
              <button onClick={() => setModal(null)} style={{ background:'transparent', border:'none', color:'rgba(232,237,245,.5)', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {inp('flight_number','Номер рейса','KM101')}
              {inp('departure_time','Время вылета','08:00')}
              {inp('arrival_time','Время прилёта','09:30')}
              {inp('duration','Длительность','1ч 30м')}
              {inp('flight_date','Дата','2025-06-15','date')}
              {inp('aircraft','Самолёт','Airbus A320')}
              {inp('economy_price','Цена эконом','3500')}
              {inp('business_price','Цена бизнес','8900')}
              {inp('economy_seats','Мест эконом','150')}
              {inp('business_seats','Мест бизнес','24')}
              {[['from_code','Откуда'],['to_code','Куда']].map(([k,l]) => (
                <div key={k}>
                  <div style={{ fontSize:10, color:'rgba(232,237,245,.5)', marginBottom:5, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                  <select value={fForm[k]||'FRU'} onChange={e => setFForm({...fForm,[k]:e.target.value})} style={{ width:'100%', padding:'10px 13px', borderRadius:9, background:'rgba(5,17,31,.7)', border:'1px solid rgba(201,168,76,.18)', color:'#E8EDF5', fontSize:13 }}>
                    {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10, marginTop:22 }}>
              <button onClick={() => setModal(null)} style={{ flex:1, padding:12, borderRadius:10, background:'transparent', border:'1px solid rgba(201,168,76,.35)', color:'#C9A84C', cursor:'pointer', fontSize:14 }}>Отмена</button>
              <button onClick={saveFlight} style={{ flex:2, padding:12, borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                {editId ? 'Сохранить изменения' : 'Добавить рейс'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
