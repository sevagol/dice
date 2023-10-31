import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';

interface QrTextReceivedEvent {
  data: string;
}

function App() {
  const [started, setStarted] = useState("");
  const [ended, setEnded] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("checkIn");

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");

    const mainbutton = WebApp.MainButton;
    mainbutton.show();

    WebApp.CloudStorage.getItem("status", (result) => {
      if (result) {
        setStatus(result);
      }
    });

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
      }
    });
  }, [status]);

  const openScanner = (scanType: "start" | "finish") => {
    const handler = (text: QrTextReceivedEvent) => {
      if (scanType === "start" && text.data === "start") {
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString();
        WebApp.CloudStorage.setItem("started_at", formattedTime);
        setStarted(formattedTime);
        setStatus("checkOut");
        WebApp.CloudStorage.setItem("status", "checkOut");
      } else if (scanType === "finish" && text.data === "finish") {
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString();
        setEnded(formattedTime);
        if (started) {
          const startTime = new Date(`1970/01/01 ${started}`).getTime();
          const endTime = currentTime.getTime();
          const timeDiff = (endTime - startTime) / (1000 * 60);
          const minutes = Math.abs(Math.round(timeDiff));
          setDuration(`${minutes} минут`);
        }
        setStatus("checkIn");
        WebApp.CloudStorage.setItem("status", "checkIn");
        setStarted("");
      }
      WebApp.closeScanQrPopup();
      WebApp.offEvent("qrTextReceived", handler);
    };
    WebApp.onEvent("qrTextReceived", handler);
    WebApp.showScanQrPopup({});
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
        {started && <div className="checkin-time">Check-in Time: {started}</div>}
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
    </>
  );
}

export default App;
