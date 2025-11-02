import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, logLevel, Consumer } from 'kafkajs';
import { InfluxDB, Point } from '@influxdata/influxdb-client';


@Injectable()
export class DataService implements OnModuleInit {
  private consumer: Consumer;
  private readonly bpm_topic = 'bpm';
  private influxWriteApi;


  constructor() { 
    // -- InfluxDB setup

    const url = process.env.INFLUX_URL || "http://influxdb:8086";
    const token = process.env.INFLUX_TOKEN;
    const org = process.env.INFLUX_ORG;
    const bucket = process.env.INFLUX_BUCKET;

    if (!token || !org || !bucket) {
      throw new Error("Variables INFLUX_* manquantes");
    }

    const influxDB = new InfluxDB({ url, token });
    this.influxWriteApi = influxDB.getWriteApi(org, bucket, 'ns');
  }

  async connectKafka() {
    let connected = false;
    while (!connected) {
      try {
        const kafka = new Kafka({
          clientId: 'cloud-consumer',
          brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
          logLevel: logLevel.NOTHING
        });
        this.consumer = kafka.consumer({ groupId: 'my-group' });
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: this.bpm_topic, fromBeginning: true });
        connected = true;
        console.log("Consumer connected to Kafka !");
      }
      catch (err) {
        console.log("Erreur Kafka, retrying in 3s...");
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  async onModuleInit() {
    await this.connectKafka();

    console.log('✅ Consumer connected & subscribed to BPM topic');

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const value = JSON.parse(message.value?.toString() || '{}');
        if ( !value.bpm ) return;
        if ( value.bpm <=50 ){
          console.log(`🚫 Ignored BPM value: ${value.bpm}`);
          return;
        }
        console.log(`📥 Received & accepted: ${value.bpm} that was sent at ${new Date(value.sending_timestamp)}`);

        const bpm = value.bpm;

        console.log(`📥 Received BPM ${bpm} (sent at ${new Date(value.sending_timestamp).toLocaleTimeString()})`);

        // --- Écriture dans InfluxDB ---
        const point = new Point('bpm')
          .tag('device', 'boitier-1')
          .tag('patient', 'patient-1')
          .floatField('value', bpm)
          .timestamp(new Date(value.sending_timestamp));

        try {
          this.influxWriteApi.writePoint(point);
          await this.influxWriteApi.flush();
          console.log(`💾 Stored BPM ${bpm} in InfluxDB`);
        } catch (err) {
          console.error('❌ Failed to write to InfluxDB:', err.message);
        }
        
      },
    });
  }
}