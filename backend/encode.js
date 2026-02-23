const fs = require("fs");

const json = fs.readFileSync("firebase-service-account.json", "utf8");

const base64 = Buffer.from(json).toString("base64");

fs.writeFileSync("firebase-base64.txt", base64);

console.log("DONE ✅");
