import { useEffect, useState } from 'react';
import dicelogo from './assets/dice.png';
import './App.css';
import WebApp from '@twa-dev/sdk';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  id: number;
  status: string;
  started_at?: number | null;
  ended_at?: number | null;
}

function App() {
  const [userData, setUserData] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    WebApp.setHeaderColor("secondary_bg_color");

    WebApp.CloudStorage.getItem("status", (result) => {
      if (!result) {
        WebApp.CloudStorage.setItem("status", "checkIn");
      }
    });
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

  const checkIn = () => {
    if (userData) {
      const userRef = doc(firestore, 'users', userData.id.toString());
      const currentTime = Date.now();
      const updatedUserData: User = {
        ...userData,
        status: 'checkOut',
        started_at: currentTime,
      };

      setDoc(userRef, updatedUserData).then(() => {
        setStatus(updatedUserData.status);
        WebApp.CloudStorage.setItem("status", "checkOut");
      });
    }
  };

  const checkOut = () => {
    if (userData) {
      const userRef = doc(firestore, 'users', userData.id.toString());
      const currentTime = Date.now();
      const updatedUserData: User = {
        ...userData,
        status: 'checkIn',
        ended_at: currentTime,
      };

      setDoc(userRef, updatedUserData).then(() => {
        setStatus(updatedUserData.status);
        WebApp.CloudStorage.setItem("status", "checkIn");
      });
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
              <button onClick={checkIn}>CHECK IN</button>
            )}
            {status === "checkOut" && (
              <>
                <p>Check-in Time: {userData.started_at}</p>
                <button onClick={checkOut}>CHECK OUT</button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
