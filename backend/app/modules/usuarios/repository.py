from sqlmodel import Session, select

from app.core.repository import Repository

from .model import Usuario


class UsuarioRepository(Repository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_any(self, user_id: int) -> Usuario | None:
        return self.session.get(Usuario, user_id)

    def get_active(self, user_id: int) -> Usuario | None:
        statement = select(Usuario).where(
            Usuario.id == user_id,
            Usuario.disabled.is_(False),
        )
        return self.session.exec(statement).first()

    def find_by_username(self, username: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.username == username.strip())
        return self.session.exec(statement).first()

    def find_by_email(self, email: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.email == email.strip().lower())
        return self.session.exec(statement).first()

    def list_all_ordered(self) -> list[Usuario]:
        statement = select(Usuario).order_by(Usuario.id)
        return list(self.session.exec(statement).all())