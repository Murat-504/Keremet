import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Check } from 'lucide-react';

export default function DonePage() {
  const navigate  = useNavigate();
  const { lastCreated } = useSelector(s => s.bookings);

  if (!lastCreated) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ paddingTop:100, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'100px 20px 40px' }}>
      <div style={{ textAlign:'center', maxWidth:500 }} className="anim-up">
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(16,185,129,.15)', border:'2px solid #10B981', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', color:'#10B981' }}>
          <Check size={38} />
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, marginBottom:14 }}>Бронирование подтверждено!</h1>
        <p style={{ color:'rgba(232,237,245,.5)', marginBottom:28, fontSize:15, lineHeight:1.7 }}>
          Электронный билет отправлен на{' '}
          <strong style={{ color:'#C9A84C' }}>{lastCreated.email}</strong>
        </p>

        <div style={{ background:'rgba(12,30,53,.75)', border:'1px solid rgba(201,168,76,.18)', borderRadius:16, padding:24, marginBottom:28, textAlign:'left' }}>
          <div style={{ fontSize:12, color:'rgba(232,237,245,.5)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Код бронирования (PNR)</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:700, color:'#C9A84C', letterSpacing:5, marginBottom:16 }}>{lastCreated.pnr}</div>
          <div style={{ borderTop:'1px solid rgba(201,168,76,.15)', paddingTop:14, display:'flex', flexDirection:'column', gap:6, fontSize:13, color:'rgba(232,237,245,.5)' }}>
            <div>Пассажир: <strong style={{ color:'#E8EDF5' }}>{lastCreated.passenger_name}</strong></div>
            <div>Место: <strong style={{ color:'#C9A84C' }}>{lastCreated.seat_number || '—'}</strong> · {lastCreated.class === 'economy' ? 'Эконом' : 'Бизнес'}</div>
            <div>Сумма: <strong style={{ color:'#C9A84C' }}>{(lastCreated.amount || 0).toLocaleString('ru')} сом</strong></div>
          </div>
        </div>

        <button onClick={() => navigate('/')} style={{ padding:'14px 40px', borderRadius:12, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontWeight:700, fontSize:16, cursor:'pointer' }}>
          На главную
        </button>
      </div>
    </div>
  );
}
