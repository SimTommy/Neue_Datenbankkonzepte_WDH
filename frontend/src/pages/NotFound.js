import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>404 - Seite nicht gefunden</h1>
      <p>Es tut uns leid, die von dir gesuchte Seite konnte nicht gefunden werden.</p>
      <Link to="/">Zurück zur Startseite</Link>
    </div>
  );
}

export default NotFound;
