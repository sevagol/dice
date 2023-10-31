import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';

function App() {
  const [started, setStarted] = useState<string>("");
  const [ended, setEnded] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [status, setStatus] = useState<"checkIn" | "checkOut">("checkIn");

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");

    const mainbutton = WebApp.MainButton;
    mainbutton.show();

    if (status === "checkIn") {
      mainbutton.setText('CHECK IN');
      mainbutton.onClick(() => openScanner("start"));
    } else if (status === "checkOut") {
      mainbutton.setText('CHECK OUT');
      mainbutton.onClick(() => openScanner("finish"));
    }

    WebApp.CloudStorage.getItem("started_at", (result) => {
      if (result) {
        setStarted(result);
        setStatus("checkOut");
      }
    });

    WebApp.CloudStorage.getItem("ended_at", (result) => {
      if (result) {
        setEnded(result);
        calculateDuration(result);
      }
    });
  }, [status]);

  const openScanner = (scanType: "start" | "finish") => {
    const params = {};
    WebApp.showScanQrPopup(params);

    WebApp.onEvent("qrTextReceived", (text) => {
      if (scanType === "start" && text.data === "start") {
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleString();
        WebApp.CloudStorage.setItem("started_at", formattedTime);
        setStarted(formattedTime);
        setStatus("checkOut");
      } else if (scanType === "finish" && text.data === "finish") {
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleString();
        WebApp.CloudStorage.setItem("ended_at", formattedTime);
        setEnded(formattedTime);
        calculateDuration(formattedTime);
      }

      WebApp.closeScanQrPopup();
    });
  };

  const calculateDuration = (endTime: string) => {
    if (started) {
      const startTime = new Date(started).getTime();
      const endTimeMs = new Date(endTime).getTime();
      const timeDiff = (endTimeMs - startTime) / (1000 * 60);
      const minutes = Math.abs(Math.round(timeDiff));
      setDuration(`${minutes} минут`);
    }
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
      {started && <div className="checkin-time">Check-in Time: {new Date(started).toLocaleTimeString()}</div>}
        {started && ended && (
          <p>
            Начало: {new Date(started).toLocaleString()}
            <br />
            Конец: {new Date(ended).toLocaleString()}
            <br />
            Продолжительность: {duration}
          </p>
        )}
      </div>
    </>
  );
}

export default App;
