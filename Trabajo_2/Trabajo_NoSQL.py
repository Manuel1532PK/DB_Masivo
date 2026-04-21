from flask import Flask, render_template_string, request, redirect, url_for
import redis
import uuid
import datetime

app = Flask(__name__)

# Conexión a Redis
db = redis.Redis(host='localhost', port=6379, decode_responses=True)

TTL_SESION = 1800  # 30 minutos (cambiar a 1800 para producción)

# Plantilla HTML principal (índice)
HTML_INDEX = '''
<!DOCTYPE html>
<html>
<head>
    <title>Gestión de Sesiones - Tiempo Real</title>
    <style>
        body { font-family: Arial; margin: 40px; }
        input, button { padding: 8px; margin: 5px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .activo { color: green; font-weight: bold; }
        .expirado { color: red; }
    </style>
</head>
<body>
    <h1>Gestión de Sesiones de Usuario en Tiempo Real</h1>
    
    <h2>Crear Nueva Sesión (Login)</h2>
    <form method="POST" action="/crear">
        <input type="text" name="username" placeholder="Nombre de usuario" required>
        <input type="email" name="email" placeholder="Email" required>
        <button type="submit">Iniciar Sesión</button>
    </form>
    
    <hr>
    
    <h2>Sesiones Activas</h2>
    <table>
        <thead>
            <tr>
                <th>ID Sesión</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Último Acceso</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {% for sesion in sesiones %}
            <tr>
                <td>{{ sesion.id }}</td>
                <td>{{ sesion.username }}</td>
                <td>{{ sesion.email }}</td>
                <td>{{ sesion.ultimo_acceso }}</td>
                <td class="{% if sesion.activa %}activo{% else %}expirado{% endif %}">
                    {% if sesion.activa %}Activa{% else %}Expirada{% endif %}
                </td>
                <td>
                    <a href="/sesion/{{ sesion.id }}">Ver / Editar</a>
                </td>
            </tr>
            {% else %}
            <tr><td colspan="6">No hay sesiones activas</td></tr>
            {% endfor %}
        </tbody>
    </table>
</body>
</html>
'''

# Plantilla para detalle de una sesión
HTML_DETALLE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Detalle de Sesión</title>
    <style>
        body { font-family: Arial; margin: 40px; }
        input, button { padding: 8px; margin: 5px; }
        .datos { background: #f9f9f9; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Detalle de Sesión</h1>
    <div class="datos">
        <p><strong>ID de Sesión:</strong> {{ sesion.id }}</p>
        <p><strong>Usuario:</strong> {{ sesion.username }}</p>
        <p><strong>Email:</strong> {{ sesion.email }}</p>
        <p><strong>Último Acceso:</strong> {{ sesion.ultimo_acceso }}</p>
        <p><strong>TTL restante:</strong> {{ ttl }} segundos</p>
    </div>
    
    <h2>Actualizar Sesión</h2>
    <form method="POST" action="/actualizar/{{ sesion.id }}">
        <label>Nuevo nombre de usuario:</label><br>
        <input type="text" name="username" value="{{ sesion.username }}"><br>
        <label>Nuevo email:</label><br>
        <input type="email" name="email" value="{{ sesion.email }}"><br>
        <button type="submit">Actualizar</button>
    </form>
    
    <form method="POST" action="/eliminar/{{ sesion.id }}" style="margin-top:20px;">
        <button type="submit" style="background-color: #f44336; color: white;">Cerrar Sesión (Eliminar)</button>
    </form>
    
    <br>
    <a href="/">Volver al listado</a>
</body>
</html>
'''

def generar_id_sesion():
    return str(uuid.uuid4())

def obtener_sesiones_activas():
    claves = db.keys('session:*')
    sesiones = []
    for clave in claves:
        session_id = clave.split(':')[1]
        if db.exists(clave):
            datos = db.hgetall(clave)
            ttl = db.ttl(clave)
            activa = ttl > 0
            sesiones.append({
                'id': session_id,
                'username': datos.get('username', ''),
                'email': datos.get('email', ''),
                'ultimo_acceso': datos.get('ultimo_acceso', ''),
                'activa': activa
            })
    return sesiones

@app.route('/')
def index():
    sesiones = obtener_sesiones_activas()
    return render_template_string(HTML_INDEX, sesiones=sesiones)

@app.route('/crear', methods=['POST'])
def crear_sesion():
    username = request.form.get('username')
    email = request.form.get('email')
    if not username or not email:
        return redirect('/')
    
    session_id = generar_id_sesion()
    clave_sesion = f"session:{session_id}"
    
    db.hset(clave_sesion, mapping={
        'user_id': session_id[:8],
        'username': username,
        'email': email,
        'ultimo_acceso': datetime.datetime.now().isoformat()
    })
    db.expire(clave_sesion, TTL_SESION)
    
    return redirect('/')

@app.route('/sesion/<session_id>')
def detalle_sesion(session_id):
    clave_sesion = f"session:{session_id}"
    if not db.exists(clave_sesion):
        return "Sesión no encontrada o expirada", 404
    
    db.expire(clave_sesion, TTL_SESION)
    datos = db.hgetall(clave_sesion)
    ttl = db.ttl(clave_sesion)
    return render_template_string(HTML_DETALLE, sesion={'id': session_id, **datos}, ttl=ttl)

@app.route('/actualizar/<session_id>', methods=['POST'])
def actualizar_sesion(session_id):
    clave_sesion = f"session:{session_id}"
    if not db.exists(clave_sesion):
        return "Sesión no encontrada", 404
    
    username = request.form.get('username')
    email = request.form.get('email')
    
    if username:
        db.hset(clave_sesion, 'username', username)
    if email:
        db.hset(clave_sesion, 'email', email)
    
    db.hset(clave_sesion, 'ultimo_acceso', datetime.datetime.now().isoformat())
    db.expire(clave_sesion, TTL_SESION)
    
    return redirect(url_for('detalle_sesion', session_id=session_id))

@app.route('/eliminar/<session_id>', methods=['POST'])
def eliminar_sesion(session_id):
    clave_sesion = f"session:{session_id}"
    db.delete(clave_sesion)
    return redirect('/')

app.run(debug=True)