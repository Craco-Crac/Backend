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

const connectRabbitMQ = async (): Promise<RabbitMQConnection | undefined> => {
  try {
    const connection: amqp.Connection = await amqp.connect(rabbitMQConfig);
    const channel: amqp.Channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    return undefined;
  }
}


let consumerTag: string | undefined;
let Conn: RabbitMQConnection | undefined;

const initConnection = async () => {
  try {
    Conn = (await connectRabbitMQ()) || undefined;
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    return undefined;
  }
}

const startConsumer = async () => {
  try {
    if (!Conn?.channel) {
      console.error('No RabbitMQ connection established');
      return;
    }
    const queue = 'testQueue';

    await Conn.channel.assertQueue(queue, {
      durable: false,
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    const result = await Conn?.channel.consume(queue, (msg: amqp.ConsumeMessage | null) => {
      if (msg !== null) {
        console.log(" [x] Received '%s'", msg.content.toString());
        Conn?.channel.ack(msg);
        console.log(" [x] Done");
      }
    }, {
      noAck: false,
    });

    consumerTag = result.consumerTag;
  } catch (error) {
    console.error('Error starting consumer:', error);
  }
}

const stopConsumer = async (channel: amqp.Channel | undefined = Conn?.channel) => {
  if (consumerTag && channel) {
    await channel.cancel(consumerTag);
    console.log(" [x] Stopped listening for messages");
    consumerTag = undefined;
  }
}

const sendMessage = async (message: string = "work", channel: amqp.Channel |undefined = Conn?.channel) => {
  await initConnection();
  try {
    if (!Conn?.channel) {
      throw new Error('No RabbitMQ connection established');
    }

    const queue = 'testQueue';
    await Conn?.channel.assertQueue(queue, {
      durable: false,
    });

    Conn?.channel.sendToQueue(queue, Buffer.from(message));
    console.log(" [x] Sent '%s'", message);

  } catch (error) {
    console.error('Error sending message to RabbitMQ:', error);
    throw error;
  }
}

export { initConnection, startConsumer, stopConsumer, sendMessage };
