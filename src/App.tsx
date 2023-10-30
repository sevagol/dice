import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';

function App() {
  const [started, setStarted] = useState("");
  const [ended, setEnded] = useState("");
  const [duration, setDuration] = useState(""); // Состояние для хранения продолжительности времени
  const [checkInClicked, setCheckInClicked] = useState(false); // Состояние для отслеживания нажатия кнопки "CHECK IN"

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");

    const mainbutton = WebApp.MainButton;
    mainbutton.setText('CHECK IN');
    mainbutton.show();
    mainbutton.onClick(() => {
      // Проверяем, была ли уже нажата кнопка "CHECK IN"
      if (!checkInClicked) {
        openScanner("start");
        // Устанавливаем состояние, что кнопка "CHECK IN" была нажата
        setCheckInClicked(true);
      } else {
        // Кнопку нельзя нажимать повторно
        alert("Кнопка 'CHECK IN' уже была нажата.");
      }
    });

    const key = "started_at";

    WebApp.CloudStorage.getItem(key, (error, result) => {
      if (error) {
        console.error("Произошла ошибка при получении данных:", error);
      } else if (result) {
        setStarted(result);
      }
    });
  }, [checkInClicked]);

  // Обработчик для второго нажатия на MainButton
  const handleSecondClick = () => {
    openScanner("finish");
  };

  // Функция для открытия сканера и обработки события qrTextReceived
  // Функция для открытия сканера и обработки события qrTextReceived
const openScanner = (scanType: string) => {
  if (scanType === "start" && checkInClicked) {
    // Если кнопка "CHECK IN" уже была нажата, показываем только alert
    alert("Кнопка 'CHECK IN' уже была нажата.");
    return;
  }

  if (scanType === "start") {
    // Если это первое нажатие кнопки "CHECK IN", устанавливаем состояние
    setCheckInClicked(true);

    const params = {};
    WebApp.showScanQrPopup(params);

    WebApp.onEvent("qrTextReceived", (text) => {
      if (text.data === "start") {
        WebApp.closeScanQrPopup();

        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString();
        WebApp.CloudStorage.setItem("started_at", formattedTime);
        setStarted(formattedTime);
      }
    });
  } else if (scanType === "finish") {
    // Если сканируется "finish", открываем сканер и устанавливаем обработчик
    const params = {};
    WebApp.showScanQrPopup(params);

    WebApp.onEvent("qrTextReceived", (text) => {
      if (text.data === "finish") {
        WebApp.closeScanQrPopup();

        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString();
        WebApp.CloudStorage.setItem("ended_at", formattedTime);
        setEnded(formattedTime);

        if (started && formattedTime) {
          // Вычисляем продолжительность времени
          const startTime = new Date(started).getTime();
          const endTime = new Date(formattedTime).getTime();
          const timeDiff = endTime - startTime;

          // Преобразуем продолжительность времени в минуты (или другой формат, по вашему выбору)
          const minutes = Math.floor(timeDiff / (1000 * 60)); // 1000 миллисекунд в секунде, 60 секунд в минуте

          // Обновляем состояние с продолжительностью времени
          setDuration(`${minutes} минут`);
        }
      }
    });
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
      <button onClick={handleSecondClick}>CHECK OUT</button>
    </>
  );
}

export default App;
