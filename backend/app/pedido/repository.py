from datetime import datetime

from sqlmodel import Session, func, select

from app.core.repository import Repository

from .model import DetallePedido, Pedido


class PedidoRepository(Repository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        usuario_id: int,
        skip: int,
        limit: int,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        conditions = [Pedido.usuario_id == usuario_id]
        if estado is not None:
            conditions.append(Pedido.estado == estado)

        count_statement = (
            select(func.count())
            .select_from(Pedido)
            .where(*conditions)
        )
        total = self.session.exec(count_statement).one()

        statement = (
            select(Pedido)
            .where(*conditions)
            .order_by(Pedido.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())

    def list_all(
        self,
        skip: int,
        limit: int,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        conditions = []
        if estado is not None:
            conditions.append(Pedido.estado == estado)

        count_statement = (
            select(func.count())
            .select_from(Pedido)
            .where(*conditions)
        )
        total = self.session.exec(count_statement).one()

        statement = (
            select(Pedido)
            .where(*conditions)
            .order_by(Pedido.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())

    def count_by_estado(self, estado: str) -> int:
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.estado == estado)
        )
        return self.session.exec(statement).one()

    def count_created_between(self, start: datetime, end: datetime) -> int:
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= start, Pedido.created_at < end)
        )
        return self.session.exec(statement).one()

    def sum_total_by_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(
            Pedido.estado == estado
        )
        return float(self.session.exec(statement).one())


class DetallePedidoRepository(Repository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)

    def list_by_pedido(self, pedido_id: int) -> list[DetallePedido]:
        statement = (
            select(DetallePedido)
            .where(DetallePedido.pedido_id == pedido_id)
            .order_by(DetallePedido.id)
        )
        return list(self.session.exec(statement).all())  