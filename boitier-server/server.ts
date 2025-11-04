import fetch from "node-fetch";
import { WebSocketServer } from "ws";
import { Kafka, logLevel } from 'kafkajs';

const NUMERO = "+33742934852";

const wss = new WebSocketServer({ port: 5000 });



// -- Kafka setup
let producer: any;

async function connectKafka() {
  let connected = false;
  while (!connected) {
    try {
      const kafka = new Kafka({
        clientId: 'boitier',
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
        logLevel: logLevel.NOTHING
      });
      producer = kafka.producer();
      await producer.connect();
      connected = true;
      console.log("'Boitier' producer connected to Kafka !");
    } catch (err) {
      console.log("Erreur Kafka, retrying in 3s...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

wss.on('connection', async (ws: any) => {
  console.log('Bracelet connecté ✅');

  await connectKafka();
  console.log("'Boitier' producer connected to Kafka !");

  ws.on('message', async (raw: string) => {
    const msg = JSON.parse(raw);
    const { type, data } = msg;

    // - envoie des données à Kafka
    if (type === 'bpm') {
      console.log(`[Boîtier] Received BPM: ${data}`);
      await producer.send({
        topic: "bpm",
        messages: [{ value: JSON.stringify({ 
          bpm: data,
          sending_timestamp: Date.now()
         }) }],
      });

      console.log("|bpm| Sent BPM data to Kafka !");

    } 
    else if (type === 'heartAttack') {
      console.log("🚨 CRISE CARDIAQUE détectée par le bracelet");
      console.log("Envoi d'un SMS au ", NUMERO);
      await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 **Alerte santé :** un rythme cardiaque anormalement élevé a été détecté (${data} BPM). Veuillez vérifier l’état de la personne concernée dès que possible ou contacter les secours si nécessaire.`,
        }),
      });
      try{
        await fetch("http://cloud-backend:3005/tachycardie", {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bpm: data, sending_timestamp: Date.now() })
        })
      }catch(e){
        console.log("couldn't send tachicardia info to cloud : ", e);
      }


    }
  });
});