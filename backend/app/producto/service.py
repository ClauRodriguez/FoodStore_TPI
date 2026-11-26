from .exceptions import (
    CategoriaNoEncontrada,
    CampoProductoNulo,
    ProductoNoEncontrado,
)
from .model import Producto
from .schema import (
    ProductoCreate,
    ProductoPatch,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from .unit_of_work import ProductoUnitOfWork


def _public(producto: Producto) -> ProductoRead:
    return ProductoRead.model_validate(producto)


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.list_paginated(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[_public(producto) for producto in productos],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()
            return _public(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            if uow.categorias.get_by_id(data.categoria_id) is None:
                raise CategoriaNoEncontrada()

            producto = uow.productos.create(Producto(**data.model_dump()))
            return _public(producto)

    def actualizar(
        self,
        producto_id: int,
        data: ProductoUpdate | ProductoPatch,
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()

            cambios = data.model_dump(exclude_unset=True)
            for campo, valor in cambios.items():
                if valor is None and campo not in {"descripcion", "imagen_url"}:
                    raise CampoProductoNulo(campo)

            if "categoria_id" in cambios:
                if uow.categorias.get_by_id(cambios["categoria_id"]) is None:
                    raise CategoriaNoEncontrada()

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            uow.session.add(producto)
            uow.session.flush()
            return _public(producto)

    def actualizar_stock(
        self,
        producto_id: int,
        data: ProductoStockUpdate,
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()

            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.session.add(producto)
            uow.session.flush()
            return _public(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()

            producto.activo = False
            uow.session.add(producto)
            uow.session.flush()


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())
