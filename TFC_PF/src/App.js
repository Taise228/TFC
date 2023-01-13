import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/login';
import User from './components/User';
import { useState } from 'react';
import Logout from './components/Logout';
import Subscribe from './components/Subscribe';
import Studio from './components/Studio';
import StudioInfo from './components/StudioInfo';
import Class from './components/Class';
import Payment from './components/payment';
import Enrolled from './components/Enrolled';
import StudioEdit from './components/StudioEdit';
import Plan from './components/Plan';
import MakeClass from './components/MakeClass';

function App() {
  const base_url = 'http://127.0.0.1:8000/'
  const google_api_key = '';
  const [is_authenticated, setAuthenticated] = useState(false);
  const [is_admin, setIsAdmin] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout is_authenticated={is_authenticated} is_admin={is_admin} />}>
          <Route path='' element={<Home base_url={base_url} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />}></Route>
          <Route path='signup' element={<Signup base_url={base_url} />} />
          <Route path='login' element={<Login base_url={base_url} authentication={value => setAuthenticated(value)} />} />
          <Route path='logout' element={<Logout authentication={value => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
          <Route path='user' element={<User base_url={base_url} authentication={value => setAuthenticated(value)} admin={value => setIsAdmin(value)} is_admin={is_admin} />} />
          <Route path='subscribe' element={<Subscribe base_url={base_url} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
          <Route path='studio' element={<Studio base_url={base_url} api_key={google_api_key} is_admin={is_admin} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />}></Route>
          <Route path='studio/:id' element={<StudioInfo base_url={base_url} api_key={google_api_key} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
          <Route path='class' element={<Class base_url={base_url} is_authenticated={is_authenticated} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
          <Route path='payment' element={<Payment base_url={base_url} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
          <Route path='enrolled' element={<Enrolled base_url={base_url} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
          <Route path='studio_edit' element={<StudioEdit base_url={base_url} api_key={google_api_key} is_authenticated={is_authenticated} is_admin={is_admin} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
          <Route path='plan' base_url={base_url} element={<Plan base_url={base_url} is_admin={is_admin} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
          <Route path='make_class' base_url={base_url} element={<MakeClass base_url={base_url} authentication={(value) => setAuthenticated(value)} admin={value => setIsAdmin(value)} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
