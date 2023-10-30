import { useState } from 'react'
import dicelogo from './assets/dice.png'
import './App.css'

import WebApp from '@twa-dev/sdk'

function App() {
  const [count, setCount] = useState(0)
  const mainbutton = WebApp.MainButton;
  mainbutton.setText('DICE');
  mainbutton.show();
  mainbutton.onClick(() => alert('submitted'));
  


  return (
    <>
      <div>
        <a  target="_blank">
          <img src={dicelogo} className="logo" alt="Dice logo" />
        </a>
      </div>
      <h1>TWA + Vite + React</h1>
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


