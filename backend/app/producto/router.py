from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.security import require_role

from .exceptions import (
    CategoriaNoEncontrada,
    CampoProductoNulo,
    ProductoNoEncontrado,
)
from .schema import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from .service import ProductoService, get_producto_service

router = APIRouter(prefix="/api/v1/productos", tags=["productos"])

ERRORES_DE_DOMINIO = (
    CategoriaNoEncontrada,
    CampoProductoNulo,
    ProductoNoEncontrado,
)


def _traducir_error(exc: Exception) -> HTTPException:
    if isinstance(exc, (CategoriaNoEncontrada, ProductoNoEncontrado)):
        return HTTPException(status_code=404, detail=str(exc))
    return HTTPException(status_code=422, detail=str(exc))


@router.get("", response_model=ProductosPaginados)
def listar(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = Query(default=None, gt=0),
    disponible: bool | None = None,
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    try:
        return service.listar(skip, limit, search, categoria_id, disponible)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.crear(data)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_stock_endpoint(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
) -> Response:
    try:
        service.eliminar(producto_id)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)