import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';

interface QrTextReceivedEvent {
  data: string;
}

function App() {
  const [started, setStarted] = useState<number | null>(null);
  const [ended, setEnded] = useState<number | null>(null);
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState<string | null>(null); // Инициализация с null

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");

    WebApp.CloudStorage.getItem("started_at", (result) => {
      if (result) {
        setStarted(Number(result));
      }
    });

    WebApp.CloudStorage.getItem("ended_at", (result) => {
      if (result) {
        setEnded(Number(result));
      }
    });

    WebApp.CloudStorage.getItem("status", (result) => {
      if (result) {
        setStatus(result);
      } else {
        setStatus("checkIn");
      }
    });
  }, []); // Удаление status из зависимостей

  useEffect(() => {
    const mainbutton = WebApp.MainButton;
    mainbutton.show();

    if (status === "checkIn") {
      mainbutton.setText('CHECK IN');
      mainbutton.onClick(() => openScanner("start"));
    } else if (status === "checkOut") {
      mainbutton.setText('CHECK OUT');
      mainbutton.onClick(() => openScanner("finish"));
    }
  }, [status]); // Отслеживание изменения status

  const openScanner = (scanType: "start" | "finish") => {
    const handler = (text: QrTextReceivedEvent) => {
      WebApp.offEvent("qrTextReceived", handler);
      if (scanType === "start" && text.data === "start") {
        const currentTime = Date.now();
        WebApp.CloudStorage.setItem("started_at", currentTime.toString());
        setStarted(currentTime);
        setStatus("checkOut");
        WebApp.CloudStorage.setItem("status", "checkOut");
      } else if (scanType === "finish" && text.data === "finish") {
        const currentTime = Date.now();
        WebApp.CloudStorage.setItem("ended_at", currentTime.toString());
        setEnded(currentTime);
        if (started) {
          const timeDiff = (currentTime - started) / (1000 * 60); // Расчёт в минутах
          const minutes = Math.round(timeDiff);
          setDuration(`${minutes} минут`);
        }
        setStatus("checkIn");
        WebApp.CloudStorage.setItem("status", "checkIn");
      }
      WebApp.closeScanQrPopup();
    };
    WebApp.onEvent("qrTextReceived", handler);
    WebApp.showScanQrPopup({});
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  return (
    <>
      <div>
        <a target="_blank" rel="noopener noreferrer">
          <img src={dicelogo} className="logo" alt="Dice logo" />
        </a>
      </div>
      <h1>DICE Time Tracker</h1>
      <div className="card">
        {started && <div className="checkin-time">Check-in Time: {formatTime(started)}</div>}
        {started && ended && (
          <p>
            Начало: {formatTime(started)}
            <br />
            Конец: {formatTime(ended)}
            <br />
            Продолжительность: {duration}
          </p>
        )}
      </div>
    </>
  );
}

export default App;
