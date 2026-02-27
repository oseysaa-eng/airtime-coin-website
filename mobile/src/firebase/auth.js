"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const firebaseConfig_1 = require("../firebase/firebaseConfig"); // ✅ Import db here
const registerUser = async (email, password, additionalData) => {
    const userCred = await (0, auth_1.createUserWithEmailAndPassword)(firebaseConfig_1.auth, email, password);
    const user = userCred.user;
    await (0, firestore_1.setDoc)((0, firestore_1.doc)(firebaseConfig_1.db, "users", user.uid), {
        uid: user.uid,
        email,
        createdAt: new Date().toISOString(),
        ...additionalData,
    });
    return user;
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const userCred = await (0, auth_1.signInWithEmailAndPassword)(firebaseConfig_1.auth, email, password);
    return userCred.user;
};
exports.loginUser = loginUser;
