# GESPA Frontend

Frontend React + Vite para GESPA.

## Requisitos
- Node 20+
- Backend GESPA operativo en `http://localhost:8083`

## Configuración inicial
1. Ir a la carpeta del frontend.
2. Instalar dependencias.
3. Crear archivo de entorno.

```bash
cd frontend/gespa_frontend
npm install
cp .env.example .env
```

## Variables de entorno
En `.env`:

```env
VITE_API_BASE_URL=http://localhost:8083
```

## Cómo iniciar el frontend

```bash
cd frontend/gespa_frontend
npm run dev
```

- URL local esperada: `http://localhost:5173`

## Cómo cerrar la ejecución

### Cerrar servidor de desarrollo
- En la terminal donde corre `npm run dev`, presionar `Ctrl + C`.

### Si el puerto queda ocupado
- Identificar proceso:

```bash
lsof -i :5173
```

- Cerrar proceso por PID:

```bash
kill -9 <PID>
```

## Estado actual (hecho)
- Estructura base React + Vite creada y funcionando.
- Cliente API centralizado con JWT y refresh token.
- Flujo de login profesional/paciente integrado.
- Topbar simplificada (logo, usuario, cerrar sesión).
- Navegación por pantallas internas (sin sidebar).
- Dashboard profesional funcional.
- Perfil profesional enfocado en edición del propio perfil.
- Vista Pacientes:
	- Listado automático.
	- Búsqueda por nombre/RUT.
	- Botón “Crear paciente”.
- Creación de paciente:
	- Sin ingreso de contraseña por profesional.
	- Campo teléfono con prefijo `+569`.
- Ficha de paciente por pestañas funcionales:
	- Datos generales (editable).
	- Antecedentes.
	- Notas clínicas.
	- Evolución (registro e historial con labels clínicos).

## Pendiente / por mejorar
- Definir y documentar flujo real de “primer acceso paciente” para creación/cambio de contraseña.
- Restringir por rol de forma explícita en frontend (vistas/acciones de administrador).
- Mejorar textos finales UX para producción (microcopys, validaciones y mensajes).
- Agregar tests (unitarios/integración) para pantallas críticas.
- Validar backend real activo (actualmente hubo sesiones donde respondió un backend mock en 8083).

## Endpoints consumidos
- `/api/health`
- `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`
- `/api/profesionales` (POST, GET, GET by id, PUT)
- `/api/dashboard/profesional/{id}`
- `/api/pacientes` (POST, GET paginado, GET by id, PUT)
- `/api/citas` (POST, GET por profesional/rango, PATCH estado)
- `/api/pacientes/{id}/notas` (POST, GET)
- `/api/pacientes/{id}/antecedentes` (GET, PUT)

## Verificación rápida

```bash
cd frontend/gespa_frontend
npm run build
```

Si el build termina con `✓ built`, el frontend está compilando correctamente.
