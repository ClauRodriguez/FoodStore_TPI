import os

from dotenv import load_dotenv
from sqlmodel import Session, select

from app.core.database import create_db_and_tables, engine
from app.core.security import hash_password
from app.categoria.model import Categoria
from app.modules.usuarios.model import Usuario
from app.producto.model import Producto

load_dotenv()

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas y acompañamientos"),
    ("Pizzas", "Pizzas clásicas"),
    ("Bebidas", "Bebidas frías"),
]

PRODUCTOS = [
    ("Hamburguesa clásica", 5500, 20, "Hamburguesas"),
    ("Hamburguesa doble", 7200, 15, "Hamburguesas"),
    ("Hamburguesa vegetariana", 6100, 12, "Hamburguesas"),
    ("Pizza muzzarella", 8500, 18, "Pizzas"),
    ("Pizza napolitana", 9800, 14, "Pizzas"),
    ("Pizza fugazzeta", 10200, 10, "Pizzas"),
    ("Agua mineral", 1800, 30, "Bebidas"),
    ("Gaseosa", 2200, 25, "Bebidas"),
]


def seed() -> None:
    create_db_and_tables()

    with Session(engine) as session:
        admin_email = os.getenv(
            "SEED_ADMIN_EMAIL",
            "admin@example.com",
        ).strip().lower()
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()

        if admin is None:
            nombre = os.getenv("SEED_ADMIN_NOMBRE", "Admin")
            apellido = os.getenv("SEED_ADMIN_APELLIDO", "Food Store")
            admin = Usuario(
                username="admin",
                full_name=f"{nombre} {apellido}",
                email=admin_email,
                hashed_password=hash_password(
                    os.getenv("SEED_ADMIN_PASSWORD", "Admin1234!")
                ),
                role="admin",
            )
            session.add(admin)
        elif admin.email != admin_email:
            admin.email = admin_email
            session.add(admin)

        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if categoria is None:
                session.add(Categoria(nombre=nombre, descripcion=descripcion))

        session.flush()

        categorias = {
            categoria.nombre: categoria.id
            for categoria in session.exec(select(Categoria)).all()
        }

        for nombre, precio, stock, categoria_nombre in PRODUCTOS:
            producto = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()
            if producto is None:
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=f"{nombre}",
                        precio_base=precio,
                        imagen_url=None,
                        stock=stock,
                        disponible=True,
                        activo=True,
                        categoria_id=categorias[categoria_nombre],
                    )
                )

        session.commit()


if __name__ == "__main__":
    seed()
    print("Seed completado: administrador, categorías y productos.")