import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';

function App() {
  const [started, setStarted] = useState("");
  const [ended, setEnded] = useState("");
  const [duration, setDuration] = useState("");
  const [checkInClicked, setCheckInClicked] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");

    const mainbutton = WebApp.MainButton;
    mainbutton.show();

    if (status === "idle") {
      mainbutton.setText('CHECK IN');
      mainbutton.onClick(() => {
        openScanner("start");
        setCheckInClicked(true);
        setStatus("checkIn");
      });
    } else if (status === "checkIn") {
      mainbutton.setText('CHECK OUT');
      mainbutton.onClick(() => {
        openScanner("finish");
        setStatus("checkOut");
      });
    }

    const key = "started_at";
    WebApp.CloudStorage.getItem(key, (error, result) => {
      if (result) {
        setStarted(result);
      }
    });

  }, [status, checkInClicked]);

  const openScanner = (scanType) => {
    if (scanType === "start" && checkInClicked) {
      alert("Кнопка 'CHECK IN' уже была нажата.");
      return;
    }

    if (scanType === "start") {
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
            const startTime = new Date(started).getTime();
            const endTime = new Date(formattedTime).getTime();
            const timeDiff = endTime - startTime;
            const minutes = Math.floor(timeDiff / (1000 * 60));
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
    </>
  );
}

export default App;
