from datetime import datetime, timedelta, timezone

from app.modules.usuarios.model import Usuario

from .exceptions import (
    PedidoAjeno,
    PedidoNoEncontrado,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from .model import DetallePedido, Pedido
from .schema import (
    CambioEstado,
    DetallePedidoRead,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .unit_of_work import PedidoUnitOfWork


TRANSICIONES_VALIDAS = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
}


def _public(uow: PedidoUnitOfWork, pedido: Pedido) -> PedidoRead:
    items = [
        DetallePedidoRead.model_validate(item)
        for item in uow.detalles.list_by_pedido(pedido.id)
    ]
    return PedidoRead(
        id=pedido.id,
        usuario_id=pedido.usuario_id,
        estado=pedido.estado,
        forma_pago=pedido.forma_pago,
        direccion_entrega=pedido.direccion_entrega,
        notas=pedido.notas,
        total=pedido.total,
        created_at=pedido.created_at,
        updated_at=pedido.updated_at,
        items=items,
    )


def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
    for item in uow.detalles.list_by_pedido(pedido.id):
        producto = uow.productos.get_any_by_id(item.producto_id)
        if producto is None:
            raise ProductoNoEncontrado(item.producto_id)
        producto.stock += item.cantidad
        uow.session.add(producto)


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                total, pedidos = uow.pedidos.list_all(skip, limit, estado)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(
                    usuario.id,
                    skip,
                    limit,
                    estado,
                )

            return PedidosPaginados(
                total=total,
                items=[_public(uow, pedido) for pedido in pedidos],
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return _public(uow, pedido)

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        producto_ids = [item.producto_id for item in data.items]
        if len(producto_ids) != len(set(producto_ids)):
            raise ProductoRepetido()

        with self.uow as uow:
            pedido = uow.pedidos.create(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            total = 0.0

            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(item.producto_id)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(item.producto_id)

                precio = float(producto.precio_base)
                subtotal = round(precio * item.cantidad, 2)
                producto.stock -= item.cantidad
                uow.session.add(producto)
                uow.detalles.create(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=precio,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            return _public(uow, pedido)

    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(pedido.estado, "CANCELADO")

            _restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            return _public(uow, pedido)

    def cambiar_estado(
        self,
        pedido_id: int,
        data: CambioEstado,
        usuario: Usuario,
    ) -> PedidoRead:
        if usuario.role != "admin":
            raise PedidoAjeno()

        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)

            destinos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if data.estado not in destinos:
                raise TransicionInvalida(pedido.estado, data.estado)

            if data.estado == "CANCELADO":
                _restituir_stock(uow, pedido)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            return _public(uow, pedido)

    def resumen(self) -> ResumenPedidos:
        now = datetime.now(timezone.utc)
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)

        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_created_between(start_of_day, end_of_day),
                ingresos_entregados=uow.pedidos.sum_total_by_estado("ENTREGADO"),
            )


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())
