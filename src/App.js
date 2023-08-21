import React from 'react';
import './App.css';
import Dropzone from './components/Dropzone.tsx';
import StripeContainer from './components/StripeContainer.tsx';
import MyForm from './components/Form.jsx';
import Payement from './components/Payement.tsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MyForm />} />
        <Route path="payement" element={<StripeContainer />} />
        <Route path="payement/dropzone" element={<Dropzone />} />
      </Routes>
    </Router>
  );
}

export default App;
