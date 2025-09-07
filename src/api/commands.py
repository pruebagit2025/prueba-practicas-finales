import click
from api.models import db, User, Cliente, Ticket, Comentario
from datetime import datetime

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator.
Flask commands are useful to run cronjobs or tasks outside of the API but still in integration
with your database, for example: Import the price of bitcoin every night at 12am.
"""
def setup_commands(app):

    @app.cli.command("insert-test-users")
    @click.argument("count")
    def insert_test_users(count):
        with app.app_context():
            print("Creating test users")
            for x in range(1, int(count) + 1):
                user = User()
                user.email = f"test_user{x}@test.com"
                user.password = "123456"
                user.is_active = True
                db.session.add(user)
                db.session.commit()
                print("User:", user.email, "created.")
            print("All test users created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        with app.app_context():
            print("Insertando clientes de prueba...")
            clientes = [
                Cliente(
                    direccion="Calle 10 #5-20",
                    telefono="3000111223",
                    nombre="Ana",
                    apellido="Pérez",
                    email="ana.perez@mail.com",
                    contraseña_hash="hashed123"
                ),
                Cliente(
                    direccion="Calle 21 #10-30",
                    telefono="3002223344",
                    nombre="Julia",
                    apellido="Torres",
                    email="julia.torres@mail.com",
                    contraseña_hash="hashed456"
                ),
                Cliente(
                    direccion="Av. Central #45-12",
                    telefono="3003334455",
                    nombre="Andrés",
                    apellido="Mejía",
                    email="andres.mejia@mail.com",
                    contraseña_hash="hashed789"
                ),
                Cliente(
                    direccion="Cra 50 #20-15",
                    telefono="3004445566",
                    nombre="Camila",
                    apellido="Ríos",
                    email="camila.rios@mail.com",
                    contraseña_hash="hashed000"
                )
            ]
            for c in clientes:
                db.session.add(c)
            db.session.commit()
            print("Clientes insertados correctamente.")

            print("Insertando ticket de prueba...")
            ticket = Ticket(
                id_cliente=1,
                titulo="Problema con internet",
                descripcion="No tengo conexión desde ayer",
                prioridad="Alta"
            )
            db.session.add(ticket)

            print("Insertando comentario de prueba...")
            comentario = Comentario(
                id_cliente=1,
                texto="Revisando el problema de conexión",
                fecha=datetime.utcnow()
            )
            db.session.add(comentario)

            db.session.commit()
            print("Tickets y comentarios insertados correctamente.")
