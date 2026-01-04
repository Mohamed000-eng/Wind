import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOOMmJiXgpZ9VXuihYKj0g8qBo9flXbNw",
    authDomain: "mychatapp-1dfef.firebaseapp.com",
    projectId: "mychatapp-1dfef",
    storageBucket: "mychatapp-1dfef.firebasestorage.app",
    messagingSenderId: "20508915726",
    appId: "1:20508915726:web:ffe48ea3cab7aba0c1645f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const roomSelector = document.getElementById('room-selector');
const roomTitle = document.getElementById('room-title');
const loginBtn = document.getElementById('login-btn');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
let currentRoom = "";

// 1. تسجيل الدخول
loginBtn.onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => {
        alert("Login Failed: Please check your Firebase settings and User info.");
    });
};

document.getElementById('logout-btn').onclick = () => signOut(auth);

// 2. نظام الصلاحيات والتحكم (Admin Check)
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        
        roomSelector.innerHTML = "";
        
        // هنا تم وضع إيميلك كأدمن
        if (user.email === "medorahom78@gmail.com") { 
            roomSelector.style.display = "block"; // يظهر لك القائمة
            addOption("work", "Work Zone");
            addOption("friends", "Friends Zone");
            addOption("comfort", "Comfort Zone");
            addOption("family", "Family Zone");
            currentRoom = "work";
            roomTitle.textContent = "Admin Control Panel";
        } 
        else {
            // أي شخص غيرك يدخل (أصحابك مثلاً) القائمة تختفي ويدخلوا على غرفة Friends
            roomSelector.style.display = "none";
            currentRoom = "friends"; 
            roomTitle.textContent = "Secure Chat";
        }

        loadMessages(currentRoom);
    } else {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }
});

function addOption(val, text) {
    const opt = document.createElement('option');
    opt.value = val; opt.text = text;
    roomSelector.appendChild(opt);
}

// 3. تبديل الغرف للأدمن
roomSelector.onchange = (e) => {
    currentRoom = e.target.value;
    loadMessages(currentRoom);
};

// 4. إرسال الرسايل
sendBtn.onclick = async () => {
    const text = messageInput.value.trim();
    if (text !== "") {
        try {
            await addDoc(collection(db, currentRoom), {
                text: text,
                user: auth.currentUser.email,
                createdAt: serverTimestamp()
            });
            messageInput.value = "";
        } catch (e) { console.error(e); }
    }
};

// 5. تحميل الرسايل
function loadMessages(room) {
    const q = query(collection(db, room), orderBy("createdAt", "asc"));
    onSnapshot(q, (snapshot) => {
        chatBox.innerHTML = "";
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const msgDiv = document.createElement('div');
            const isMe = msg.user === auth.currentUser.email;
            msgDiv.classList.add('message');
            if(isMe) msgDiv.classList.add('sent');
            msgDiv.textContent = msg.text;
            chatBox.appendChild(msgDiv);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}
