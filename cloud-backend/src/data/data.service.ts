import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, logLevel, Consumer } from 'kafkajs';

@Injectable()
export class DataService implements OnModuleInit {
  private consumer: Consumer;
  private readonly bpm_topic = 'bpm';

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

    console.log('✅ Consumer connected & subscribed');

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const value = JSON.parse(message.value?.toString() || '{}');
        if (value.bpm > 50) {
          console.log(`📥 Received & accepted: ${value.bpm}`);
        } else {
          console.log(`🚫 Filtered out: ${value.bpm}`);
        }
      },
    });
  }
}