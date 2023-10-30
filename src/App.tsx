import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';

function App() {
  const [started, setStarted] = useState("");
  const [ended, setEnded] = useState("");
  const [duration, setDuration] = useState(""); // Состояние для хранения продолжительности времени

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
      setStarted(formattedTime);
    });

    const key = "started_at";

    WebApp.CloudStorage.getItem(key, (error, result) => {
      if (error) {
        console.error("Произошла ошибка при получении данных:", error);
      } else if (result) {
        setStarted(result);
      }
    });
  }, []);

  // Обработчик для второго нажатия на MainButton
  const handleSecondClick = () => {
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    alert(`Track ended at: ${formattedTime}`);
    WebApp.CloudStorage.setItem("ended_at", formattedTime);
    setEnded(formattedTime);

    if (started && ended) {
      // Вычисляем продолжительность времени
      const startTime = new Date(started);
      const endTime = new Date(ended);
      const timeDiff = endTime - startTime;

      // Преобразуем продолжительность времени в минуты (или другой формат, по вашему выбору)
      const minutes = Math.floor(timeDiff / 60000); // 60000 миллисекунд в минуте

      // Обновляем состояние с продолжительностью времени
      setDuration(`${minutes} минут`);
    }
  };

  return (
    <>
      <div>
        <a target="_blank">
          <img src={dicelogo} className="logo" alt="Dice logo" />
        </a>
      </div>
      <h1>DICE Time Tracker</h1>
      <div className="card">
        {started && ended && (
          <p>
            Начало: {started}
            <br />
            Конец: {ended}
            <br />
            Продолжительность: {duration}
          </p>
        )}
      </div>
      <button onClick={handleSecondClick}>Завершить трек</button>
    </>
  );
}

export default App;
