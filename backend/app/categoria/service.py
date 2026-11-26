from .exceptions import (
    CategoriaDuplicada,
    CategoriaNoEncontrada,
    NombreCategoriaNulo,
)
from .model import Categoria
from .schema import CategoriaCreate, CategoriaPatch, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


def _public(categoria: Categoria) -> CategoriaRead:
    return CategoriaRead.model_validate(categoria)


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [_public(item) for item in uow.categorias.list_ordered()]

    def listar_admin(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [_public(item) for item in uow.categorias.list_all_ordered()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()
            return _public(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.find_by_normalized_name(data.nombre) is not None:
                raise CategoriaDuplicada()
            categoria = Categoria(**data.model_dump())
            return _public(uow.categorias.create(categoria))

    def actualizar(
        self,
        categoria_id: int,
        data: CategoriaUpdate | CategoriaPatch,
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_any_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()

            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios:
                nombre = cambios["nombre"]
                if nombre is None:
                    raise NombreCategoriaNulo()

                repetida = uow.categorias.find_by_normalized_name(nombre)
                if repetida is not None and repetida.id != categoria_id:
                    raise CategoriaDuplicada()

            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)

            uow.session.add(categoria)
            uow.session.flush()
            return _public(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_any_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()

            categoria.activo = False
            uow.session.add(categoria)
            uow.session.flush()


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())
