const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const entriesRef = collection(db, "entries");

function isValidCode(type, code) {
  const allowedChars = /^[A-Za-z0-9]+$/;
  if (!allowedChars.test(code)) return false;

  if (type === "track") return code.length === 5 || code.length === 6;
  if (type === "friend") return code.length === 6;
  if (type === "challenge") return code.length === 7;

  return false;
}

async function submitEntry() {
  const type = document.getElementById("entryType").value;
  const name = document.getElementById("name").value.trim();
  const trackId = document.getElementById("trackId").value.trim();
  const trackName = document.getElementById("trackName").value.trim();

  if (!name || !trackId || !isValidCode(type, trackId)) {
    alert("Invalid input. Check name, code format and length.");
    return;
  }

  const existing = await getDocs(query(entriesRef, where("trackId", "==", trackId)));
  if (!existing.empty) {
    alert("This ID already exists.");
    return;
  }

  await addDoc(entriesRef, {
    type, name, trackId, trackName
  });

  alert("Submitted!");
  document.getElementById("name").value = "";
  document.getElementById("trackId").value = "";
  document.getElementById("trackName").value = "";
  loadEntries();
}

async function loadEntries(filter = "") {
  const list = document.getElementById("entryList");
  list.innerHTML = "";

  const allEntries = await getDocs(entriesRef);
  const results = [];

  allEntries.forEach(doc => {
    const data = doc.data();
    if (
      !filter ||
      data.name.toLowerCase().includes(filter.toLowerCase()) ||
      data.trackName?.toLowerCase().includes(filter.toLowerCase()) ||
      data.type.toLowerCase().includes(filter.toLowerCase())
    ) {
      results.push(data);
    }
  });

  results.forEach(({ name, trackId, trackName, type }) => {
    const div = document.createElement("div");
    div.className = "entry";
    if (type === "track") {
      div.innerHTML = `<strong>${trackName}</strong> by <em>${name}</em><br />
        <a href="https://playhcr.com/track?id=${trackId}" target="_blank">https://playhcr.com/track?id=${trackId}</a> or 
        <code onclick="copyToClipboard('${trackId}')">${trackId}</code>`;
    } else if (type === "friend") {
      div.innerHTML = `<strong>${name}'s Friend Link:</strong><br />
        <a href="https://playhcr.com/invite?id=${trackId}" target="_blank">https://playhcr.com/invite?id=${trackId}</a>`;
    } else if (type === "challenge") {
      div.innerHTML = `<strong>${trackName}</strong> by <em>${name}</em><br />
        <a href="https://playhcr.com/challenge?id=${trackId}" target="_blank">https://playhcr.com/challenge?id=${trackId}</a>`;
    }
    list.appendChild(div);
  });
}

function searchEntries() {
  const filter = document.getElementById("search").value;
  loadEntries(filter);
}

function updateForm() {
  const type = document.getElementById("entryType").value;
  const name = document.getElementById("name");
  const id = document.getElementById("trackId");
  const title = document.getElementById("trackName");

  title.style.display = type === "friend" ? "none" : "block";

  if (type === "friend") {
    name.placeholder = "In-game name";
    id.placeholder = "Friend Code (6 chars)";
  } else if (type === "track") {
    name.placeholder = "In-game name";
    id.placeholder = "Track ID (5-6 chars)";
    title.placeholder = "Track Name";
  } else {
    name.placeholder = "In-game name";
    id.placeholder = "Challenge Code (7 chars)";
    title.placeholder = "Setup";
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => alert(`Copied: ${text}`));
}

window.submitEntry = submitEntry;
window.searchEntries = searchEntries;
window.copyToClipboard = copyToClipboard;
window.updateForm = updateForm;

window.onload = () => {
  loadEntries();
  updateForm();
};
