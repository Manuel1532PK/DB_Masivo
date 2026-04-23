import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    from_json, col, window, min, max, avg,
    to_json, struct, lit, to_timestamp
)
from pyspark.sql.types import StructType, StructField, StringType, DoubleType

os.environ["HADOOP_HOME"] = r"C:\hadoop"
os.environ["PATH"] = r"C:\hadoop\bin" + ";" + os.environ.get("PATH", "")


KAFKA_SERVERS = os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:29092')


# Crear sesión Spark
spark = SparkSession.builder \
    .appName("FinancialTumblingWindow") \
    .config("spark.sql.legacy.timeParserPolicy", "LEGACY") \
    .config("spark.sql.shuffle.partitions", "2") \
    .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
    .config("spark.hadoop.fs.file.impl", "org.apache.hadoop.fs.LocalFileSystem") \
    .config("spark.hadoop.fs.AbstractFileSystem.file.impl", "org.apache.hadoop.fs.local.LocalFs") \
    .config("spark.hadoop.hadoop.home.dir", r"C:\hadoop") \
    .config("spark.driver.extraJavaOptions", "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED") \
    .config("spark.executor.extraJavaOptions", "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED") \
    .getOrCreate()
spark.sparkContext.setLogLevel("WARN")

# Esquema de los mensajes del topic 'transferencia'
schema = StructType([
    StructField("transaction_id", StringType()),
    StructField("fecha", StringType()),
    StructField("hora", StringType()),
    StructField("nombre", StringType()),
    StructField("entidad", StringType()),
    StructField("tipo", StringType()),
    StructField("monto", DoubleType()),
    StructField("estado", StringType()),
    StructField("timestamp", StringType()) 
])

# Leer stream desde Kafka
raw_stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", KAFKA_SERVERS) \
    .option("subscribe", "transferencia") \
    .option("startingOffsets", "latest") \
    .load()

# Parsear JSON y convertir timestamp string a TimestampType
parsed = raw_stream \
    .selectExpr("CAST(value AS STRING) as json_str") \
    .select(from_json(col("json_str"), schema).alias("data")) \
    .select("data.*") \
    .withColumn("event_time", to_timestamp(col("timestamp"), "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")) \
    .withWatermark("event_time", "10 seconds") \
    .filter(col("monto").isNotNull() & (col("monto") > 0))

# Ventana tumbling de 1 minuto, agrupando por entidad, usando event_time
resultado = parsed \
    .groupBy(
        window(col("event_time"), "1 minute"),
        col("entidad")
    ) \
    .agg(
        min("monto").alias("min_monto"),
        max("monto").alias("max_monto"),
        avg("monto").alias("avg_monto")
    ) \
    .select(
        col("window.start").alias("ventana_inicio"),
        col("window.end").alias("ventana_fin"),
        col("entidad"),
        col("min_monto"),
        col("max_monto"),
        col("avg_monto")
    )

# ============================================
# Persistencia en CSV (modo append)
# ============================================
csv_path = r"C:\resultados_csv"
checkpoint_csv = r"C:\spark_checkpoints\csv"
os.makedirs(csv_path, exist_ok=True)
os.makedirs(checkpoint_csv, exist_ok=True)

csv_query = resultado.writeStream \
    .outputMode("append") \
    .format("csv") \
    .option("path", csv_path) \
    .option("checkpointLocation", checkpoint_csv) \
    .trigger(processingTime="10 seconds") \
    .start()

# ============================================
# Sistema de alertas (montos > 5000)
# ============================================
alertas = parsed.filter(col("monto") > 5000) \
    .select(
        col("transaction_id"),
        col("entidad"),
        col("monto"),
        lit("Monto excede 5000 (anomalía)").alias("razon"),
        lit("alta").alias("severidad"),
        col("event_time").alias("timestamp_alerta")
    )

def write_alerts_to_kafka(df, epoch_id):
    if df.count() == 0:
        return
    df.select(to_json(struct("*")).alias("value")) \
        .write \
        .format("kafka") \
        .option("kafka.bootstrap.servers", KAFKA_SERVERS) \
        .option("topic", "alertas_spark") \
        .mode("append") \
        .save()
    print(f"🚨 {df.count()} alertas enviadas al topic 'alertas_spark'")

alerta_query = alertas.writeStream \
    .outputMode("append") \
    .foreachBatch(write_alerts_to_kafka) \
    .trigger(processingTime="5 seconds") \
    .start()

# ============================================
# Inicio de los streams
# ============================================
print("⚡ Procesador Spark corriendo. Ventanas tumbling de 1 minuto (basadas en event_time)...")
print("   - Resultados en CSV (./resultados_csv)")
print("   - Alertas (monto > 5000) a topic 'alertas_spark'")
print("   Presiona Ctrl+C para detener.\n")

spark.streams.awaitAnyTermination()