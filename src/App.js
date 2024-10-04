import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Room from './pages/Room';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
  );
}

export default App;
