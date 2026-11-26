# Food Store — Backend

API REST con FastAPI, SQLModel y PostgreSQL. Usa JWT en cookie HttpOnly y roles `user` y `admin`.

## Requisitos

- Python 3.11–3.13
- PostgreSQL 15 o superior

## Instalación y ejecución

Desde `backend/`:

1. Crear la base de datos indicada en `DATABASE_URL`.
2. Copiar `.env.example` a `.env` y configurar `DATABASE_URL`, `SECRET_KEY` y `FRONTEND_ORIGIN`.
3. Crear y activar un entorno virtual.
4. Instalar las dependencias:

```bash
   pip install -r requirements.txt
```

5. Crear el administrador, las categorías y los productos iniciales:

   ```bash
   python -m app.db.seed
   ```

6. Iniciar la API:

   ```bash
   uvicorn app.main:app --reload
   ```

Swagger: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

## Cuenta de desarrollo

El seed crea el usuario `admin` con contraseña `Admin1234!`, salvo que `SEED_ADMIN_PASSWORD` defina otra en `.env`.

## API principal

- Autenticación: `/api/v1/auth/register`, `/api/v1/auth/token`, `/api/v1/auth/logout`, `/api/v1/auth/me`.
- Administración de usuarios: `/api/v1/admin/usuarios`.
- Catálogo público: `/api/v1/categorias` y `/api/v1/productos`.
- Pedidos: `/api/v1/pedidos`; resumen administrativo: `/api/v1/pedidos/resumen`.

Las escrituras del catálogo requieren el rol `admin`. Los clientes solo acceden a sus propios pedidos. El token no se guarda en el frontend.

No incluir `.env` en la entrega; incluir solo `.env.example`.