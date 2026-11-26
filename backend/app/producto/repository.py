from sqlmodel import Session, func, select

from app.core.repository import Repository
from app.pedido.model import DetallePedido

from .model import Producto


class ProductoRepository(Repository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_by_id(self, entity_id: int) -> Producto | None:
        statement = select(Producto).where(
            Producto.id == entity_id,
            Producto.activo.is_(True),
        )
        return self.session.exec(statement).first()

    def get_any_by_id(self, entity_id: int) -> Producto | None:
        return self.session.get(Producto, entity_id)

    def list_paginated(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        conditions = [Producto.activo.is_(True)]

        if search and search.strip():
            conditions.append(
                func.lower(Producto.nombre).contains(search.strip().lower())
            )
        if categoria_id is not None:
            conditions.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            conditions.append(Producto.disponible == disponible)

        count_statement = (
            select(func.count())
            .select_from(Producto)
            .where(*conditions)
        )
        total = self.session.exec(count_statement).one()

        statement = (
            select(Producto)
            .where(*conditions)
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(statement).all())
        return total, items

    def has_pedidos(self, producto_id: int) -> bool:
        statement = select(DetallePedido).where(
            DetallePedido.producto_id == producto_id
        )
        return self.session.exec(statement).first() is not None