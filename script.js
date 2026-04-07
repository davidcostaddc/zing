// Cronômetro regressivo global
let tempoRestanteDashboard = 0;
let cronometroDashboardInterval = null;

// Atualiza a pontuação, nível e inicia o cronômetro regressivo do tempo total
async function atualizarPontuacaoDashboard() {
	// Importa dinamicamente o carregarRanking do firebase.js
	const { carregarRanking } = await import('./firebase.js');
	let nome = localStorage.getItem('usuario');
	let pontos = 0;
	// Atividades possíveis
	const atividades = Object.values(atividadePorArea);
	// Soma todos os pontos do usuário em todas as atividades
	for (let atividade of atividades) {
		let ranking = await carregarRanking(atividade);
		ranking.forEach(r => {
			if(r.nome === nome && typeof r.pontos === 'number') pontos += r.pontos;
		});
	}
	let pontosSpan = document.getElementById('pontos');
	if(pontosSpan) pontosSpan.textContent = pontos;

	// Exibe o nível do usuário
	let nivel = getNivelDashboard(pontos);
	let nivelDiv = document.getElementById('nivelDashboard');
	if(nivelDiv) {
		nivelDiv.innerHTML = `<div style="display:flex;align-items:center;gap:10px;justify-content:center;font-size:1.1em;font-weight:700;">
			<span style='font-size:1.5em;'>${nivel.medalha}</span>
			<span>${nivel.nome}</span>
			<span style='background:#fff2;padding:2px 10px;border-radius:8px;font-size:.95em;font-weight:600;color:#2563eb;'>${nivel.faixa}</span>
		</div>`;
	}

	// Calcula tempo total concedido conforme a regra
	let segundos = Math.floor((pontos / 10) * 60); // 10 pontos = 1 minuto
	// Se já existe um cronômetro, limpa
	if (cronometroDashboardInterval) clearInterval(cronometroDashboardInterval);
	tempoRestanteDashboard = segundos;
	atualizarTempoDashboard();
	// Função para zerar pontos ao acabar o tempo
	async function zerarPontosSeTempoAcabou() {
		let pontosSpan = document.getElementById('pontos');
		if(pontosSpan) pontosSpan.textContent = 0;
		let nivelDiv = document.getElementById('nivelDashboard');
		if(nivelDiv) {
			let nivel = getNivelDashboard(0);
			nivelDiv.innerHTML = `<div style="display:flex;align-items:center;gap:10px;justify-content:center;font-size:1.1em;font-weight:700;">
				<span style='font-size:1.5em;'>${nivel.medalha}</span>
				<span>${nivel.nome}</span>
				<span style='background:#fff2;padding:2px 10px;border-radius:8px;font-size:.95em;font-weight:600;color:#2563eb;'>${nivel.faixa}</span>
			</div>`;
		}
	}
	if (segundos > 0) {
		cronometroDashboardInterval = setInterval(() => {
			tempoRestanteDashboard--;
			atualizarTempoDashboard();
			if (tempoRestanteDashboard <= 0) {
				clearInterval(cronometroDashboardInterval);
				tempoRestanteDashboard = 0;
				atualizarTempoDashboard();
				zerarPontosSeTempoAcabou();
			}
		}, 1000);
	}
	// Adiciona funcionalidade ao botão de pausar
	setTimeout(() => {
		const btnPausar = document.getElementById('btnPausarTempo');
		if(btnPausar) {
			btnPausar.onclick = function() {
				if(btnPausar.dataset.pausado === 'true') {
					// Retomar
					btnPausar.textContent = '⏸️ Pausar';
					btnPausar.dataset.pausado = 'false';
					if (!cronometroDashboardInterval && tempoRestanteDashboard > 0) {
						cronometroDashboardInterval = setInterval(() => {
							tempoRestanteDashboard--;
							atualizarTempoDashboard();
							if (tempoRestanteDashboard <= 0) {
								clearInterval(cronometroDashboardInterval);
								tempoRestanteDashboard = 0;
								atualizarTempoDashboard();
							}
						}, 1000);
					}
				} else {
					// Pausar
					btnPausar.textContent = '▶️ Retomar';
					btnPausar.dataset.pausado = 'true';
					if (cronometroDashboardInterval) {
						clearInterval(cronometroDashboardInterval);
						cronometroDashboardInterval = null;
					}
				}
			};
			btnPausar.dataset.pausado = 'false';
		}
	}, 100);
// Retorna o nível do usuário de acordo com a pontuação
function getNivelDashboard(pontos) {
	if(pontos >= 81) return {faixa:'81 – 100', nome:'Lendário', medalha:'🏆'};
	if(pontos >= 61) return {faixa:'61 – 80', nome:'Avançado', medalha:'🏅'};
	if(pontos >= 41) return {faixa:'41 – 60', nome:'Intermediário', medalha:'🥇'};
	if(pontos >= 21) return {faixa:'21 – 40', nome:'Aprendiz', medalha:'🥈'};
	return {faixa:'0 – 20', nome:'Iniciante', medalha:'🥉'};
}
}

