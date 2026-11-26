# Food Store

Aplicación para gestionar un local gastronómico. Incluye una API REST en FastAPI, una interfaz web en React y TypeScript, y persistencia en PostgreSQL.

# Repositorio
https://github.com/ClauRodriguez/FoodStore_TPI

# VIDEO
lik al video de presentacion -> https://youtu.be/sGMAg7ciLp8

## Requisitos

- Python 3.11 o superior
- PostgreSQL 15 o superior
- Node.js y pnpm (el proyecto usa Vite 7)

## Configuración de PostgreSQL

Iniciá PostgreSQL y creá la base de datos. Por ejemplo, desde PowerShell:

```powershell
psql -U postgres -c "CREATE DATABASE foodstore_db;"
```

Si tu usuario, contraseña, host o puerto son distintos, usá esos valores al configurar `DATABASE_URL` en el siguiente paso.

## Backend

Desde la raíz del proyecto, prepará el entorno virtual y las variables:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
Copy-Item .env.example .env
```

Editá `backend/.env` y reemplazá las credenciales de ejemplo de PostgreSQL. Generá una clave para firmar los tokens con:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copiá el resultado en `SECRET_KEY`. Instalá las dependencias, cargá los datos iniciales e iniciá la API:

```powershell
pip install -r requirements.txt
python -m app.db.seed
uvicorn app.main:app --reload
```

La API estará disponible en `http://localhost:8000`. La documentación interactiva de FastAPI está en `http://localhost:8000/docs`. Al iniciar, la aplicación crea las tablas si todavía no existen; el seed carga el administrador, las categorías y los productos iniciales.

### Variables del backend

`backend/.env.example` contiene estas variables:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | URL de conexión de SQLAlchemy a PostgreSQL. El ejemplo usa `postgresql+psycopg2://postgres:CAMBIAR_PASSWORD@localhost:5432/foodstore_db`; reemplazá la contraseña por la de tu instalación. |
| `SECRET_KEY` | Clave secreta para firmar los tokens de acceso. Usá una clave aleatoria y mantenela privada. |
| `ALGORITHM` | Algoritmo de firma del token; por defecto, `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token de acceso en minutos; el ejemplo usa `30`. |
| `FRONTEND_ORIGIN` | Origen autorizado por CORS para el frontend; normalmente `http://localhost:5173`. |
| `SEED_ADMIN_EMAIL` | Email del administrador creado por el seed; por defecto, `admin@example.com`. |
| `SEED_ADMIN_PASSWORD` | Contraseña inicial del administrador; por defecto, `Admin1234!`. |
| `SEED_ADMIN_NOMBRE` | Nombre usado para el administrador; por defecto, `Admin`. |
| `SEED_ADMIN_APELLIDO` | Apellido usado para el administrador; por defecto, `Food Store`. |

El seed crea la cuenta `admin` únicamente si todavía no existe. `SEED_ADMIN_PASSWORD` establece la contraseña inicial; volver a ejecutar el seed no cambia la contraseña de una cuenta ya creada.

## Frontend

Abrí una segunda terminal desde la raíz del proyecto:

```powershell
cd frontend
Copy-Item .env.example .env
pnpm install
pnpm build
pnpm dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`. Para instalar pnpm si todavía no está disponible, podés habilitar Corepack con `corepack enable`.

### Variables del frontend

`frontend/.env.example` define `VITE_API_URL`, la URL base de la API. El valor de desarrollo es `http://localhost:8000/api/v1`; cambialo si ejecutás el backend en otra dirección. El frontend debe estar en el origen configurado en `FRONTEND_ORIGIN`.

## Credenciales iniciales

Con la configuración predeterminada del seed:

- Usuario: `admin`
- Contraseña: `Admin1234!`

