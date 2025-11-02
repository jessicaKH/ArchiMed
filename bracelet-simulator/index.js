const WebSocket = require('ws');

const WS_URL = 'ws://boitier-server:5000';
const ws = new WebSocket(WS_URL);

let heartRates = [];
let stableBpm = 70;

function emit(type, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, data }));
        console.log(`→ envoyé [${type}]`, data);
    }
}

ws.on('open', () => {
    console.log('Connecté au boitier');
    startSimulation();
});

ws.on('close', () => console.log('Déconnecté du boitier'));
ws.on('error', (err) => console.error('Erreur :', err.message));

function startSimulation() {
    // Génère un BPM stable toutes les secondes
    setInterval(() => {
        const bpm = Math.round(stableBpm + (Math.random() * 4 - 2)); // ±2 bpm
        heartRates.push(bpm);
        console.log('BPM actuel :', bpm);
    }, 1000);

    // Envoie une moyenne toutes les 10 secondes
    setInterval(() => {
        if (heartRates.length === 0) return;
        const avg = heartRates.reduce((a, b) => a + b, 0) / heartRates.length;
        console.log("BPM envoyé au boitier : ", Math.round(avg));
        emit('bpm', Math.round(avg));
        heartRates = [];
    }, 10000);

    // Simule une crise cardiaque toutes les 20 secondes
    setInterval(() => {
        const bpmCrisis = 180 + Math.round(Math.random() * 40); // 180–220
        console.log("Crise Cardiaque détectée, envoi du signal au boitier");
        emit('heartAttack', bpmCrisis);
    }, 20000);
}