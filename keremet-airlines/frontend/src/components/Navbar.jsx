import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plane, LogOut, X } from 'lucide-react';
import { loginThunk, registerThunk, logout, clearError } from '../store';

export default function Navbar() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, loading, error } = useSelector(s => s.auth);
  const [modal, setModal]   = useState(null); // 'login' | 'register' | 'admin'
  const [form, setForm]     = useState({ name:'', email:'', phone:'', password:'' });
  const isAdmin = user?.role === 'admin';
  const cur = location.pathname;

  const closeModal = () => { setModal(null); dispatch(clearError()); setForm({ name:'', email:'', phone:'', password:'' }); };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginThunk({ email: form.email, password: form.password }));
    if (!res.error) { closeModal(); if (res.payload?.user?.role === 'admin') navigate('/admin'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerThunk(form));
    if (!res.error) closeModal();
  };

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  const navBtn = (to, label) => {
    const active = cur === to || cur.startsWith(to + '/');
    return (
      <Link to={to} style={{
        padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:500, textDecoration:'none',
        background: active ? 'rgba(201,168,76,.12)' : 'transparent',
        border: `1px solid ${active ? 'rgba(201,168,76,.3)' : 'transparent'}`,
        color: active ? '#C9A84C' : 'rgba(232,237,245,.5)',
        transition:'all .2s',
      }}>{label}</Link>
    );
  };

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, height:62, zIndex:100,
        background:'rgba(5,17,31,.95)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(201,168,76,.12)',
        display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#C9A84C,#8B6914)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Plane size={17} color="#05111F" />
          </div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:'#C9A84C', lineHeight:1 }}>КЕРЕМЕТ</div>
            <div style={{ fontSize:8, color:'rgba(232,237,245,.4)', letterSpacing:2, textTransform:'uppercase' }}>Airlines</div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display:'flex', gap:4 }}>
          {navBtn('/', 'Главная')}
          {navBtn('/flights', 'Рейсы')}
          {user && !isAdmin && navBtn('/profile', 'Мои билеты')}
          {isAdmin && navBtn('/admin', 'Панель управления')}
        </div>

        {/* Auth buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {user ? (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#C9A84C,#8B6914)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#05111F' }}>{user.name[0]}</div>
                <span style={{ fontSize:13 }}>{user.name}</span>
              </div>
              <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'1px solid rgba(239,68,68,.3)', color:'#EF4444', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontSize:12 }}>
                <LogOut size={13} /> Выйти
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setModal('login')} style={{ padding:'7px 16px', borderRadius:8, background:'transparent', border:'1px solid rgba(201,168,76,.35)', color:'#C9A84C', cursor:'pointer', fontSize:13 }}>Войти</button>
              <button onClick={() => setModal('admin')} style={{ padding:'7px 16px', borderRadius:8, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', cursor:'pointer', fontSize:13, fontWeight:700 }}>Для сотрудников</button>
            </>
          )}
        </div>
      </nav>

      {/* Modal */}
      {modal && (
        <div onClick={closeModal} style={{ position:'fixed', inset:0, background:'rgba(5,17,31,.88)', backdropFilter:'blur(6px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#0C1E35', border:'1px solid rgba(201,168,76,.18)', borderRadius:20, padding:36, width:400, maxWidth:'94vw', animation:'slideUp .3s ease-out' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'#C9A84C' }}>
                {{ login:'Войти', register:'Регистрация', admin:'Вход для сотрудников' }[modal]}
              </h2>
              <button onClick={closeModal} style={{ background:'transparent', border:'none', color:'rgba(232,237,245,.5)', cursor:'pointer' }}><X size={20} /></button>
            </div>

            {modal === 'admin' && (
              <div style={{ background:'rgba(201,168,76,.08)', border:'1px solid rgba(201,168,76,.2)', borderRadius:10, padding:'10px 14px', marginBottom:18, fontSize:13, color:'rgba(232,237,245,.6)' }}>
                🔑 Демо: <strong style={{color:'#C9A84C'}}>admin@keremet.kg</strong> / <strong style={{color:'#C9A84C'}}>admin123</strong>
              </div>
            )}

            <form onSubmit={modal === 'register' ? handleRegister : handleLogin}>
              {modal === 'register' && (
                <>
                  {[['name','Имя','Иван'],['phone','Телефон','+996 700 000000']].map(([k,l,ph]) => (
                    <div key={k} style={{ marginBottom:14 }}>
                      <div style={{ fontSize:11, color:'rgba(232,237,245,.5)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                      <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={ph}
                        style={{ width:'100%', padding:'12px 15px', borderRadius:10, background:'rgba(5,17,31,.7)', border:'1px solid rgba(201,168,76,.18)', color:'#E8EDF5', fontSize:14 }} />
                    </div>
                  ))}
                </>
              )}
              {[['email','Email','admin@keremet.kg'],['password','Пароль','••••••••']].map(([k,l,ph]) => (
                <div key={k} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:'rgba(232,237,245,.5)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                  <input type={k==='password'?'password':'email'} value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={ph}
                    style={{ width:'100%', padding:'12px 15px', borderRadius:10, background:'rgba(5,17,31,.7)', border:'1px solid rgba(201,168,76,.18)', color:'#E8EDF5', fontSize:14 }} />
                </div>
              ))}
              {error && <div style={{ color:'#EF4444', fontSize:13, marginBottom:10 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ width:'100%', padding:13, borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', border:'none', color:'#05111F', fontSize:15, fontWeight:700, cursor:'pointer', marginTop:4 }}>
                {loading ? 'Загрузка...' : modal === 'register' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </form>

            {modal === 'login' && (
              <p style={{ textAlign:'center', marginTop:14, fontSize:13, color:'rgba(232,237,245,.5)' }}>
                Нет аккаунта?{' '}
                <span onClick={() => setModal('register')} style={{ color:'#C9A84C', cursor:'pointer' }}>Зарегистрироваться</span>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}