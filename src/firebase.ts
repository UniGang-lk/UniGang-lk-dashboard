import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB0ZPeBeBjShGDNDskWO17srJ0mH1Ce9gA",
  authDomain: "the-uni-gang-8138f.firebaseapp.com",
  projectId: "the-uni-gang-8138f",
  storageBucket: "the-uni-gang-8138f.firebasestorage.app",
  messagingSenderId: "1025345358584",
  appId: "1:1025345358584:web:7482a7bf8a58264bc1c90d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
