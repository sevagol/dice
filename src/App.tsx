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
  const [scanType, setScanType] = useState("");

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");

    const mainbutton = WebApp.MainButton;
    mainbutton.show();

    if (status === "checkIn") {
      mainbutton.setText('CHECK IN');
      mainbutton.onClick(() => {
        setScanType("start");
        openScanner();
      });
    } else if (status === "checkOut") {
      mainbutton.setText('CHECK OUT');
      mainbutton.onClick(() => {
        setScanType("finish");
        openScanner();
      });
    }

    const key = "started_at";
    WebApp.CloudStorage.getItem(key, (result) => {
      if (result) {
        setStarted(result);
      }
    });
  }, [status]);

  useEffect(() => {
    if (started) {
      setStatus("checkOut");
    }
  }, [started]);

  useEffect(() => {
    if (scanType === "finish" && started) {
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleTimeString();
      setEnded(formattedTime);

      const startTime = new Date(`1970/01/01 ${started}`).getTime();
      const endTime = currentTime.getTime();
      const timeDiff = (endTime - startTime) / (1000 * 60);
      const minutes = Math.abs(Math.round(timeDiff));
      setDuration(`${minutes} минут`);

      setStatus("checkIn");
    }
  }, [started, scanType]);

  const openScanner = () => {
    const handler = (text: QrTextReceivedEvent) => {
      WebApp.offEvent("qrTextReceived", handler);
      if (scanType === "start" && text.data === "start") {
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString();
        WebApp.CloudStorage.setItem("started_at", formattedTime);
        setStarted(formattedTime);
      } else if (scanType === "finish" && text.data === "finish") {
        // Весь код, который был здесь ранее, теперь перемещен в useEffect
      }
      WebApp.closeScanQrPopup();
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
