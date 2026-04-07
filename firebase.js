// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCRahYN-tBCLz-vJcAZiAr_lsgzM6D-Ooo",
  authDomain: "zing-d4fbf.firebaseapp.com",
  projectId: "zing-d4fbf",
  storageBucket: "zing-d4fbf.firebasestorage.app",
  messagingSenderId: "1073117869068",
  appId: "1:1073117869068:web:0f69857fc5bb03b541aa29",
  measurementId: "G-KBZ6L4N5QR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Salva o ranking de um aluno
// Salva o ranking de um aluno (agora inclui tempo)
export async function salvarRanking({ nome, pontos, area, atividade, alunoId, tempo }) {
  await addDoc(collection(db, "ranking"), {
    nome,
    pontos,
    area,
    atividade,
    alunoId,
    tempo: tempo || 0,
    data: serverTimestamp()
  });
}

// Carrega o ranking filtrando por atividade (e opcionalmente por área)
export async function carregarRanking(atividade, area = null) {
  let q = query(
    collection(db, "ranking"),
    where("atividade", "==", atividade),
    orderBy("pontos", "desc"),
    orderBy("data", "asc")
  );
  if (area) {
    q = query(
      collection(db, "ranking"),
      where("atividade", "==", atividade),
      where("area", "==", area),
      orderBy("pontos", "desc"),
      orderBy("data", "asc")
    );
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}
