# 📊 Sistema de Procesamiento de Transacciones Bancarias en Tiempo Real

## 📌 Descripción

Sistema de procesamiento en **streaming** para transacciones bancarias y eventos de tarjetas en tiempo real.

Tecnologías principales:

- Apache Kafka
- Apache Spark Structured Streaming
- Flask + Bootstrap

Permite:

- Procesar datos en tiempo real
- Detectar transacciones sospechosas
- Generar alertas
- Visualizar información en dashboard web

---

## 🏗️ Arquitectura

### 🔹 Capa de Ingesta

Productores en Python envían datos a Kafka:

- `transferencia`
- `eventos_tarjeta`
- `alertas_spark`

---

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CAPA DE INGESTA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐                    ┌──────────────────┐              │
│  │ Producer_Transfer│                    │  Producer_Cards  │              │
│  │      .py         │                    │      .py         │              │
│  └────────┬─────────┘                    └────────┬─────────┘              │
│           │                                       │                         │
│           │  JSON: transaction_id, fecha,        │  JSON: evento_id,       │
│           │  hora, nombre, entidad, tipo,        │  tarjeta_id, cliente,   │
│           │  monto, estado, timestamp            │  tipo, monto, comercio  │
│           │                                       │                         │
│           ▼                                       ▼                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    Apache Kafka                             │           │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │           │
│  │  │ transferencia │  │eventos_tarjeta│  │ alertas_spark │   │           │
│  │  │   (topic)     │  │   (topic)     │  │   (topic)     │   │           │
│  │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │           │
│  └──────────┼──────────────────┼──────────────────┼───────────┘           │
│             │                  │                  │                         │
└─────────────┼──────────────────┼──────────────────┼─────────────────────────┘
              │                  │                  │
              ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PROCESAMIENTO                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    Spark Structured Streaming                       │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │  Stream 1: Transferencias                                    │  │    │
│  │  │  - Parse JSON                                                │  │    │
│  │  │  - Convert timestamp a event_time                            │  │    │
│  │  │  - Watermark de 10 segundos                                  │  │    │
│  │  │  - Ventana tumbling de 1 minuto                              │  │    │
│  │  │  - Agregaciones: MIN, MAX, AVG por entidad                   │  │    │
│  │  │  - Output: CSV files                                         │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │  Stream 2: Alertas (monto > 5000)                            │  │    │
│  │  │  - Filtrar montos elevados                                   │  │    │
│  │  │  - Enriquecer con razón y severidad                          │  │    │
│  │  │  - Output: Kafka topic "alertas_spark"                       │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CAPA DE VISUALIZACIÓN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Dashboard Web (Flask + Bootstrap)                │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────┐    ┌─────────────────────────────┐    │   │
│  │  │  Tabla de Transacciones │    │   Tabla de Eventos Tarjetas  │    │   │
│  │  │  - ID, Fecha, Hora      │    │   - Evento ID, Tarjeta ID    │    │   │
│  │  │  - Nombre, Entidad      │    │   - Cliente, Tipo, Monto     │    │   │
│  │  │  - Tipo, Monto, Estado  │    │   - Comercio, Timestamp      │    │   │
│  │  │  - Botones Aceptar/     │    │                              │    │   │
│  │  │    Rechazar             │    │                              │    │   │
│  │  └─────────────────────────┘    └─────────────────────────────┘    │   │
│  │                                                                      │   │
│  │  API Endpoints:                                                      │   │
│  │  - GET  /api/transactions  → lista de transacciones                 │   │
│  │  - GET  /api/cards         → lista de eventos tarjetas              │   │
│  │  - POST /api/decide/<id>   → aceptar/rechazar transacción           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🔹 Capa de Procesamiento

Spark Structured Streaming realiza:

- Parseo JSON
- Ventanas de 1 minuto
- Watermark de 10 segundos
- Agregaciones (MIN, MAX, AVG)
- Alertas (monto > 5000)

Outputs:

- Archivos CSV
- Topic `alertas_spark`

---

### 🔹 Capa de Visualización

Dashboard en Flask:

Endpoints:

- `GET /api/transactions`
- `GET /api/cards`
- `POST /api/decide/<id>`

---

## ⚙️ Requisitos

```bash
Python 3.8+
Docker 20.10+
Docker Compose 2.0+
Java 11+
```

## 📦 Instalación

```bash
git clone <tu-repo>
cd <tu-repo>

pip install pyspark==3.5.0
pip install kafka-python
pip install flask
```

## 🐳 Ejecución con Docker

Levantar servicios(segundo plano)

```bash
docker-compose up -d
```

Detener servicios

```bash
docker-compose down
```

## ▶️ Ejecución del Sistema

1. Ejecutar productores

```bash
python producer_Transfer.py
python producer_cards.py
```

2. Ejecutar Spark Streaming

```bash
spark-submit spark_processor.py
```

3. Ejecutar Dashboard

```bash
python app.py
```

Acceso al Dashboard

```bash
http://localhost:5000
```
