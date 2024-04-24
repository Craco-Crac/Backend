import aio_pika
import asyncio
import json


class PikaClient:
    def __init__(self, process_callable, loop):
        self.queue = None
        self.channel = None
        self.connection = None
        self.loop = loop
        self.process_callable = process_callable

    async def connect(self):
        self.connection = await aio_pika.connect_robust("amqp://root:root@rabbitmq/")
        self.channel = await self.connection.channel()
        self.queue = await self.channel.declare_queue('stats-rabbit-receive')

    async def consume(self):
        async with self.connection:
            async with self.queue.iterator() as queue_iter:
                async for message in queue_iter:
                    async with message.process():
                        print('Received message')
                        try:
                            body = json.loads(message.body)
                            await self.process_callable(body)
                        except json.JSONDecodeError:
                            print('Received message could not be decoded as JSON')
                            continue

    async def close(self):
        await self.connection.close()

    async def send_message(self, message: dict):
        message = aio_pika.Message(body=json.dumps(message).encode())
        await self.channel.default_exchange.publish(message, routing_key='stats-rabbit-receive')
