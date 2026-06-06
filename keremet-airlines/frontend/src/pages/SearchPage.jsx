import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plane } from 'lucide-react';
import { fetchFlightsThunk } from '../store';

const fmt = n => (n || 0).toLocaleString('ru') + ' сом';

export default function SearchPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const { list, loading } = useSelector(s => s.flights);
  const airports   = useSelector(s => s.airports.list);
  const { user }   = useSelector(s => s.auth);
  const [cls, setCls] = useState('economy');

  const from = params.get('from') || '';
  const to   = params.get('to')   || '';
  const date = params.get('date') || '';
  const fromCity = airports.find(a => a.code === from)?.city || from;
  const toCity   = airports.find(a => a.code === to)?.city   || to;

  useEffect(() => {
    dispatch(fetchFlightsThunk({ from, to, date }));
  }, [dispatch, from, to, date]);

  const handleBook = (flight) => {
    if (!user) return alert('Войдите в аккаунт для бронирования');
    navigate(`/booking/${flight.id}?cls=${cls}`);
  };

  const clsBtn = (id, label) => (
    <button onClick={() => setCls(id)} style={{
      padding:'7px 14px', borderRadius:8, cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:500,
      background: cls === id ? 'rgba(201,168,76,.15)' : 'transparent',
      border:`1px solid ${cls === id ? 'rgba(201,168,76,.3)' : 'rgba(201,168,76,.12)'}`,
      color: cls === id ? '#C9A84C' : 'rgba(232,237,245,.5)',
    }}>{label}</button>
  );

  return (
    <div style={{ paddingTop:62, minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'#0C1E35', borderBottom:'1px solid rgba(201,168,76,.1)', padding:'18px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26 }}>{fromCity} → {toCity}</h1>
          <div style={{ color:'rgba(232,237,245,.5)', fontSize:13, marginTop:3 }}>
            {date ? new Date(date).toLocaleDateString('ru', { day:'numeric', month:'long', year:'numeric' }) : 'Все даты'}
            {params.get('pax') ? ` · ${params.get('pax')} пасс.` : ''}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:13, color:'rgba(232,237,245,.5)' }}>Класс:</span>
          {clsBtn('economy', '✈ Эконом')}
          {clsBtn('business', '💼 Бизнес')}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px' }}>
        {loading && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(232,237,245,.5)' }}>
            <div style={{ fontSize:16 }}>Поиск рейсов...</div>
          </div>
        )}

        {!loading && list.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0', color:'rgba(232,237,245,.5)' }}>
            <Plane size={52} style={{ marginBottom:16, opacity:.3 }} />
            <p style={{ fontSize:17 }}>Рейсы по данному маршруту не найдены</p>
            <button onClick={() => navigate('/flights')} style={{ marginTop:20, padding:'11px 26px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              Смотреть все рейсы
            </button>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {list.map(f => {
            const price = cls === 'economy' ? f.economy_price : f.business_price;
            const left  = cls === 'economy' ? f.economy_seats : f.business_seats;
            const low   = left < 10;
            return (
              <div key={f.id} style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, padding:24, display:'flex', alignItems:'center', gap:24, transition:'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,.18)'}>
                <div style={{ width:52, height:52, borderRadius:13, background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C9A84C', flexShrink:0 }}>
                  <Plane size={22} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:9 }}>
                    <div>
                      <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Playfair Display',serif", lineHeight:1 }}>
                        {String(f.departure_time || '').slice(0,5)}
                      </div>
                      <div style={{ fontSize:12, color:'#C9A84C', fontWeight:500, marginTop:3 }}>{f.from_city}</div>
                    </div>
                    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <div style={{ fontSize:12, color:'rgba(232,237,245,.5)' }}>{f.duration}</div>
                      <div style={{ display:'flex', alignItems:'center', width:'100%', gap:5 }}>
                        <div style={{ flex:1, height:1, background:'rgba(201,168,76,.2)' }} />
                        <span style={{ color:'#C9A84C', fontSize:13 }}>✈</span>
                        <div style={{ flex:1, height:1, background:'rgba(201,168,76,.2)' }} />
                      </div>
                      <div style={{ fontSize:10, color:'rgba(232,237,245,.2)' }}>Прямой рейс</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Playfair Display',serif", lineHeight:1 }}>
                        {String(f.arrival_time || '').slice(0,5)}
                      </div>
                      <div style={{ fontSize:12, color:'#C9A84C', fontWeight:500, marginTop:3 }}>{f.to_city}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:18, fontSize:12, color:'rgba(232,237,245,.5)' }}>
                    <span>✈ {f.flight_number}</span>
                    <span>🛫 {f.aircraft}</span>
                    <span style={{ color: low ? '#F59E0B' : 'rgba(232,237,245,.5)' }}>
                      {low ? `⚠ Осталось ${left} мест!` : `${left} мест`}
                    </span>
                    <span style={{ background:'rgba(16,185,129,.15)', color:'#10B981', padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:600 }}>
                      {f.status === 'scheduled' ? '✓ По расписанию' : f.status}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:11, color:'rgba(232,237,245,.5)', marginBottom:4 }}>{cls === 'economy' ? 'Эконом' : 'Бизнес'}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#C9A84C', marginBottom:12 }}>{fmt(price)}</div>
                  <button onClick={() => handleBook(f)} style={{ padding:'10px 22px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                    Выбрать
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
