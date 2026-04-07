


// Perguntas separadas por área
const perguntasPorArea = {
	seguranca: [
		{pergunta:"O que é firewall?",opcoes:["Proteção de rede","Tipo de cabo","Servidor","Banco de dados"],correta:0},
		{pergunta:"O que é phishing?",opcoes:["Golpe digital","Tipo de firewall","Rede física","Backup"],correta:0},
		{pergunta:"O que é backup?",opcoes:["Cópia de segurança","Antivírus","Rede","Firewall"],correta:0},
		{pergunta:"O que é malware?",opcoes:["Software malicioso","Rede","Backup","Senha"],correta:0},
		{pergunta:"O que é autenticação?",opcoes:["Verificação de identidade","Rede","Backup","Malware"],correta:0},
		{pergunta:"O que é senha forte?",opcoes:["Senha difícil de adivinhar","Senha curta","Senha padrão","Senha de admin"],correta:0},
		{pergunta:"O que é autenticação de dois fatores?",opcoes:["Verificação dupla de identidade","Tipo de firewall","Backup automático","Rede cabeada"],correta:0},
		{pergunta:"O que é ransomware?",opcoes:["Vírus de sequestro de dados","Tipo de senha","Firewall físico","Rede mesh"],correta:0},
		{pergunta:"O que é engenharia social?",opcoes:["Manipulação para obter dados","Backup","Rede","Firewall"],correta:0},
		{pergunta:"O que é biometria?",opcoes:["Identificação física","Rede","Antivírus","Servidor"],correta:0}
	],
	redes: [
		{pergunta:"O que é IP?",opcoes:["Endereço de rede","Tipo de vírus","Memória RAM","Programa"],correta:0},
		{pergunta:"O que é VPN?",opcoes:["Rede privada virtual","Antivírus","Backup","Firewall"],correta:0},
		{pergunta:"O que é HTTPS?",opcoes:["Protocolo seguro de navegação","Tipo de vírus","Rede local","Senha forte"],correta:0},
		{pergunta:"O que é SQL Injection?",opcoes:["Ataque a banco de dados","Tipo de backup","Rede sem fio","Firewall"],correta:0},
		{pergunta:"O que é DNS?",opcoes:["Sistema de nomes de domínio","Tipo de firewall","Antivírus","Backup"],correta:0},
		{pergunta:"O que é gateway?",opcoes:["Ponto de acesso entre redes","Senha forte","Backup automático","Firewall"],correta:0},
		{pergunta:"O que é roteador?",opcoes:["Dispositivo que direciona pacotes","Tipo de vírus","Backup","Senha"],correta:0},
		{pergunta:"O que é máscara de sub-rede?",opcoes:["Define o tamanho da rede","Tipo de backup","Firewall físico","Rede mesh"],correta:0},
		{pergunta:"O que é LAN?",opcoes:["Rede local","Tipo de senha","Firewall físico","Rede mesh"],correta:0},
		{pergunta:"O que é WAN?",opcoes:["Rede de longa distância","Tipo de backup","Rede cabeada","Antivírus"],correta:0}
	],
	programacao: [
		{pergunta:"O que é variável?",opcoes:["Espaço para armazenar dados","Tipo de vírus","Rede local","Senha forte"],correta:0},
		{pergunta:"O que é loop?",opcoes:["Estrutura de repetição","Tipo de firewall","Backup automático","Rede cabeada"],correta:0},
		{pergunta:"O que é função?",opcoes:["Bloco de código reutilizável","Tipo de backup","Firewall físico","Rede mesh"],correta:0},
		{pergunta:"O que é algoritmo?",opcoes:["Sequência de passos para resolver um problema","Tipo de senha","Firewall físico","Rede mesh"],correta:0},
		{pergunta:"O que é array?",opcoes:["Estrutura que armazena vários valores","Tipo de backup","Rede cabeada","Antivírus"],correta:0},
		{pergunta:"O que é condicional?",opcoes:["Estrutura de decisão","Tipo de vírus","Backup","Senha"],correta:0},
		{pergunta:"O que é IDE?",opcoes:["Ambiente de desenvolvimento integrado","Tipo de firewall","Backup automático","Rede cabeada"],correta:0},
		{pergunta:"O que é compilador?",opcoes:["Programa que traduz código fonte","Tipo de senha","Firewall físico","Rede mesh"],correta:0},
		{pergunta:"O que é bug?",opcoes:["Erro em um programa","Tipo de backup","Rede cabeada","Antivírus"],correta:0},
		{pergunta:"O que é lógica de programação?",opcoes:["Raciocínio para resolver problemas com código","Tipo de backup","Rede cabeada","Antivírus"],correta:0}
	]
};

