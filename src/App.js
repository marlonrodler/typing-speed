import React from 'react'
import { HashRouter  as Router, Routes, Route} from "react-router-dom";

import './App.css';

import Typing from './pages/Typing'

function App() {
  return (
    <Router>
        <Routes>
          <Route path='/' element={<Typing/>} />
        </Routes>
    </Router>
  );
}

export default App;