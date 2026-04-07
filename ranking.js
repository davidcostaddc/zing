

import { carregarRanking } from "./firebase.js";

const medalhas = ['🥇','🥈','🥉'];
const cores = ['#FFD700', '#C0C0C0', '#cd7f32'];
function getNivel(pontos) {
  if(pontos<=20) return {nome:'Iniciante', cor:'#22c55e', icone:'🥉'};
  if(pontos<=40) return {nome:'Aprendiz', cor:'#38bdf8', icone:'🥈'};
  if(pontos<=60) return {nome:'Intermediário', cor:'#a78bfa', icone:'🥇'};
  if(pontos<=80) return {nome:'Avançado', cor:'#f59e42', icone:'🏅'};
  return {nome:'Lendário', cor:'#f43f5e', icone:'🏆'};
}

let area = localStorage.getItem("area") || "geral";
let usuario = localStorage.getItem("usuario") || "Você";
let atividade = localStorage.getItem("atividade") || "quiz1";
let ranking = [];
let posicao = 0;
let pontos = 0;
let nivel = getNivel(0);
let total = 0;
let progresso = 100;



async function carregarEDesenharRanking() {
  try {
    ranking = await carregarRanking(atividade);
    total = ranking.length;
    posicao = ranking.findIndex(r => r.nome === usuario) + 1;
    pontos = ranking.find(r => r.nome === usuario)?.pontos || 0;
    nivel = getNivel(pontos);
    progresso = total > 1 ? (1 - (posicao-1)/(total-1)) * 100 : 100;
    if (ranking.length === 0) {
      document.getElementById("lista").innerHTML = `
        <div style="
          padding:36px 18px 32px 18px;
          text-align:center;
          font-size:1.25em;
          font-weight:900;
          color:#2563eb;
          background:linear-gradient(120deg,#f0f4ff 0%,#e0e7ff 100%);
          border-radius:22px;
          box-shadow:0 2px 18px #2563eb11,0 1px 0 #fff;
          max-width:420px;
          margin:48px auto 32px auto;
          letter-spacing:1px;
          line-height:1.5;
          border:2.5px dashed #2563eb33;
        ">
            <span style="font-size:2.8em;display:block;margin-bottom:10px;color:#64748b;font-family:'Fredoka',sans-serif;letter-spacing:2px;">0</span>
          Nenhum resultado encontrado para este quiz.<br>
          <span style="font-size:1.1em;color:#1e293b;font-weight:700;">Participe para ser o primeiro do ranking!</span>
        </div>
      `;
      return;
    }
    desenharRanking();
  } catch (e) {
    document.getElementById("lista").innerHTML = '<div style="padding:32px;text-align:center;font-size:1.2em;color:#ef4444;font-weight:bold;">Erro ao carregar ranking.<br>'+e.message+'</div>';
  }
}

// Chama a função ao carregar a página
window.addEventListener('DOMContentLoaded', carregarEDesenharRanking);