function atualizarTempoDashboard() {
    let tempoSpan = document.getElementById('tempoDashboard');
    if(tempoSpan) tempoSpan.textContent = formatarTempoDashboard(tempoRestanteDashboard);
    // Atualiza barra de progresso
    let barra = document.getElementById('barraProgressoTempo');
    let barraInterna = document.getElementById('progressoTempoInterno');
    if(barra && barraInterna) {
        // Calcula porcentagem do tempo restante
        let total = barra.dataset.totalTempo ? parseInt(barra.dataset.totalTempo) : null;
        if(total === null) {
            // Descobre o total inicial na primeira chamada
            total = tempoRestanteDashboard;
            barra.dataset.totalTempo = total;
        }
        let perc = total > 0 ? Math.max(0, Math.min(100, (tempoRestanteDashboard/total)*100)) : 0;
        barraInterna.style.width = perc + '%';
    }
}

// Formata o tempo em segundos para mm:ss ou hh:mm:ss se houver horas
function formatarTempoDashboard(seg) {
	if(typeof seg !== 'number' || isNaN(seg)) return '0';
	let h = Math.floor(seg/3600);
	let m = Math.floor((seg%3600)/60);
	let s = seg%60;
	if (h > 0) {
		return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
	} else {
		return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
	}
}
document.getElementById("usuario").innerText=nome
document.querySelector(".login").style.display="none"
document.getElementById("dashboard").classList.remove("hidden")

// Exibe dashboard automaticamente se usuário já estiver salvo, senão mostra login
window.addEventListener('DOMContentLoaded', function() {
	if(localStorage.getItem('usuario')) {
		document.querySelector('.login').style.display = 'none';
		document.getElementById('dashboard').classList.remove('hidden');
		let nome = localStorage.getItem('usuario');
		if(nome) document.getElementById('usuario').innerText = nome;
		atualizarPontuacaoDashboard();
	} else {
		document.querySelector('.login').style.display = '';
		document.getElementById('dashboard').classList.add('hidden');
	}
});

function entrar(){
	let nome = document.getElementById("nome").value;
	if(nome==""){
		alert("Digite seu nome");
		return;
	}
	localStorage.setItem("usuario",nome);
	document.getElementById("usuario").innerText=nome;
	document.querySelector(".login").style.display="none";
	document.getElementById("dashboard").classList.remove("hidden");
	atualizarPontuacaoDashboard();
}

// Mapeamento de área para identificador único de atividade
const atividadePorArea = {
	seguranca: "atividade1",
	redes: "atividade2",
	programacao: "atividade3"
};

function abrirQuiz(area){
	localStorage.setItem("area", area);
	// Define identificador único para cada quiz
	localStorage.setItem("atividade", atividadePorArea[area] || area);
	window.location = "quiz.html";
}

function abrirRanking(area){
	localStorage.setItem("area", area);
	// Define identificador único para cada ranking
	localStorage.setItem("atividade", atividadePorArea[area] || area);
	window.location = "ranking.html";
}