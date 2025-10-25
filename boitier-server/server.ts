import fetch from "node-fetch";
import { WebSocketServer } from "ws";

const CLOUD_URL = "http://cloud-backend:3005/data";

const NUMERO =  "+33742934852";

const wss = new WebSocketServer({ port: 5000 });


wss.on('connection', (ws: any) => {
  console.log('Bracelet connecté ✅');

  ws.on('message', async (raw: string) => {
    const msg = JSON.parse(raw);
    const { type, data } = msg;

    if (type === 'bpm') {
      console.log(`[Boîtier] Received BPM: ${data}`);
      await fetch(CLOUD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bpm: data }),
      });
    } else if (type === 'heartAttack') {
      console.log("🚨 CRISE CARDIAQUE détectée par le bracelet");
      console.log("Envoi d'un SMS au ", NUMERO);
      await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 **Alerte santé :** un rythme cardiaque anormalement élevé a été détecté (${data} BPM). Veuillez vérifier l’état de la personne concernée dès que possible ou contacter les secours si nécessaire.`,
        }),
      });
    }
  });
});