// Seleciona perguntas do tema escolhido
let area = localStorage.getItem("area") || "seguranca";
let perguntasOriginais = perguntasPorArea[area] || perguntasPorArea.seguranca;

// Remove perguntas duplicadas pelo texto
let perguntasUnicas = [];
let textos = new Set();
for(let p of perguntasOriginais){
	if(!textos.has(p.pergunta)){
		perguntasUnicas.push(p);
		textos.add(p.pergunta);
	}
}

// Função para embaralhar array (Fisher-Yates)
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

// Embaralha perguntas e opções
shuffle(perguntasUnicas);
let perguntas = perguntasUnicas.map(p => {
	let opcoes = [...p.opcoes];
	let correta = p.correta;
	// Embaralha opções e ajusta índice da correta
	let indices = opcoes.map((_,i)=>i);
	shuffle(indices);
	let novasOpcoes = indices.map(i=>opcoes[i]);
	let novaCorreta = indices.indexOf(correta);
	return {pergunta: p.pergunta, opcoes: novasOpcoes, correta: novaCorreta};
});





// Importa funções do Firebase
import { salvarRanking } from "./firebase.js";

let pagina = 0;

const porPagina = 2;
let respostas = Array(perguntas.length).fill(null); // armazena índice da alternativa marcada
let confirmadas = Array(perguntas.length).fill(false); // controla se a resposta já foi confirmada
let pontos = 0;

let tempoGlobal = 120; // 2 minutos
let timerGlobal = null;
let tempoRestante = tempoGlobal;


