"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint
from api.models import db, Cliente, Ticket, Comentario
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime
from sqlalchemy.exc import IntegrityError

api = Blueprint('api', __name__)
CORS(api)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    return jsonify({
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }), 200

@api.route('/clientes', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.all()
    return jsonify([c.serialize() for c in clientes]), 200


@api.route('/clientes', methods=['POST'])
def create_cliente():
    body = request.get_json(silent=True) or {}
    required = ["direccion", "telefono", "nombre", "apellido", "email", "contraseña_hash"]
    missing = [k for k in required if not body.get(k)]
    if missing:
        return jsonify({"message": f"Faltan campos: {', '.join(missing)}"}), 400
    try:
        cliente = Cliente(**{k: body[k] for k in required})
        db.session.add(cliente)
        db.session.commit()
        return jsonify(cliente.serialize()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Email ya existe"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error inesperado: {str(e)}"}), 500

@api.route('/clientes/<int:id>', methods=['GET'])
def get_cliente(id):
    cliente = db.session.get(Cliente, id)
    if not cliente:
        return jsonify({"message": "Cliente no encontrado"}), 404
    return jsonify(cliente.serialize()), 200

@api.route('/clientes/<int:id>', methods=['PUT'])
def update_cliente(id):
    body = request.get_json(silent=True) or {}
    cliente = db.session.get(Cliente, id)
    if not cliente:
        return jsonify({"message": "Cliente no encontrado"}), 404
    try:
        for field in ["direccion", "telefono", "nombre", "apellido", "email", "contraseña_hash"]:
            if field in body:
                setattr(cliente, field, body[field])
        db.session.commit()
        return jsonify(cliente.serialize()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Email duplicado"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error inesperado: {str(e)}"}), 500

@api.route('/clientes/<int:id>', methods=['DELETE'])
def delete_cliente(id):
    cliente = db.session.get(Cliente, id)
    if not cliente:
        return jsonify({"message": "Cliente no encontrado"}), 404
    try:
        db.session.delete(cliente)
        db.session.commit()
        return jsonify({"message": "Cliente eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al eliminar: {str(e)}"}), 500

@api.route('/clientes/<int:id>/comentario', methods=['POST'])
def comentar_cliente(id):
    body = request.get_json(silent=True) or {}
    texto = body.get("texto")
    if not texto:
        return jsonify({"message": "Comentario vacío"}), 400
    try:
        comentario = Comentario(id_cliente=id, texto=texto)
        db.session.add(comentario)
        db.session.commit()
        return jsonify(comentario.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al comentar: {str(e)}"}), 500

@api.route('/clientes/<int:id>/ticket', methods=['POST'])
def crear_ticket(id):
    body = request.get_json(silent=True) or {}
    required = ["titulo", "descripcion"]
    missing = [k for k in required if not body.get(k)]
    if missing:
        return jsonify({"message": f"Faltan campos: {', '.join(missing)}"}), 400
    try:
        ticket = Ticket(
            id_cliente=id,
            titulo=body["titulo"],
            descripcion=body["descripcion"],
            prioridad=body.get("prioridad", "Media")
        )
        db.session.add(ticket)
        db.session.commit()
        return jsonify(ticket.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al crear ticket: {str(e)}"}), 500

@api.route('/clientes/<int:id>/tickets', methods=['GET'])
def listar_tickets(id):
    try:
        tickets = Ticket.query.filter_by(id_cliente=id).all()
        return jsonify([t.serialize() for t in tickets]), 200
    except Exception as e:
        return jsonify({"message": f"Error al listar tickets: {str(e)}"}), 500

@api.route('/clientes/<int:id>/ticket/<int:ticket_id>', methods=['GET'])
def obtener_ticket(id, ticket_id):
    ticket = Ticket.query.filter_by(id=ticket_id, id_cliente=id).first()
    if not ticket:
        return jsonify({"message": "Ticket no encontrado"}), 404
    return jsonify(ticket.serialize()), 200

@api.route('/clientes/<int:id>/ticket/<int:ticket_id>/close', methods=['PUT'])
def cerrar_ticket(id, ticket_id):
    body = request.get_json(silent=True) or {}
    ticket = Ticket.query.filter_by(id=ticket_id, id_cliente=id).first()
    if not ticket:
        return jsonify({"message": "Ticket no encontrado"}), 404
    try:
        ticket.estado = "Cerrado"
        ticket.calificacion = body.get("calificacion")
        ticket.comentario = body.get("comentario")
        ticket.fecha_evaluacion = datetime.utcnow()
        db.session.commit()
        return jsonify(ticket.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al cerrar ticket: {str(e)}"}), 500

@api.route('/clientes/<int:id>/ticket/<int:ticket_id>/reopen', methods=['PUT'])
def reabrir_ticket(id, ticket_id):
    ticket = Ticket.query.filter_by(id=ticket_id, id_cliente=id).first()
    if not ticket:
        return jsonify({"message": "Ticket no encontrado"}), 404
    try:
        ticket.estado = "Reabierto"
        db.session.commit()
        return jsonify(ticket.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al reabrir ticket: {str(e)}"}), 500

@api.route('/tickets', methods=['GET'])
def listar_todos_tickets():
    tickets = Ticket.query.all()
    return jsonify([t.serialize() for t in tickets]), 200