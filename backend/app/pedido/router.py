from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_active_user, require_role
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
from .schema import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .service import PedidoService, get_pedido_service

router = APIRouter(prefix="/api/v1/pedidos", tags=["pedidos"])


def _traducir_error(exc: Exception) -> HTTPException:
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, PedidoAjeno):
        return HTTPException(status_code=403, detail=str(exc))
    return HTTPException(status_code=400, detail=str(exc))


ERRORES_DE_DOMINIO = (
    PedidoAjeno,
    PedidoNoEncontrado,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    data: PedidoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear(data, current_user.id)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.get("/resumen", response_model=ResumenPedidos)
def obtener_resumen(
    _: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.resumen()


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: EstadoPedido | None = None,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar(current_user, skip, limit, estado)


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, current_user)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: int,
    data: CambioEstado,
    current_user: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data, current_user)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, current_user)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc