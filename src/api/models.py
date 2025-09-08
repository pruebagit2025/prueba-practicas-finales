from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from sqlalchemy import ForeignKey, Integer, Text, DateTime
from sqlalchemy.orm import relationship

db = SQLAlchemy()

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    

class Cliente(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    direccion: Mapped[str] = mapped_column(String(120), nullable=False)
    telefono: Mapped[str] = mapped_column(String(20), nullable=False)
    nombre: Mapped[str] = mapped_column(String(50), nullable=False)
    apellido: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    contraseña_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    tickets = relationship("Ticket", back_populates="cliente")
    comentarios = relationship("Comentario", back_populates="cliente")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "email": self.email,
            "direccion": self.direccion,
            "telefono": self.telefono
        }


class Ticket(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    id_cliente: Mapped[int] = mapped_column(ForeignKey("cliente.id"), nullable=False)
    titulo: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    prioridad: Mapped[str] = mapped_column(String(20), nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="Creado")
    calificacion: Mapped[int] = mapped_column(Integer, nullable=True)
    comentario: Mapped[str] = mapped_column(Text, nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    fecha_evaluacion: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    cliente = relationship("Cliente", back_populates="tickets")

    def serialize(self):
        return {
            "id": self.id,
            "id_cliente": self.id_cliente,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "prioridad": self.prioridad,
            "estado": self.estado,
            "calificacion": self.calificacion,
            "comentario": self.comentario,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_evaluacion": self.fecha_evaluacion.isoformat() if self.fecha_evaluacion else None
        }

class Comentario(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    id_cliente: Mapped[int] = mapped_column(ForeignKey("cliente.id"), nullable=False)
    texto: Mapped[str] = mapped_column(Text, nullable=False)
    fecha: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    cliente = relationship("Cliente", back_populates="comentarios")

    def serialize(self):
        return {
            "id": self.id,
            "id_cliente": self.id_cliente,
            "texto": self.texto,
            "fecha": self.fecha.isoformat() if self.fecha else None
        }
