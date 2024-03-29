from django.shortcuts import render
from django.http import HttpResponse
import pika


def home(request):
    credentials = pika.PlainCredentials('rmuser', 'rmpassword')
    parameters = pika.ConnectionParameters('rabbitmq', credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    channel.queue_declare(queue='hello')

    channel.basic_publish(exchange='',
                          routing_key='hello',
                          body='Hello World!')
    print(" [x] Sent 'Hello123 World!'")

    connection.close()
    return HttpResponse('<h1>Welcome to Home Page</h1>')

