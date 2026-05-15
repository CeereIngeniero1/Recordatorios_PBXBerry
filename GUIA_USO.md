# Guia de uso - API Datos WPP

## 1) Requisitos

- Node.js 18+ recomendado
- pnpm instalado
- Acceso a SQL Server

## 2) Configuracion

Crear o completar el archivo `.env` en la raiz del proyecto:

```env
PORT=3000
# o BACK_PORT=3000

DB_SERVER=TU_SERVIDOR\SQLEXPRESS
DB_DATABASE=TU_BASE_DE_DATOS
DB_USER=TU_USUARIO
DB_PASSWORD=TU_PASSWORD
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true

JWT_SECRET=CAMBIA_ESTE_SECRETO
JWT_EXPIRES_IN=8h
```

Notas:
- El puerto se toma en este orden: `PORT`, luego `BACK_PORT`, luego `3000`.
- Para login, el usuario debe tener `Id Estado = 7` en la tabla `Contraseña`.

## 3) Arranque del proyecto

```bash
pnpm install
pnpm run start:dev
```

Base URL local:

`http://localhost:3000`

## 4) Autenticacion JWT

### Login

**POST** `/auth/login`

Body JSON:

```json
{
  "username": "USUARIO_SQL",
  "password": "CLAVE_SQL"
}
```

Respuesta esperada:

```json
{
  "access_token": "jwt...",
  "user": {
    "sub": 123,
    "username": "USUARIO_SQL",
    "documentoEntidad": "....",
    "idNivel": 1,
    "idEstado": 7
  }
}
```

## 5) Recursos de citas

Todos estos endpoints requieren header:

`Authorization: Bearer <access_token>`

### Confirmacion de citas

**POST** `/citas/confirmacion`

Body JSON:

```json
{
  "fechaIni": "2026-04-01",
  "fechaFin": "2026-04-30"
}
```

Respuesta esperada:

```json
[
  {
    "phone": "573001112233",
    "contacname": "NOMBRE PACIENTE",
    "consecutivo": 12345,
    "appointment_date": "2026-04-25 14:30",
    "vlrcopago": 0,
    "responsible_name": "NOMBRE PACIENTE",
    "specialty_name": "Odontologia",
    "address": "Direccion del paciente",
    "send_type": "w"
  }
]
```

### Cancelacion de citas

**POST** `/citas/cancelacion`

Body JSON:

```json
{
  "fechaIni": "2026-04-01",
  "fechaFin": "2026-04-30"
}
```

Respuesta esperada:

```json
[
  {
    "phone": "573009998877",
    "contacname": "NOMBRE PACIENTE",
    "consecutivo": 12346,
    "appointment_date": "2026-04-26 16:00",
    "vlrcopago": 0,
    "responsible_name": "NOMBRE PACIENTE",
    "specialty_name": "Odontologia",
    "address": "Direccion del paciente",
    "send_type": "w"
  }
]
```

### Actualizar estado chatbot de una cita

**PATCH** `/citas/estado-chatbot`

Actualiza el campo `[Id Estado Chatbot]` en `CompromisoVI` para marcar la cita como pendiente, confirmada o cancelada.

Body JSON:

```json
{
  "consecutivo": 12345,
  "estado": "confirmada"
}
```

Valores permitidos para `estado`:

| estado      | Id Estado Chatbot |
| ----------- | ----------------- |
| `pendiente` | 1                 |
| `confirmada`| 2                 |
| `cancelada` | 3                 |

Respuesta esperada:

```json
{
  "consecutivo": 12345,
  "estado": "confirmada",
  "idEstadoChatbot": 2
}
```

Errores:

- `400` si `estado` no es valido o el body esta incompleto.
- `404` si no existe el `consecutivo`.
- `500` si falla la actualizacion en base de datos.

Ejemplo (cURL):

```bash
curl --location --request PATCH "http://localhost:3000/citas/estado-chatbot" \
--header "Authorization: Bearer TU_TOKEN" \
--header "Content-Type: application/json" \
--data "{ \"consecutivo\": 12345, \"estado\": \"confirmada\" }"
```

## 6) Filtros por fecha

Ambos endpoints (`confirmacion` y `cancelacion`) aceptan filtros opcionales en el body JSON:

- `fechaIni` (YYYY-MM-DD)
- `fechaFin` (YYYY-MM-DD)

Ejemplos:

- `POST /citas/confirmacion` con `{ "fechaIni": "2026-04-01", "fechaFin": "2026-04-30" }`
- `POST /citas/cancelacion` con `{ "fechaIni": "2026-04-15" }`

Ejemplo (Postman/cURL con body):

```bash
curl --location "http://localhost:3000/citas/confirmacion" \
--header "Authorization: Bearer TU_TOKEN" \
--header "Content-Type: application/json" \
--data "{ \"fechaIni\": \"2026-04-01\", \"fechaFin\": \"2026-04-30\" }"
```

Reglas:
- Si no envias filtros, retorna todos los registros.
- Si envias fechas, el filtro aplica sobre `appointment_date`.
- `appointment_date` siempre se entrega con formato fijo `YYYY-MM-DD HH:mm`.
- La respuesta de citas siempre incluye solo estas columnas: `phone`, `contacname`, `consecutivo`, `appointment_date`, `vlrcopago`, `responsible_name`, `specialty_name`, `address`, `send_type`.
- Si el formato no es `YYYY-MM-DD`, retorna `400 Bad Request`.

## 7) Consultas SQL usadas

- Vista confirmacion: `[dbo].[Cnsta Confirmación de Citas]`
- Vista cancelacion: `[dbo].[Cnsta Cancelacion de Citas]`
- Usuarios login JWT: `[dbo].[Contraseña]`
- Estado chatbot: tabla `[Estado Chatbot]`; columna en citas: `CompromisoVI.[Id Estado Chatbot]`
- Actualizacion de estado: `UPDATE dbo.CompromisoVI SET [Id Estado Chatbot] = ... WHERE [Id CompromisoVI] = ...`

