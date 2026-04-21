from flask import Flask, render_template_string, request, redirect
import redis
import uuid
import datetime

app = Flask(__name__)

# Conexión a Redis (ajusta 'localhost' si tu Docker usa otra IP)
db = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Plantilla HTML para el control de medidas
HTML_FORM = '''
<!DOCTYPE html>
<html>
<head><title>Control de Gimnasio</title></head>
<body>
    <h2>Registro de Medidas Corporales</h2>
    <form method="POST" action="/registrar">
        <input type="text" name="nombre" placeholder="Nombre del miembro" required>
        <input type="number" step="0.1" name="altura" placeholder="Altura (cm)" required>
        <input type="number" step="0.1" name="peso" placeholder="Peso (kg)" required>
        <input type="number" step="0.1" name="ganancia_muscular" placeholder="Ganancia muscular (kg)" required>
        <button type="submit">Guardar medición</button>
    </form>
    <hr>
    <h3>Historial de Mediciones:</h3>
    <ul>
        {% for m in mediciones %}
            <li>
                <strong>{{ m.nombre }}</strong> | 
                Altura: {{ m.altura }} cm | 
                Peso: {{ m.peso }} kg | 
                Ganancia muscular: {{ m.ganancia_muscular }} kg |
                <small>(ID: {{ m.id }})</small>
            </li>
        {% endfor %}
    </ul>
</body>
</html>
'''

@app.route('/')
def index():
    # Recuperamos todas las mediciones guardadas
    keys = db.keys('medicion:*')
    mediciones = []
    for key in keys:
        data = db.hgetall(key)
        data['id'] = key.split(':')[1]
        mediciones.append(data)
    return render_template_string(HTML_FORM, mediciones=mediciones)

@app.route('/registrar', methods=['POST'])
def registrar():
    nombre = request.form.get('nombre')
    altura = request.form.get('altura')
    peso = request.form.get('peso')
    ganancia_muscular = request.form.get('ganancia_muscular')

    # Generamos un ID único para la medición
    medicion_id = str(uuid.uuid4())[:8]

    # Guardamos en Redis como un HASH con clave medicion:ID
    db.hset(f"medicion:{medicion_id}", mapping={
        "nombre": nombre,
        "altura": altura,
        "peso": peso,
        "ganancia_muscular": ganancia_muscular,
        "fecha": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
    })

    return redirect('/')

app.run(debug=True)