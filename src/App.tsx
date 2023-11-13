import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

interface QrTextReceivedEvent {
  data: string;
}

interface User {
  id: number;
  status: string;
  started_at?: number | null;
  ended_at?: number | null;
}

function App() {
  const [userData, setUserData] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("");

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");
  }, []);

  const firebaseConfig = {
    apiKey: "AIzaSyDmhcaTMQMs2M9aySDqRQqfkdqADDyM8bQ",
    authDomain: "dice-d3137.firebaseapp.com",
    projectId: "dice-d3137",
    storageBucket: "dice-d3137.appspot.com",
    messagingSenderId: "754141499011",
    appId: "1:754141499011:web:60908fa367e7c1e74255b6"
  };

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  useEffect(() => {
    const userId = WebApp.initDataUnsafe.user?.id;

    if (userId) {
      const userRef = doc(firestore, 'users', userId.toString());

      getDoc(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as User;
          setUserData(userData);
          setStatus(userData.status);
        } else {
          // Создаем пользователя при первом входе
          const newUser: User = {
            id: userId,
            status: 'checkIn',
          };
          setDoc(userRef, newUser).then(() => {
            setUserData(newUser);
            setStatus(newUser.status);
          });
        }
      });
    }
  }, [firestore]);

  const openScanner = (scanType: "start" | "finish") => {
    const handler = (text: QrTextReceivedEvent) => {
      WebApp.offEvent("qrTextReceived", handler);
      if (scanType === "start" && text.data === "start") {
        const currentTime = Date.now();
        setUserData({
          ...userData!,
          status: "checkOut",
          started_at: currentTime,
        });
        setStatus("checkOut");
      } else if (scanType === "finish" && text.data === "finish") {
        const currentTime = Date.now();
        setUserData({
          ...userData!,
          status: "checkIn",
          ended_at: currentTime,
        });
        if (userData && userData.started_at) {
          const timeDiff = (currentTime - userData.started_at) / (1000 * 60); // Расчёт в минутах
          const minutes = Math.round(timeDiff);
          setDuration(`${minutes} минут`);
        }
        setStatus("checkIn");
      }
      WebApp.closeScanQrPopup();
    };

    WebApp.onEvent("qrTextReceived", handler);
    WebApp.showScanQrPopup({});
  };

  const handleMainButtonClick = () => {
    if (status === "checkIn") {
      setStatus("checkOut");
      openScanner("start");
    } else if (status === "checkOut") {
      setStatus("checkIn");
      openScanner("finish");
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
        {userData && (
          <>
            {status === "checkIn" && (
              <button onClick={handleMainButtonClick}>CHECK IN</button>
            )}
            {status === "checkOut" && (
              <>
                <p>Check-in Time: {userData.started_at}</p>
                <button onClick={handleMainButtonClick}>CHECK OUT</button>
              </>
            )}
            {userData.started_at && userData.ended_at && (
              <p>
                Начало: {new Date(userData.started_at).toLocaleTimeString()}
                <br />
                Конец: {new Date(userData.ended_at).toLocaleTimeString()}
                <br />
                Продолжительность: {duration}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