function desenharRanking() {
  // Animação de confete (CSS)
  function confeteAnim() {
    let confete = document.createElement('div');
    confete.className = 'confete-vitoria';
    document.body.appendChild(confete);
    setTimeout(()=>confete.remove(), 2200);
  }
  window.addEventListener('DOMContentLoaded', confeteAnim);

  // Card principal de conquista
  let html = `<div class='resultado-card-principal'>
    <div class='resultado-titulo' style="font-weight:900;font-size:2em;
      background: linear-gradient(90deg,#7c3aed 0%,#2563eb 60%,#f59e42 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
      text-shadow:0 2px 12px #312e8133,0 1px 0 #fff;letter-spacing:1px;">
      Quiz Finalizado!
    </div>
    <div class='resultado-parabens' style="
      font-family: 'Pacifico', 'Comic Sans MS', cursive, sans-serif;
      color: #1e293b;
      font-size:2.4em;
      font-weight:900;
      text-shadow:0 2px 18px #fff,0 1px 0 #fff;
      letter-spacing:2px;
      animation:parabens-pop 0.7s cubic-bezier(.7,-0.2,.5,1.5);">
      Parabéns!
    </div>
    <div class='resultado-nivel ${nivel.nome === 'Lendário' ? 'glow-lendario' : ''}' style="color:${nivel.nome==='Iniciante' ? '#1e293b' : '#fff'};font-size:1.3em;">
      <span class='nivel-icone'>${nivel.icone}</span>
      <span class='nivel-txt'>Você atingiu o nível <b>${nivel.nome}</b></span>
    </div>
    <div class='resultado-posicao'>
      <span class='badge-posicao' style='background:${nivel.cor};color:#fff;'>${posicao}º</span>
      <span class='txt-posicao'>no ranking</span>
    </div>
    <div class='ranking-progresso-container'>
      <div class='ranking-progresso-bar' style='width:${progresso}%;'></div>
    </div>
    <div class='ranking-progresso-label'>Você está no top ${Math.round(progresso)}%</div>
  </div>`;

  // Leaderboard estilizado
  const medalhaTooltips = ['Campeão(a)', 'Vice-campeão(a)', '3º lugar'];

  function formatarTempo(seg) {
    if(typeof seg !== 'number' || isNaN(seg)) return '-';
    let m = Math.floor(seg/60);
    let s = seg%60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  // --- PÓDIO VISUAL ---
  const badgeCores = {
    'Iniciante': '#22c55e',
    'Aprendiz': '#38bdf8',
    'Intermediário': '#a78bfa',
    'Avançado': '#f59e42',
    'Lendário': '#f43f5e'
  };
  let podium = ranking.slice(0, 3);
  let podiumColors = [
    'linear-gradient(180deg,#FFD700 0%,#fffbe6 100%)', // Ouro
    'linear-gradient(180deg,#C0C0C0 0%,#f8fafc 100%)', // Prata
    'linear-gradient(180deg,#cd7f32 0%,#f8e7d0 100%)'  // Bronze
  ];
  let podiumHeights = [120, 90, 70]; // px
  let podiumAvatars = [80, 68, 60]; // px
  let podiumFont = [1.25, 1.1, 1];
  html += `<div class='podium-cards-wrap' style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(120deg,#2563eb11 0%,#38bdf822 100%);border-radius:28px;padding:32px 8px 28px 8px;margin-bottom:36px;max-width:950px;margin-left:auto;margin-right:auto;box-shadow:0 6px 36px #2563eb22,0 1px 0 #fff;">
    <div class='leaderboard-titulo' style="font-weight:900;font-size:2.1em;letter-spacing:1px;display:flex;align-items:center;gap:14px;margin-bottom:22px;
      color:#fff;
      text-shadow:0 2px 16px #2563eb33,0 1px 0 #fff8;">
      Pódio
    </div>
    <div class='podium-container' style="display:flex;justify-content:center;align-items:flex-end;gap:32px;margin-bottom:38px;margin-top:8px;width:100%;">`;
  // 2º lugar
  if (podium[1]) {
    let r = podium[1];
    let nivelAluno = getNivel(r.pontos);
    let corBadge = badgeCores[nivelAluno.nome] || '#2563eb';
    html += `<div class='podium-pos podium-2' style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
      <span style='font-size:2em;margin-bottom:6px;'>🥈</span>
      <span style="background:${podiumColors[1]};width:${podiumAvatars[1]}px;height:${podiumAvatars[1]}px;display:flex;align-items:center;justify-content:center;border-radius:50%;box-shadow:0 4px 18px #38bdf855,0 1px 0 #fff8;outline:3px solid #fff;outline-offset:2px;font-size:2.1em;">
        <span style='font-size:1.2em;'>${nivelAluno.icone}</span>
      </span>
      <div style="height:${podiumHeights[1]}px;width:54px;background:${podiumColors[1]};border-radius:16px 16px 8px 8px;box-shadow:0 2px 12px #38bdf822;margin-top:8px;display:flex;align-items:center;justify-content:center;font-size:1.1em;font-weight:700;color:#222;">2º</div>
      <div style="margin-top:10px;font-size:${podiumFont[1]}em;font-weight:900;color:#1e293b;text-align:center;max-width:90px;">${r.nome}</div>
      <div style="margin-top:2px;font-size:.98em;color:${nivelAluno.nome==='Lendário' ? '#f59e42' : corBadge};font-weight:700;">${nivelAluno.nome}</div>
      <div style="margin-top:2px;font-size:.98em;color:#fff;font-weight:700;display:flex;align-items:center;gap:4px;text-shadow:0 1px 6px #2563eb77;"><span style='font-size:1.1em;'>⭐</span> ${r.pontos}</div>
      <div style="margin-top:2px;">⏱ ${typeof r.tempo === 'number' ? formatarTempo(r.tempo) : '—'}</div>
    </div>`;
  }
  // 1º lugar
  if (podium[0]) {
    let r = podium[0];
    let nivelAluno = getNivel(r.pontos);
    let corBadge = badgeCores[nivelAluno.nome] || '#2563eb';
    html += `<div class='podium-pos podium-1' style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
      <span style='font-size:2.5em;margin-bottom:6px;'>🏆</span>
      <span style="background:${podiumColors[0]};width:${podiumAvatars[0]}px;height:${podiumAvatars[0]}px;display:flex;align-items:center;justify-content:center;border-radius:50%;box-shadow:0 6px 24px #FFD70099,0 1px 0 #fff8;outline:4px solid #fff;outline-offset:2px;font-size:2.5em;">
        <span style='font-size:1.5em;'>${nivelAluno.icone}</span>
      </span>
      <div style="height:${podiumHeights[0]}px;width:62px;background:${podiumColors[0]};border-radius:18px 18px 10px 10px;box-shadow:0 2px 16px #FFD70044;margin-top:8px;display:flex;align-items:center;justify-content:center;font-size:1.18em;font-weight:800;color:#222;">1º</div>
      <div style="margin-top:12px;font-size:${podiumFont[0]}em;font-weight:900;color:#1e293b;text-align:center;max-width:110px;">${r.nome}</div>
      <div style="margin-top:2px;font-size:1em;color:${nivelAluno.nome==='Lendário' ? '#f59e42' : corBadge};font-weight:700;">${nivelAluno.nome}</div>
      <div style="margin-top:2px;font-size:1em;color:#fff;font-weight:700;display:flex;align-items:center;gap:4px;text-shadow:0 1px 8px #2563eb77;"><span style='font-size:1.15em;'>⭐</span> ${r.pontos}</div>
      <div style="margin-top:2px;">⏱ ${typeof r.tempo === 'number' ? formatarTempo(r.tempo) : '—'}</div>
    </div>`;
  }
  // 3º lugar
  if (podium[2]) {
    let r = podium[2];
    let nivelAluno = getNivel(r.pontos);
    let corBadge = badgeCores[nivelAluno.nome] || '#2563eb';
    html += `<div class='podium-pos podium-3' style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
      <span style='font-size:1.8em;margin-bottom:6px;'>🥉</span>
      <span style="background:${podiumColors[2]};width:${podiumAvatars[2]}px;height:${podiumAvatars[2]}px;display:flex;align-items:center;justify-content:center;border-radius:50%;box-shadow:0 4px 18px #cd7f3255,0 1px 0 #fff8;outline:2.5px solid #fff;outline-offset:2px;font-size:1.5em;">
        <span style='font-size:1.1em;'>${nivelAluno.icone}</span>
      </span>
      <div style="height:${podiumHeights[2]}px;width:44px;background:${podiumColors[2]};border-radius:14px 14px 7px 7px;box-shadow:0 2px 10px #cd7f3244;margin-top:8px;display:flex;align-items:center;justify-content:center;font-size:1em;font-weight:700;color:#222;">3º</div>
      <div style="margin-top:8px;font-size:${podiumFont[2]}em;font-weight:900;color:#1e293b;text-align:center;max-width:80px;">${r.nome}</div>
      <div style="margin-top:2px;font-size:.95em;color:${nivelAluno.nome==='Lendário' ? '#f59e42' : corBadge};font-weight:700;">${nivelAluno.nome}</div>
      <div style="margin-top:2px;font-size:.95em;color:#fff;font-weight:700;display:flex;align-items:center;gap:4px;text-shadow:0 1px 6px #2563eb77;"><span style='font-size:1.05em;'>⭐</span> ${r.pontos}</div>
      <div style="margin-top:2px;">⏱ ${typeof r.tempo === 'number' ? formatarTempo(r.tempo) : '—'}</div>
    </div>`;
  }
  html += `</div>`;

  // --- RESTANTE DO RANKING (a partir do 4º) ---
  html += `<div class='leaderboard-cards-wrap' style="display:flex;flex-direction:column;gap:18px;align-items:center;justify-content:center;width:100%;max-width:700px;margin:0 auto;">`;
  ranking.slice(3,8).forEach((r, i) => {
    let pos = i + 4;
    let isUser = r.nome === usuario;
    let nivelAluno = getNivel(r.pontos);
    let corBadge = badgeCores[nivelAluno.nome] || '#2563eb';
    let corCard = 'rgba(255,255,255,0.95)';
    let sombraCard = '0 2px 12px #2563eb11,0 1px 0 #fff';
    let borderCard = '2px solid rgba(37,99,235,0.18)';
    // Avatar removido
    let avatar = '';
    let nivelHtml = `<span style="display:inline-flex;align-items:center;gap:4px;background:${corBadge}22;padding:4px 14px;border-radius:14px;font-size:1em;font-weight:700;color:${nivelAluno.nome==='Lendário' ? '#f59e42' : corBadge};margin-left:2px;transition:.2s;"><span style='font-size:1.2em;'>${nivelAluno.icone}</span> ${nivelAluno.nome}</span>`;
    html += `
      <div class='card-leaderboard' style="display:flex;align-items:center;gap:16px;background:${corCard};border:${borderCard};border-radius:14px;box-shadow:${sombraCard};padding:14px 14px 14px 10px;position:relative;transition:.2s;${isUser ? 'outline:3px solid #2563eb;outline-offset:2px;' : ''}cursor:pointer;overflow:hidden;width:100%;max-width:600px;">
        <div style='width:32px;text-align:center;font-size:1.1em;font-weight:900;color:#2563eb;'>${pos}</div>
        <div style='flex:1;min-width:90px;'>
          <div style='font-size:1em;font-weight:900;color:#222;letter-spacing:.5px;line-height:1.1;'>${r.nome}</div>
          <div style='margin-top:2px;'>${nivelHtml}</div>
        </div>
        <div style='display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:1em;font-weight:800;color:#2563eb;'>
          <span style='display:inline-flex;align-items:center;gap:4px;'><span style='font-size:1.05em;'>⭐</span> ${r.pontos}</span>
          <span style='display:inline-flex;align-items:center;gap:4px;'><span style='font-size:1.05em;'>⏱</span> ${formatarTempo(r.tempo)}</span>
        </div>
      </div>
    `;
  });
  html += `</div></div>`;

  // Botão tentar novamente
  html += `<button class='btn-tentar-novo' onclick="window.location='quiz.html'"><span style='font-size:1.2em;margin-right:8px;'>🔄</span>Tentar novamente</button>`;
  // Botão para ir para as atividades centralizado
  html += `<div style="width:100%;display:flex;justify-content:center;margin-top:18px;margin-bottom:8px;">
    <button class='btn-ir-atividades' onclick="window.location='index.html'" style="background:#2563eb;color:#fff;min-width:220px;font-size:1.13em;box-shadow:0 2px 12px #2563eb22;display:flex;align-items:center;justify-content:center;gap:8px;">
      <span style='font-size:1.2em;'>🏠</span>Ir para Atividades
    </button>
  </div>`;

  // Legenda dos níveis (cards)
  // Legenda dos níveis (Lendário primeiro, depois Avançado, Intermediário, Aprendiz, Iniciante)
  let niveis = [
    { faixa: '81 – 100', nome: 'Lendário', medalha: '🏆', cor:'#f43f5e' },
    { faixa: '61 – 80', nome: 'Avançado', medalha: '🏅', cor:'#f59e42' },
    { faixa: '41 – 60', nome: 'Intermediário', medalha: '🥇', cor:'#a78bfa' },
    { faixa: '21 – 40', nome: 'Aprendiz', medalha: '🥈', cor:'#38bdf8' },
    { faixa: '0 – 20', nome: 'Iniciante', medalha: '🥉', cor:'#22c55e' }
  ];
  html += `<div class='niveis-cards'>`;
  niveis.forEach(n=>{
    html += `<div class='nivel-card' style='background:${n.cor};'><span class='nivel-medalha'>${n.medalha}</span><span class='nivel-nome'>${n.nome}</span><span class='nivel-faixa'>${n.faixa}</span></div>`;
  });
  html += `</div>`;

  document.getElementById("lista").innerHTML=html;
}