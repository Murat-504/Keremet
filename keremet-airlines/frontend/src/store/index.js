import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ── Axios instance ──────────────────────────────────
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('km_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ══════════════════════════════════════════════════════
//   AUTH SLICE
// ══════════════════════════════════════════════════════
export const loginThunk = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    localStorage.setItem('km_token', data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || 'Ошибка входа'); }
});

export const registerThunk = createAsyncThunk('auth/register', async (form, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('km_token', data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || 'Ошибка регистрации'); }
});

export const fetchMeThunk = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/auth/me'); return data; }
  catch (e) { localStorage.removeItem('km_token'); return rejectWithValue(''); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    logout(state) { state.user = null; localStorage.removeItem('km_token'); },
    clearError(state) { state.error = null; },
  },
  extraReducers: b => b
    .addCase(loginThunk.pending,    s => { s.loading = true;  s.error = null; })
    .addCase(loginThunk.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload.user; })
    .addCase(loginThunk.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
    .addCase(registerThunk.pending,   s => { s.loading = true;  s.error = null; })
    .addCase(registerThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; })
    .addCase(registerThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
    .addCase(fetchMeThunk.fulfilled,  (s, a) => { s.user = a.payload; s.initialized = true; })
    .addCase(fetchMeThunk.rejected,   s => { s.initialized = true; }),
});

// ══════════════════════════════════════════════════════
//   FLIGHTS SLICE
// ══════════════════════════════════════════════════════
export const fetchFlightsThunk = createAsyncThunk('flights/fetchAll', async (params = {}) => {
  const { data } = await api.get('/flights', { params });
  return data;
});

export const createFlightThunk = createAsyncThunk('flights/create', async (body, { rejectWithValue }) => {
  try { const { data } = await api.post('/flights', body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const updateFlightThunk = createAsyncThunk('flights/update', async ({ id, ...body }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/flights/${id}`, body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const deleteFlightThunk = createAsyncThunk('flights/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/flights/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

const flightsSlice = createSlice({
  name: 'flights',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: b => b
    .addCase(fetchFlightsThunk.pending,   s => { s.loading = true; })
    .addCase(fetchFlightsThunk.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
    .addCase(fetchFlightsThunk.rejected,  s => { s.loading = false; })
    .addCase(createFlightThunk.fulfilled, (s, a) => { s.list.push(a.payload); })
    .addCase(updateFlightThunk.fulfilled, (s, a) => {
      const i = s.list.findIndex(f => f.id === a.payload.id);
      if (i >= 0) s.list[i] = a.payload;
    })
    .addCase(deleteFlightThunk.fulfilled, (s, a) => {
      s.list = s.list.filter(f => f.id !== a.payload);
    }),
});

// ══════════════════════════════════════════════════════
//   BOOKINGS SLICE
// ══════════════════════════════════════════════════════
export const fetchBookingsThunk = createAsyncThunk('bookings/fetchAll', async () => {
  const { data } = await api.get('/bookings'); return data;
});

export const createBookingThunk = createAsyncThunk('bookings/create', async (body, { rejectWithValue }) => {
  try { const { data } = await api.post('/bookings', body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const cancelBookingThunk = createAsyncThunk('bookings/cancel', async (id, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/bookings/${id}/cancel`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { list: [], loading: false, lastCreated: null },
  reducers: { clearLastCreated(s) { s.lastCreated = null; } },
  extraReducers: b => b
    .addCase(fetchBookingsThunk.pending,   s => { s.loading = true; })
    .addCase(fetchBookingsThunk.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
    .addCase(createBookingThunk.fulfilled, (s, a) => { s.lastCreated = a.payload; s.list.unshift(a.payload); })
    .addCase(cancelBookingThunk.fulfilled, (s, a) => {
      const i = s.list.findIndex(b => b.id === a.payload.id);
      if (i >= 0) s.list[i] = a.payload;
    }),
});

// ══════════════════════════════════════════════════════
//   AIRPORTS SLICE
// ══════════════════════════════════════════════════════
export const fetchAirportsThunk = createAsyncThunk('airports/fetchAll', async () => {
  const { data } = await api.get('/airports'); return data;
});

const airportsSlice = createSlice({
  name: 'airports',
  initialState: { list: [] },
  reducers: {},
  extraReducers: b => b.addCase(fetchAirportsThunk.fulfilled, (s, a) => { s.list = a.payload; }),
});

// ══════════════════════════════════════════════════════
//   STORE
// ══════════════════════════════════════════════════════
export const store = configureStore({
  reducer: {
    auth:     authSlice.reducer,
    flights:  flightsSlice.reducer,
    bookings: bookingsSlice.reducer,
    airports: airportsSlice.reducer,
  },
});

export const { logout, clearError } = authSlice.actions;
export const { clearLastCreated }   = bookingsSlice.actions;

export default api;
