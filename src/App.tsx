import { useState } from 'react'
import dicelogo from './assets/dice.png'
import './App.css'

import WebApp from '@twa-dev/sdk'

function App() {
  WebApp.setHeaderColor("secondary_bg_color")
  const [count, setCount] = useState(0)

  const mainbutton = WebApp.MainButton;
  mainbutton.setText('START TRACK');
  mainbutton.show();
  mainbutton.onClick(() => {
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    alert(`Track started at: ${formattedTime}`);
  });
  


  return (
    <>
      <div>
        <a  target="_blank">
          <img src={dicelogo} className="logo" alt="Dice logo" />
        </a>
      </div>
      <h1>DICE Time Tracker</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      {/*  */}
      <div className="card">
        <button onClick={() => WebApp.showAlert(`Hello World! Current count is ${count}`)}>
            Show Alert
        </button>
      </div>
    </>
  )
}

export default App


