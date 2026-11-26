
from sqlmodel import Field, Relationship, SQLModel

from app.categoria.model import Categoria


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categorias.id", index=True)
    nombre: str = Field(max_length=150)
    descripcion: str | None = Field(default=None)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: Categoria = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")