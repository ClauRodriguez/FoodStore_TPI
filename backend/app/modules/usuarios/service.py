from fastapi import HTTPException

from app.core.security import hash_password, verify_password

from .model import Usuario
from .schema import AdminUserPublic, UserCreate, UserPublic
from .unit_of_work import UsuarioUnitOfWork


def _public(usuario: Usuario) -> UserPublic:
    return UserPublic.model_validate(usuario)


class UsuarioService:
    def registrar(self, data: UserCreate) -> UserPublic:
        with UsuarioUnitOfWork() as uow:
            username = data.username.strip()
            email = str(data.email).strip().lower()

            if uow.usuarios.find_by_username(username) is not None:
                raise HTTPException(status_code=409, detail="El nombre de usuario ya existe")
            if uow.usuarios.find_by_email(email) is not None:
                raise HTTPException(status_code=409, detail="El email ya está registrado")

            usuario = Usuario(
                username=username,
                full_name=data.full_name.strip(),
                email=email,
                hashed_password=hash_password(data.password),
                role="user",
            )
            return _public(uow.usuarios.create(usuario))

    def autenticar(self, username: str, password: str) -> UserPublic:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.find_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
            if usuario.disabled:
                raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
            return _public(usuario)

    def obtener_publico(self, user_id: int) -> UserPublic:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_active(user_id)
            if usuario is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            return _public(usuario)

    def listar_admin(self) -> list[AdminUserPublic]:
        with UsuarioUnitOfWork() as uow:
            return [
                AdminUserPublic.model_validate(usuario)
                for usuario in uow.usuarios.list_all_ordered()
            ]

    def desactivar(self, user_id: int, acting_user_id: int) -> AdminUserPublic:
        if user_id == acting_user_id:
            raise HTTPException(status_code=400, detail="No puede desactivar su propia cuenta")

        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_any(user_id)
            if usuario is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            usuario.disabled = True
            uow.session.add(usuario)
            uow.session.flush()
            return AdminUserPublic.model_validate(usuario)

    def activar(self, user_id: int) -> AdminUserPublic:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_any(user_id)
            if usuario is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            usuario.disabled = False
            uow.session.add(usuario)
            uow.session.flush()
            return AdminUserPublic.model_validate(usuario)