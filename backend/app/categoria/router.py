from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.security import require_role

from .exceptions import (
    CategoriaDuplicada,
    CategoriaNoEncontrada,
    NombreCategoriaNulo,
)
from .schema import CategoriaCreate, CategoriaPatch, CategoriaRead, CategoriaUpdate
from .service import CategoriaService, get_categoria_service

router = APIRouter(prefix="/api/v1/categorias", tags=["categorias"])

ERRORES_DE_DOMINIO = (
    CategoriaDuplicada,
    CategoriaNoEncontrada,
    NombreCategoriaNulo,
)


def _traducir_error(exc: Exception) -> HTTPException:
    if isinstance(exc, CategoriaNoEncontrada):
        return HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, CategoriaDuplicada):
        return HTTPException(status_code=409, detail=str(exc))
    return HTTPException(status_code=422, detail=str(exc))


@router.get("", response_model=list[CategoriaRead])
def listar(
    service: CategoriaService = Depends(get_categoria_service),
) -> list[CategoriaRead]:
    try:
        return service.listar()
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.get(
    "/admin",
    response_model=list[CategoriaRead],
    dependencies=[Depends(require_role(["admin"]))],
)
def listar_todas(
    service: CategoriaService = Depends(get_categoria_service),
) -> list[CategoriaRead]:
    return service.listar_admin()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.crear(data)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar(
    categoria_id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.patch(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_parcial(
    categoria_id: int,
    data: CategoriaPatch,
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
) -> Response:
    try:
        service.eliminar(categoria_id)
    except ERRORES_DE_DOMINIO as exc:
        raise _traducir_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