function carregar(){
	let inicio = pagina * porPagina;
	let fim = Math.min(inicio + porPagina, perguntas.length);
	let totalPaginas = Math.ceil(perguntas.length/porPagina);
	let respondidas = confirmadas.filter(Boolean).length;
	let totalPerguntas = perguntas.length;
	let progresso = Math.round((respondidas/totalPerguntas)*100);
	let html = `<div id='cronometroGlobal' style='font-size:1.2em;color:#fff;background:#2563eb;padding:8px 22px;border-radius:16px;display:inline-block;margin-bottom:18px;box-shadow:0 2px 8px #312e8133;position:sticky;top:16px;right:24px;float:right;z-index:10;'>⏰ <span id='tempoQuizGlobal'>2:00</span></div>`;

	// Barra de progresso visual
	html += `<div class='quiz-progresso-bar-container'><div class='quiz-progresso-bar' style='width:${progresso}%;'></div></div>`;
	// Contador de perguntas
	html += `<div class='quiz-contador-perguntas'>Pergunta ${Math.min(inicio+1, totalPerguntas)}-${Math.min(fim, totalPerguntas)} de ${totalPerguntas}</div>`;

	// Barra de navegação de páginas com clique
	html += `<div style='text-align:center;margin-bottom:24px;'>`;
	for(let p=0;p<totalPaginas;p++){
		let isAtual = p===pagina;
		let isLiberada = true;
		let isConcluida = true;
		let inicioPag = p*porPagina;
		let fimPag = Math.min(inicioPag+porPagina, perguntas.length);
		for(let i=inicioPag;i<fimPag;i++) {
			if(!confirmadas[i]) isLiberada = false;
			if(!confirmadas[i]) isConcluida = false;
		}
		let conteudo = isConcluida ? '*' : '';
		html += `<span class='quiz-pagina-indicador' data-pagina='${p}' style='display:inline-block;width:28px;height:28px;border-radius:8px;background:${isAtual?'#2563eb':'rgba(255,255,255,0.18)'};margin:0 6px;vertical-align:middle;box-shadow:0 1px 4px #312e8133;transition:background 0.2s;cursor:${isAtual||isLiberada?'pointer':'not-allowed'};opacity:${isAtual||isLiberada?1:0.5};font-weight:bold;font-size:1.2em;'>${conteudo}</span>`;
	}
	html += `</div>`;
	// Adiciona evento de clique nos quadradinhos
	setTimeout(()=>{
	  document.querySelectorAll('.quiz-pagina-indicador').forEach(el => {
		let pag = Number(el.getAttribute('data-pagina'));
		if(pag !== pagina) {
			// Só permite clicar se todas as perguntas da página já foram confirmadas
			let inicioPag = pag*porPagina;
			let fimPag = Math.min(inicioPag+porPagina, perguntas.length);
			let liberada = true;
			for(let i=inicioPag;i<fimPag;i++) if(!confirmadas[i]) liberada = false;
			if(liberada) {
				el.onclick = function(){ pagina = pag; carregar(); };
			}
		}
	  });
	}, 10);

	html += `<form id='formQuizGlobal' style='max-width:520px;margin:0 auto;text-align:left;'>`;
	for(let i=inicio;i<fim;i++){
		let p = perguntas[i];
		html += `<div class='quiz-pergunta-bloco' id='pergunta-bloco-${i}' style='margin-bottom:32px;'>`;
		html += `<div class='quiz-enunciado' style='font-size:1.1em;font-weight:bold;margin-bottom:10px;'>${i+1}. ${p.pergunta}</div>`;
		p.opcoes.forEach((op,j)=>{
			let checked = respostas[i]===j ? 'checked' : '';
			html += `<label class='quiz-alternativa' data-idx='${j}'>\n        <input type='radio' name='opcao-${i}' value='${j}' style='margin-right:10px;' ${checked}> <span>${op}</span>\n      </label>`;
		});
		// Espaço para explicação da resposta
		html += `<div class='quiz-explicacao' id='explicacao-${i}' style='display:none;margin-top:8px;font-size:0.98em;color:#fff;background:#312e81;padding:10px 16px;border-radius:12px;'></div>`;
		html += `</div>`;
	}
	html += `<div style='text-align:center;margin-top:18px;'>`;
	if(pagina>0) html += `<button id='btnAnterior' type='button' style='margin:8px 12px;padding:10px 28px;font-size:1em;border-radius:12px;background:#a5b4fc;color:#fff;font-weight:bold;cursor:pointer;border:none;'>Anterior</button>`;
	// Só mostra o botão Confirmar se ainda não foi confirmada esta página
	let paginaConfirmada = true;
	for(let i=inicio;i<fim;i++) if(!confirmadas[i]) paginaConfirmada = false;
	if(!paginaConfirmada && pagina<totalPaginas-1) {
		html += `<button id='btnConfirmarPagina' type='submit' style='margin:8px 12px;padding:12px 38px;font-size:1.1em;border-radius:18px;background:#2563eb;color:#fff;font-weight:bold;cursor:pointer;border:none;'>Confirmar</button>`;
	} else if(pagina===totalPaginas-1 && !paginaConfirmada) {
		html += `<button id='btnConfirmarFinal' type='submit' style='margin:8px 12px;padding:12px 38px;font-size:1.1em;border-radius:18px;background:#2563eb;color:#fff;font-weight:bold;cursor:pointer;border:none;'>Confirmar e ver ranking</button>`;
	}
	// Sempre renderiza o botão Próxima se a página está confirmada e não é a última
	if(paginaConfirmada && pagina<totalPaginas-1) {
		html += `<button id='btnProxima' type='button' style='margin:8px 12px;padding:10px 28px;font-size:1em;border-radius:12px;background:#2563eb;color:#fff;font-weight:bold;cursor:pointer;border:none;display:inline-block;'>Próxima</button>`;
	}
	html += `</div>`;
	html += `</form>`;
	document.getElementById("opcoes").innerHTML=html;

	for(let i=inicio;i<fim;i++){
		// Se já foi confirmada, marca visual e bloqueia
		if(confirmadas[i]) {
			let idxSelecionada = respostas[i];
			let correta = perguntas[i].correta;
			document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa`).forEach((lab,j)=>{
				lab.classList.remove('selected');
				if(j === correta) lab.classList.add('correta');
				if(j === idxSelecionada && idxSelecionada !== correta) lab.classList.add('errada');
			});
			document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa input[type=radio]`).forEach(r=>r.disabled=true);
			// Mostra explicação se já confirmada
			let explicacao = perguntas[i].explicacao || '';
			if(explicacao) {
				let el = document.getElementById(`explicacao-${i}`);
				if(el) { el.innerHTML = `<b>Explicação:</b> ${explicacao}`; el.style.display = 'block'; }
			}
		}
		document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa input[type=radio]`).forEach(radio => {
			radio.addEventListener('change', function() {
				if(confirmadas[i]) return;
				document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa`).forEach(lab => lab.classList.remove('selected'));
				if(this.checked) {
					this.closest('.quiz-alternativa').classList.add('selected');
				}
				respostas[i] = Number(this.value);
			});
		});
	}

	if(document.getElementById('btnAnterior'))
		document.getElementById('btnAnterior').onclick = function(){ pagina--; carregar(); };
	if(document.getElementById('btnProxima')) {
		document.getElementById('btnProxima').onclick = function(){
			let totalPaginas = Math.ceil(perguntas.length/porPagina);
			let inicio = pagina * porPagina;
			let fim = Math.min(inicio + porPagina, perguntas.length);
			let paginaConfirmada = true;
			for(let i=inicio;i<fim;i++) if(!confirmadas[i]) paginaConfirmada = false;
			if(paginaConfirmada && pagina < totalPaginas-1) {
				pagina = Math.min(pagina+1, totalPaginas-1);
				carregar();
			} else if(!paginaConfirmada) {
				alert('Confirme suas respostas antes de avançar!');
			}
		};
	}

	document.getElementById('formQuizGlobal').onsubmit = function(e) {
		e.preventDefault();
		if(pagina < totalPaginas-1) {
			confirmarPagina();
		} else {
			confirmarQuiz();
		}
	};
	iniciarCronometroGlobal();
}

