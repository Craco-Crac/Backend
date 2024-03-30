import * as amqp from 'amqplib';

interface RabbitMQConfig {
  protocol: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
}

const rabbitMQConfig: RabbitMQConfig = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  username: 'rmuser',
  password: 'rmpassword',
  vhost: '/',
};

interface RabbitMQConnection {
  connection: amqp.Connection;
  channel: amqp.Channel;
}

async function connectRabbitMQ(): Promise<RabbitMQConnection | undefined> {
  try {
    const connection: amqp.Connection = await amqp.connect(rabbitMQConfig);
    const channel: amqp.Channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    return undefined;
  }
}

export default connectRabbitMQ;
