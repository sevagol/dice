import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';

function App() {
  const [started, setStarted] = useState(""); // Используем состояние для хранения значения

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");

    const mainbutton = WebApp.MainButton;
    mainbutton.setText('START TRACK');
    mainbutton.show();
    mainbutton.onClick(() => {
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleTimeString();
      alert(`Track started at: ${formattedTime}`);
      WebApp.CloudStorage.setItem("started_at", formattedTime);
      setStarted(formattedTime); // Обновляем значение в состоянии
    });

    const key = "started_at"; // Ваш ключ для получения значения

    WebApp.CloudStorage.getItem(key, (error, result) => {
      if (error) {
        console.error("Произошла ошибка при получении данных:", error);
      } else if (result) {
        // Обновляем значение в состоянии
        setStarted(result);
      }
    });
  }, []);

  return (
    <>
      <div>
        <a target="_blank">
          <img src={dicelogo} className="logo" alt="Dice logo" />
        </a>
      </div>
      <h1>DICE Time Tracker</h1>
      <div className="card">
        {started}
      </div>
    </>
  );
}

export default App;
