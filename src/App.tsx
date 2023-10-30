import dicelogo from './assets/dice.png'
import './App.css'

import WebApp from '@twa-dev/sdk'

function App() {
  WebApp.setHeaderColor("secondary_bg_color")

  const mainbutton = WebApp.MainButton;
  mainbutton.setText('START TRACK');
  mainbutton.show();
  mainbutton.onClick(() => {
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    alert(`Track started at: ${formattedTime}`);
    WebApp.CloudStorage.setItem("started_at", formattedTime)
  });
  WebApp.CloudStorage.getItem("started_at")


  return (
    <>
      <div>
        <a  target="_blank">
          <img src={dicelogo} className="logo" alt="Dice logo" />
        </a>
      </div>
      <h1>DICE Time Tracker</h1>
      <div className="card">
      WebApp.CloudStorage.getItem("started_at")
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


