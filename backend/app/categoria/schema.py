from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import SQLModel

NombreCategoria = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2, max_length=100),
]


class CategoriaBase(SQLModel):
    nombre: NombreCategoria
    descripcion: str | None = None


class CategoriaCreate(CategoriaBase):
    activo: bool = True


class CategoriaUpdate(SQLModel):
    nombre: NombreCategoria | None = None
    descripcion: str | None = None
    activo: bool = True


class CategoriaPatch(CategoriaUpdate):
    pass


class CategoriaRead(CategoriaBase):
    id: int
    activo: bool