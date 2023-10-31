import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';
import { format, parseISO } from 'date-fns';

function App() {
  const [started, setStarted] = useState("");
  const [ended, setEnded] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("checkIn");

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

    const key = "started_at";
    WebApp.CloudStorage.getItem(key, (result) => {
      if (result) {
        setStarted(result);
      }
    });
  }, [status]);

  const openScanner = (scanType: "start" | "finish") => {
    const params = {};
    WebApp.showScanQrPopup(params);

    WebApp.onEvent("qrTextReceived", (text) => {
      if (scanType === "start" && text.data === "start") {
        const currentTime = new Date();
        const formattedTime = format(currentTime, "yyyy-MM-dd'T'HH:mm:ssXXX");
        WebApp.CloudStorage.setItem("started_at", formattedTime);
        setStarted(formattedTime);
        setStatus("checkOut");
      } else if (scanType === "finish" && text.data === "finish") {
        const currentTime = new Date();
        const formattedTime = format(currentTime, "yyyy-MM-dd'T'HH:mm:ssXXX");
        WebApp.CloudStorage.setItem("ended_at", formattedTime);
        setEnded(formattedTime);
        calculateDuration(formattedTime);
      }

      WebApp.closeScanQrPopup();
    });
  };

  const calculateDuration = (endTime: string) => {
    if (started) {
      const startTimeMs = parseISO(started).getTime();
      const endTimeMs = parseISO(endTime).getTime();
      const timeDiff = (endTimeMs - startTimeMs) / (1000 * 60);
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
        {started && (
          <div className="checkin-time">
            Check-in Time: {format(parseISO(started), 'PPpp')}
          </div>
        )}
        {started && ended && (
          <p>
            Начало: {format(parseISO(started), 'PPpp')}
            <br />
            Конец: {format(parseISO(ended), 'PPpp')}
            <br />
            Продолжительность: {duration}
          </p>
        )}
      </div>
    </>
  );
}

export default App;
