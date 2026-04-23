import json
import time
import random
import uuid
from datetime import datetime
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=['localhost:29092'],
    value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8')
)

TOPIC = "tarjetas"
TIPOS = ['compra', 'avance efectivo', 'pago servicios', 'consulta saldo']
COMERCIOS = ['Amazon', 'MercadoLibre', 'Netflix', 'Spotify', 'Uber', 'Rappi']

print(f"💳Productor de eventos de tarjeta corriendo... (topic: {TOPIC})")

while True:
    evento = {
        'evento_id': str(uuid.uuid4())[:8],
        'tarjeta_id': f"****{random.randint(1000,9999)}",
        'cliente': random.choice(['Ana', 'Luis', 'Marta', 'Jorge']),
        'tipo': random.choice(TIPOS),
        'monto': round(random.uniform(5.0, 3000.0), 2) if random.choice([True, False]) else None,
        'comercio': random.choice(COMERCIOS) if random.choice([True, False]) else None,
        'timestamp': datetime.now().isoformat()
    }
    producer.send(TOPIC, value=evento)
    print(f"💳 Enviado: {evento['tipo']} - {evento['cliente']} - ${evento['monto']}")
    time.sleep(3)  # cada 3 segundos