import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

interface QrTextReceivedEvent {
  data: string;
}

interface UserCheckIn {
  start: number;
  finish?: number;
}

interface FirestoreUser {
  id: number;
  status: string;
  checkIns: UserCheckIn[];
}

function App() {
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
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
          const userData = snapshot.data() as FirestoreUser;
          setUserData(userData);
          updateMainButton(userData.status);
          setDuration(calculateDuration(userData));
        } else {
          // Создаем пользователя при первом входе
          const newUser: FirestoreUser = {
            id: userId,
            status: 'checkIn',
            checkIns: [],
          };
          setDoc(userRef, newUser).then(() => {
            setUserData(newUser);
            updateMainButton(newUser.status);
            setDuration("");
          });
        }
      });
    }
  }, [firestore]);

  const openScanner = (scanType: "start" | "finish") => {
    const handler = (text: QrTextReceivedEvent) => {
      WebApp.offEvent("qrTextReceived", handler);
      const currentTime = Date.now();
      if (scanType === "start" && text.data === "start") {
        // Добавляем Check-in
        const newCheckIn: UserCheckIn = { start: currentTime };
        const newUserData: FirestoreUser = {
          ...userData!,
          status: "checkOut",
        };
        // Обновляем данные в Firestore
        updateUserData(newUserData, newCheckIn);
        setUserData(newUserData);
        updateMainButton("checkOut");
        setDuration("");
      } else if (scanType === "finish" && text.data === "finish") {
        // Ищем последний Check-in и добавляем Check-out
        const lastCheckInIndex = userData!.checkIns.length - 1;
        const updatedCheckIns = [...userData!.checkIns];
        updatedCheckIns[lastCheckInIndex].finish = currentTime;
        const newUserData: FirestoreUser = {
          ...userData!,
          status: "checkIn", // Обновляем статус на "checkIn"
        };
        // Обновляем данные в Firestore
        updateUserData(newUserData, updatedCheckIns[lastCheckInIndex]);
        setUserData(newUserData);
        updateMainButton("checkIn");
        setDuration(calculateDuration(newUserData));
      }
      WebApp.closeScanQrPopup();
    };
  
    WebApp.onEvent("qrTextReceived", handler);
    WebApp.showScanQrPopup({});
  };
  

  const updateMainButton = (status: string) => {
    const mainbutton = WebApp.MainButton;
    mainbutton.show();

    if (status === "checkIn") {
      mainbutton.setText('CHECK IN');
      mainbutton.onClick(() => openScanner("start"));
    } else if (status === "checkOut") {
      mainbutton.setText('CHECK OUT');
      mainbutton.onClick(() => openScanner("finish"));
    }
  };

  // Функция для обновления данных в Firestore
  const updateUserData = (newUserData: FirestoreUser, newCheckIn: UserCheckIn) => {
    const userId = WebApp.initDataUnsafe.user?.id;
    if (userId) {
      const userRef = doc(firestore, 'users', userId.toString());
      updateDoc(userRef, {
        status: newUserData.status,
        checkIns: arrayUnion(newCheckIn),
      });
    }
  };

  const calculateDuration = (user: FirestoreUser | null) => {
    if (user && user.checkIns.length > 0) {
      const lastCheckIn = user.checkIns[user.checkIns.length - 1];
      if (lastCheckIn.finish) {
        const timeDiff = (lastCheckIn.finish - lastCheckIn.start) / (1000 * 60); // Расчёт в минутах
        const minutes = Math.round(timeDiff);
        return `${minutes} минут`;
      }
    }
    return "";
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
            {userData.checkIns.length > 0 && (
              <p>
                Начало: {new Date(userData.checkIns[userData.checkIns.length - 1].start).toLocaleTimeString()}
                <br />
                Конец: {new Date(userData.checkIns[userData.checkIns.length - 1].finish!).toLocaleTimeString()}
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
