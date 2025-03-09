import { Consumer, Kafka, Producer, Admin } from "kafkajs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

export const kafka = new Kafka({
  clientId: "my-app",
  brokers: [process.env.KAFKA_BROKER!],
  ssl: {
    ca: [
      fs.readFileSync(path.resolve(process.env.KAFKA_CA_CERT_PATH!), "utf-8"),
    ],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
    mechanism: "plain",
  },
});

let producer: Producer | null = null;
let consumer: Consumer | null = null;
let admin: Admin | null = null;

export async function createProducer() {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function createConsumer() {
  if (consumer) return consumer;
  const _consumer = kafka.consumer({
    groupId: process.env.KAFKA_CONSUMER_GROUP!,
  });
  await _consumer.connect();
  consumer = _consumer;
  return consumer;
}

export async function createAdmin() {
  if (admin) return admin;
  const _admin = kafka.admin();
  await _admin.connect();
  admin = _admin;
  return admin;
}

export async function createTopicIfNotExists(topic: string) {
  const _admin = await createAdmin();

  const topics = await _admin.listTopics();
  if (!topics.includes(topic)) {
    await _admin.createTopics({
      topics: [{ topic }],
    });
    console.log(`Topic '${topic}' created`);
  }
}

export async function ensureTopicExistence(projectId: string) {
  const topicName = `logs-${projectId}`;
  await createTopicIfNotExists(topicName);
}

export async function produceMessage(
  message: string,
  key: string,
  topic?: string
) {
  const producer = await createProducer();
  console.log("Producer Created");
  await producer.send({
    topic: topic || process.env.KAFKA_DEFAULT_TOPIC!,
    messages: [
      {
        key: key,
        value: message,
      },
    ],
  });
  console.log("Message Sent");
  return true;
}
