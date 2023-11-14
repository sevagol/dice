import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

interface QrTextReceivedEvent {
  data: string;
}

interface FirestoreUser {
  id: number;
  status: string;
  started_at?: number;
}

function App() {
  const [userData, setUserData] = useState<FirestoreUser | null>(null);

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
        } else {
          // Создаем пользователя при первом входе
          const newUser: FirestoreUser = {
            id: userId,
            status: 'checkIn',
          };
          setDoc(userRef, newUser).then(() => {
            setUserData(newUser);
            updateMainButton(newUser.status);
          });
        }
      });
    }
  }, [firestore]);

  const openScanner = (scanType: "start" | "finish", callback: () => Promise<void>) => {
    const handler = async (event: QrTextReceivedEvent) => {
      WebApp.offEvent("qrTextReceived", handler);
      if ((scanType === "start" && event.data === "start") ||
          (scanType === "finish" && event.data === "finish")) {
        await callback();
      }
      WebApp.closeScanQrPopup();
    };
  
    WebApp.onEvent("qrTextReceived", handler);
    WebApp.showScanQrPopup({});
  };
  

  const handleCheckIn = () => {
    const userId = WebApp.initDataUnsafe.user?.id;
    if (userId) {
      openScanner("start", async () => {
        await checkInUser(userId);
      });
    }
  };
  
  const handleCheckOut = () => {
    const userId = WebApp.initDataUnsafe.user?.id;
    if (userId && userData) {
      openScanner("finish", async () => {
        await checkOutUser(userId, userData.started_at);
      });
    }
  };
  

  const checkInUser = async (userId: number) => {
    const userRef = doc(firestore, 'users', userId.toString());
    await setDoc(userRef, {
      id: userId,
      status: 'checkOut',
      started_at: Date.now(),
    });
    setUserData({ id: userId, status: 'checkOut', started_at: Date.now() });
    updateMainButton('checkOut');
  };

  const checkOutUser = async (userId: number, startedAt?: number) => {
    if (startedAt) {
      const duration = Date.now() - startedAt;
      // Показать продолжительность пользователю
      alert(`Продолжительность: ${duration / 1000} секунд`);

      const userRef = doc(firestore, 'users', userId.toString());
      await updateDoc(userRef, {
        status: 'checkIn',
        started_at: deleteField(),
      });
      setUserData({ id: userId, status: 'checkIn' });
      updateMainButton('checkIn');
    }
  };

  const updateMainButton = (status: string) => {
    const mainbutton = WebApp.MainButton;
    mainbutton.show();

    if (status === "checkIn") {
      mainbutton.setText('CHECK IN');
      mainbutton.onClick(handleCheckIn);
    } else if (status === "checkOut") {
      mainbutton.setText('CHECK OUT');
      mainbutton.onClick(handleCheckOut);
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
            <p>
              Статус: {userData.status}
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default App;