import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import connectRabbitMQ from './rabbitmq';
import { Channel, ConsumeMessage } from 'amqplib';

const app = express();
const port = 3000;

let consumerTag: string | undefined;
let channelGlog: Channel | undefined;
async function startConsumer() {
  try {
    const { channel } = (await connectRabbitMQ()) || { channel: null };
    if (!channel) {
      console.error('Failed to connect to RabbitMQ');
      return;
    }
    channelGlog = channel;
    const queue = 'hello';

    await channel.assertQueue(queue, {
      durable: false,
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    const result = await channel.consume(queue, (msg: ConsumeMessage | null) => {
      if (msg !== null) {
        console.log(" [x] Received '%s'", msg.content.toString());
        channel.ack(msg);
      }
    }, {
      noAck: false,
    });

    consumerTag = result.consumerTag;
  } catch (error) {
    console.error('Error starting consumer:', error);
  }
}

async function stopConsumer(channel: Channel) {
  if (consumerTag) {
    await channel.cancel(consumerTag);
    console.log(" [x] Stopped listening for messages");
    consumerTag = undefined; // Reset the consumer tag
  }
}
//startConsumer();

// Generate swagger specification
const swaggerDocument = YAML.load(path.join(__dirname, './api-docs.yml'));

// Serve swagger
app.use('/docs', (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl == "/docs") return res.redirect('docs/')
  next()
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
];

// GET /users route
app.get('/users', (req: Request, res: Response) => {
  res.status(200).json(users);
});

// GET /users/:id route
app.get('/users/:id', (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);
  const user: User | undefined = users.find(user => user.id === id);

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  res.status(200).json(user);
});

app.get('/send', async (req: Request, res: Response) => {
  const message = "work";//req.body;

  if (!message) {
    return res.status(400).send({ error: 'Message is required' });
  }

  try {
    const { channel } = (await connectRabbitMQ()) || { channel: null };
    if (!channel) {
      return res.status(500).send({ error: 'Failed to connect to RabbitMQ' });
    }

    const queue = 'testQueue';
    await channel.assertQueue(queue, {
      durable: false,
    });

    channel.sendToQueue(queue, Buffer.from(message));
    console.log(" [x] Sent '%s'", message);

    res.send({ message: "Message sent to RabbitMQ" });
  } catch (error) {
    console.error('Error sending message to RabbitMQ:', error);
    res.status(500).send({ error: 'Error sending message to RabbitMQ' });
  }
});

app.get('/stop', async (req: Request, res: Response) => {
  if (channelGlog) { stopConsumer(channelGlog); }
});

app.get('/start', async (req: Request, res: Response) => {
  startConsumer()
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
