import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plane, Calendar, ArrowRight } from 'lucide-react';
import { fetchBookingsThunk } from '../store';

/* ── Boarding Pass ── */
function BoardingPass({ b }) {
  const STATUS = {
    confirmed: { bg: 'rgba(16,185,129,.15)', color: '#10B981', label: '✓ Подтверждено' },
    pending:   { bg: 'rgba(245,158,11,.15)',  color: '#F59E0B', label: '⏱ Ожидание оплаты' },
    cancelled: { bg: 'rgba(239,68,68,.15)',   color: '#EF4444', label: '✕ Отменено' },
  };
  const st = STATUS[b.status] || STATUS.pending;
  const dep = String(b.departure_time || '').slice(0, 5) || '—';
  const arr = String(b.arrival_time  || '').slice(0, 5) || '—';

  return (
    <div style={{
      display: 'flex',
      background: b.status === 'cancelled' ? 'rgba(12,30,53,.5)' : 'rgba(12,30,53,.9)',
      border: `1px solid ${b.status === 'cancelled' ? 'rgba(201,168,76,.08)' : 'rgba(201,168,76,.22)'}`,
      borderRadius: 18,
      overflow: 'hidden',
      opacity: b.status === 'cancelled' ? 0.65 : 1,
      transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,168,76,.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* ── MAIN BODY ── */}
      <div style={{ flex: 1, padding: '22px 26px' }}>

        {/* Airline + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#C9A84C,#8B6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plane size={15} color="#05111F" />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, color: '#C9A84C', fontWeight: 700, letterSpacing: 1.5 }}>КЕРЕМЕТ</div>
              <div style={{ fontSize: 10, color: 'rgba(232,237,245,.35)', letterSpacing: 1 }}>Airlines</div>
            </div>
          </div>
          <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
        </div>

        {/* Route — big */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 700, lineHeight: 1, color: '#E8EDF5' }}>
              {b.from_code || (b.from_city ? b.from_city.slice(0, 3).toUpperCase() : '???')}
            </div>
            <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 5, fontWeight: 500 }}>{b.from_city || '—'}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(232,237,245,.6)', marginTop: 2 }}>{dep}</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 6 }}>
              <div style={{ flex: 1, borderTop: '2px dashed rgba(201,168,76,.2)' }} />
              <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C' }}>
                <Plane size={16} />
              </div>
              <div style={{ flex: 1, borderTop: '2px dashed rgba(201,168,76,.2)' }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(232,237,245,.3)', letterSpacing: 1 }}>Прямой рейс</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 700, lineHeight: 1, color: '#E8EDF5' }}>
              {b.to_code || (b.to_city ? b.to_city.slice(0, 3).toUpperCase() : '???')}
            </div>
            <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 5, fontWeight: 500 }}>{b.to_city || '—'}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(232,237,245,.6)', marginTop: 2 }}>{arr}</div>
          </div>
        </div>

        {/* Details row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1.5px dashed rgba(201,168,76,.12)', paddingTop: 18 }}>
          {[
            ['ПАССАЖИР', b.passenger_name || b.user_name || '—'],
            ['ДАТА', b.flight_date || '—'],
            ['САМОЛЁТ', b.aircraft || '—'],
            ['КЛАСС', b.class === 'business' ? '💼 Бизнес' : '✈ Эконом'],
          ].map(([label, val]) => (
            <div key={label} style={{ paddingRight: 12 }}>
              <div style={{ fontSize: 9, color: 'rgba(232,237,245,.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#E8EDF5' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TEAR LINE ── */}
      <div style={{
        width: 1,
        background: 'repeating-linear-gradient(to bottom, rgba(201,168,76,.22) 0, rgba(201,168,76,.22) 7px, transparent 7px, transparent 13px)',
        margin: '14px 0',
        flexShrink: 0,
      }} />

      {/* ── STUB / ТАЛОН ── */}
      <div style={{ width: 140, padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

        {/* Seat */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'rgba(232,237,245,.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Место</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>
            {b.seat_number || '—'}
          </div>
        </div>

        {/* PNR */}
        <div style={{ textAlign: 'center', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 10, padding: '10px 12px', width: '100%' }}>
          <div style={{ fontSize: 9, color: 'rgba(232,237,245,.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>PNR-код</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#C9A84C', letterSpacing: 2 }}>
            {b.pnr || '—'}
          </div>
        </div>

        {/* Flight number + amount */}
        <div style={{ textAlign: 'center', width: '100%', borderTop: '1.5px dashed rgba(201,168,76,.12)', paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,.35)', marginBottom: 4 }}>{b.flight_number || '—'}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>
            {(+b.amount || 0).toLocaleString('ru')} сом
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Profile Page ── */
export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user }                   = useSelector(s => s.auth);
  const { list: bookings, loading } = useSelector(s => s.bookings);

  useEffect(() => { dispatch(fetchBookingsThunk()); }, [dispatch]);

  const active   = bookings.filter(b => b.status === 'confirmed').length;
  const spent    = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (+b.amount || 0), 0);

  return (
    <div style={{ paddingTop: 62, minHeight: '100vh', background: '#05111F' }}>
      {/* Header */}
      <div style={{ background: '#0C1E35', borderBottom: '1px solid rgba(201,168,76,.12)', padding: '32px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 66, height: 66, borderRadius: 18, background: 'linear-gradient(135deg,#C9A84C,#8B6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#05111F', flexShrink: 0 }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: '#E8EDF5', marginBottom: 4 }}>{user?.name}</h1>
            <p style={{ color: 'rgba(232,237,245,.45)', fontSize: 13 }}>{user?.email}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 28 }}>
            {[['Всего билетов', bookings.length], ['Активных', active], ['Потрачено', spent.toLocaleString('ru') + ' сом']].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: '#C9A84C', fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(232,237,245,.4)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets list */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: '#E8EDF5' }}>
            Мои билеты <span style={{ fontSize: 18, color: 'rgba(232,237,245,.3)' }}>({bookings.length})</span>
          </h2>
          <Link to="/flights" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10,
            background: 'linear-gradient(135deg,#C9A84C,#8B6914)',
            color: '#05111F', fontWeight: 700, fontSize: 13, textDecoration: 'none',
          }}>
            <Plane size={14} /> Купить билет
          </Link>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(232,237,245,.4)', fontSize: 15 }}>
            Загрузка билетов...
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '70px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 18, opacity: .25 }}>🎫</div>
            <p style={{ color: 'rgba(232,237,245,.4)', fontSize: 17, marginBottom: 24 }}>Билетов пока нет</p>
            <Link to="/flights" style={{
              padding: '13px 32px', borderRadius: 11,
              background: 'linear-gradient(135deg,#C9A84C,#8B6914)',
              color: '#05111F', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block',
            }}>
              Найти рейс
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {bookings.map(b => <BoardingPass key={b.id} b={b} />)}
        </div>
      </div>
    </div>
  );
}
