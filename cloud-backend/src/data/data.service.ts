import { Injectable, OnModuleInit } from '@nestjs/common';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { Kafka, logLevel, Consumer } from 'kafkajs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DataService implements OnModuleInit {
  private consumer: Consumer;
  private influx: InfluxDB;
  private writeApi;
  private queryApi;
  private readonly bpm_topic = 'bpm';

  constructor(private prisma: PrismaService) {}

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
    //init "this.influx", "this.writeApi", "this.readApi"
    this.influx = new InfluxDB({
      url: process.env.INFLUX_URL || 'http://influxdb:8086',
      token: "iDAHYLDBV10TX6scvtkFfDqxKrUnA_FZ376OzhsKJOGN9z_4ps7ylP5VjMM-EAGzrlvIKG0viWnsJHo0n3VxDQ=="
    });
    this.writeApi = this.influx.getWriteApi('myorg', 'mybucket');
    this.queryApi = this.influx.getQueryApi('myorg');


    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const value = JSON.parse(message.value?.toString() || '{}');
        if (value.measurement_value > 50) {
          console.log(`📥 Received & accepted: ${value.measurement_value} that was sent at ${new Date(value.sending_timestamp)}`);

          const {client_id, measurement_category, measurement_value, sending_timestamp } = value;

          //write point to influxdb
          const point = new Point("metrics")
            .tag('client_id', client_id)
            .tag('category', measurement_category)
            .floatField('value', measurement_value)
            .timestamp(new Date(sending_timestamp));
          this.writeApi.writePoint(point);
          await this.writeApi.flush();
        } else {
          console.log(`🚫 Filtered out: ${value.measurement_value}`);
        }
      },
    });
  }

  async getConsumerBpmData() {
    //query all points from "jeanjacques" for the "bpm" category from influxdb
    const query = `
      from(bucket: "mybucket")
      |> range(start: 0)
      |> filter(fn: (r) => r["category"] == "bpm")
      |> filter(fn: (r) => r["client_id"] == "jeanjacques")
      |> sort(columns: ["timestamp"], desc: false)`;

    return (await this.queryApi.collectRows(query)).map((row: any) => {
      return {
        client_id: row.client_id,
        category: row.category,
        timestamp: row._time,
        value: row._value
      };
    });
  }
}