function iniciarCronometroGlobal() {
	let t = tempoGlobal;
	clearInterval(timerGlobal);
	atualizarTempoGlobal(t);
	timerGlobal = setInterval(() => {
		t--;
		tempoRestante = t;
		atualizarTempoGlobal(t);
		if (t <= 0) {
			clearInterval(timerGlobal);
			confirmarQuiz();
		}
	}, 1000);
}

function atualizarTempoGlobal(t) {
	let min = Math.floor(t/60);
	let seg = t%60;
	document.getElementById('tempoQuizGlobal').innerText = `${min}:${seg.toString().padStart(2,'0')}`;
}


function confirmarPagina() {
	// Marca visualmente as respostas da página atual e bloqueia alteração
	let inicio = pagina * porPagina;
	let fim = Math.min(inicio + porPagina, perguntas.length);
	for(let i=inicio;i<fim;i++){
		let idxSelecionada = respostas[i];
		let correta = perguntas[i].correta;
		// Se não marcou nenhuma, impede confirmação
		if(idxSelecionada === null || idxSelecionada === undefined) {
			alert('Por favor, selecione uma alternativa para cada pergunta antes de confirmar.');
			return;
		}
		confirmadas[i] = true;
		document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa`).forEach((lab,j)=>{
			lab.classList.remove('selected');
			if(j === correta) lab.classList.add('correta');
			if(j === idxSelecionada && idxSelecionada !== correta) lab.classList.add('errada');
		});
		document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa input[type=radio]`).forEach(r=>r.disabled=true);
	}
	// Esconde o botão Confirmar da página
	let btn = document.getElementById('btnConfirmarPagina');
	if(btn) btn.style.display = 'none';
	// Garante que o botão Próxima será renderizado ao recarregar a página
	carregar();
	// Não avança automaticamente, usuário deve clicar em Próxima
}

function confirmarQuiz() {
	clearInterval(timerGlobal);
	pontos = 0;
	perguntas.forEach((p,i)=>{
		let idxSelecionada = respostas[i];
		let correta = p.correta;
		// Se não respondeu, considera errada
		if(idxSelecionada === correta) pontos += 10;
		// Se não respondeu, marca visualmente como errada
		if(idxSelecionada === null || idxSelecionada === undefined) {
			document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa`).forEach((lab,j)=>{
				lab.classList.remove('selected');
				if(j === correta) lab.classList.add('correta');
				if(j === 0) lab.classList.add('errada'); // marca a primeira como errada só para visual
			});
		}
		document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa`).forEach((lab,j)=>{
			lab.classList.remove('selected');
			if(j === correta) lab.classList.add('correta');
			if(j === idxSelecionada && idxSelecionada !== correta) lab.classList.add('errada');
		});
		document.querySelectorAll(`#pergunta-bloco-${i} .quiz-alternativa input[type=radio]`).forEach(r=>r.disabled=true);
	});
	setTimeout(finalizar, 1200);
}

// Funções responder/proxima duplicadas removidas (usadas apenas na paginação nova)

async function finalizar(){
	let nome = localStorage.getItem("usuario") || "Você";
	let area = localStorage.getItem("area") || "geral";
	let atividade = localStorage.getItem("atividade") || "quiz1";
	let alunoId = localStorage.getItem("alunoId") || crypto.randomUUID();
	localStorage.setItem("alunoId", alunoId);
	let tempoFinal = tempoRestante;

	// Salva no Firestore
	try {
		await salvarRanking({ nome, pontos, area, atividade, alunoId, tempo: tempoFinal });
	} catch (e) {
		// fallback localStorage se offline
		let ranking = JSON.parse(localStorage.getItem("ranking-"+area))||[];
		ranking.push({ nome, pontos, tempo: tempoFinal });
		localStorage.setItem("ranking-"+area, JSON.stringify(ranking));
	}
	// Redireciona para ranking
	window.location = "ranking.html";
}

carregar()