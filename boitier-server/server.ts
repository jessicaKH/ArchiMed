import { InfluxDB, Point} from "@influxdata/influxdb-client";
import fetch from "node-fetch";
import { WebSocketServer } from "ws";

const CLOUD_URL = "http://cloud-backend:3005/data";

const NUMERO =  "+33742934852";

const wss = new WebSocketServer({ port: 5000 });

const url = process.env.INFLUX_URL || "http://influxdb:8086";
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

if (!token || !org || !bucket) {
  throw new Error("⚠️ Variables INFLUX_* manquantes");
}

const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket, 'ns');

wss.on('connection', (ws: any) => {
  console.log('Bracelet connecté ✅');

  ws.on('message', async (raw: string) => {
    const msg = JSON.parse(raw);
    const { type, data } = msg;

    if (type === 'bpm') {
      console.log(`[Boîtier] Received BPM: ${data}`);
      // envoie au backend ?? pq
      await fetch(CLOUD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bpm: data }),
      });
      // écriture dans InfluxDB
      const point = new Point('bpm')
      .tag('device', 'boitier-1')
      .tag('patient', 'patient-1')
      .floatField('value', data);

      writeApi.writePoint(point);
      await writeApi.flush();
      console.log(`[InfluxDB] ✅ Écrit BPM = ${data}`);

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