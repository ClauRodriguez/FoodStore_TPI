from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)


def create_db_and_tables() -> None:
    from app.categoria.model import Categoria  
    from app.modules.usuarios.model import Usuario  
    from app.producto.model import Producto 
    from app.pedido.model import DetallePedido, Pedido 

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
