import { listen } from '@tauri-apps/api/event';
import React, { useState } from 'react';

import './App.css';

function Updater() {
  const [getValue, setValue] = useState('');

  void listen('tauri://update-status', function (res) {
    console.log(res);
    setValue(JSON.stringify(res.payload));
  });
  return (
    <div className="container">
      <h1>Update status</h1>

      <div className="row">{getValue}</div>
    </div>
  );
}

export default Updater;
