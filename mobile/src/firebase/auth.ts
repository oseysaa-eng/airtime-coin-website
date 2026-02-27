import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig"; // ✅ Import db here

export const registerUser = async (
  email: string,
  password: string,
  additionalData: any
) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    createdAt: new Date().toISOString(),
    ...additionalData,
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
};
