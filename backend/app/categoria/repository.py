from sqlmodel import Session, func, select

from app.core.repository import Repository
from app.producto.model import Producto

from .model import Categoria


class CategoriaRepository(Repository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_id(self, entity_id: int) -> Categoria | None:
        statement = select(Categoria).where(
            Categoria.id == entity_id,
            Categoria.activo.is_(True),
        )
        return self.session.exec(statement).first()

    def get_any_by_id(self, entity_id: int) -> Categoria | None:
        return self.session.get(Categoria, entity_id)

    def list_ordered(self) -> list[Categoria]:
        statement = (
            select(Categoria)
            .where(Categoria.activo.is_(True))
            .order_by(Categoria.id)
        )
        return list(self.session.exec(statement).all())

    def list_all_ordered(self) -> list[Categoria]:
        statement = select(Categoria).order_by(Categoria.id)
        return list(self.session.exec(statement).all())

    def find_by_normalized_name(self, nombre: str) -> Categoria | None:
        statement = select(Categoria).where(
            func.lower(func.trim(Categoria.nombre)) == nombre.strip().lower()
        )
        return self.session.exec(statement).first()

    def has_products(self, categoria_id: int) -> bool:
        statement = select(Producto).where(Producto.categoria_id == categoria_id)
        return self.session.exec(statement).first() is not None