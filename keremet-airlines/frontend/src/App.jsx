import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeThunk, fetchAirportsThunk } from './store';
import Navbar    from './components/Navbar';
import HomePage  from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookingPage from './pages/BookingPage';
import DonePage  from './pages/DonePage';
import AdminPage   from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, initialized } = useSelector(s => s.auth);
  if (!initialized) return <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#C9A84C',fontSize:18}}>Загрузка...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('km_token')) dispatch(fetchMeThunk());
    dispatch(fetchAirportsThunk());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/flights"  element={<SearchPage />} />
        <Route path="/booking/:flightId" element={
          <PrivateRoute><BookingPage /></PrivateRoute>
        } />
        <Route path="/done"     element={
          <PrivateRoute><DonePage /></PrivateRoute>
        } />
        <Route path="/profile"  element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />
        <Route path="/admin/*"  element={
          <PrivateRoute adminOnly><AdminPage /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}