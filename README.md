# AEA06 · Autenticación EJS (Node/Express)

Aplicación web en **Node.js + Express** con **vistas EJS**, estáticos en `public/` y rutas separadas en `routes/`. 
Incluye utilidades para manejar usuarios (ver `user-repository.js`) y configuración centralizada (ver `config.js`).
Se ha añadido un archivo `request.http` para probar endpoints desde VS Code (extensión **REST Client**).

> **Estructura detectada**
>
> - `server.js` – Punto de entrada del servidor Express.
> - `config.js` – Configuración (puertos, claves y/o paths).
> - `user-repository.js` – Acceso a datos de usuarios (probablemente lectura/escritura en `db/`).
> - `routes/` – Definición de rutas (auth, vistas, API…).
> - `views/` – Plantillas **EJS**.
> - `public/` – Recursos estáticos (CSS/JS/imagenes).
> - `db/` – Datos locales (JSON u otros).
> - `request.http` – Colección de peticiones para pruebas rápidas.
> - `package.json` – Dependencias y scripts de npm.

## Requisitos
- Node.js 18+ (recomendado)  
- npm 9+ (o pnpm/yarn si prefieres)

## Instalación
```bash
# Clonar
git clone https://github.com/MartiVilas/MartiVilas_AEA06.git
cd MartiVilas_AEA06

# Instalar dependencias
npm install
```

## Configuración
Crea un archivo `.env` (o usa `config.js` si ya define variables) con variables típicas como:

```env
# Puerto del servidor
PORT=3000

# (Opcional) Clave para sesiones/JWT si procede
SESSION_SECRET=change_me
JWT_SECRET=change_me

# (Opcional) Rutas a ficheros de datos en /db
USERS_DB=./db/users.json
```

## Ejecución
```bash
# Modo normal
npm start

# o bien si existe un script dev con nodemon:
npm run dev
```

La app se levantará en `http://localhost:${PORT || 3000}`.

## Scripts útiles
Revisa `package.json` para confirmar los scripts. Los más comunes:
- `start`: arranca el servidor (`node server.js`).
- `dev`: arranca con recarga en caliente (p. ej. `nodemon server.js`).

## Pruebas de endpoints con request.http
Abre `request.http` en VS Code y usa la extensión **REST Client** para lanzar las peticiones.  
Ejemplo de contenido habitual:
```http
### GET Home
GET http://localhost:3000

### Login (ejemplo)
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

## Estructura de rutas y vistas
- `routes/` – agrupa endpoints (p. ej., `/`, `/login`, `/register`, etc.).  
- `views/` – plantillas EJS (layouts, páginas públicas/privadas).  
- `public/` – CSS/JS cliente e imágenes.

## Persistencia de datos
El directorio `db/` sugiere almacenamiento local (JSON/archivo).  
- Útil para prácticas/entornos locales.
- **No recomendado** en producción (migrar a una BD real si fuera necesario).

## Seguridad
- Usa `SESSION_SECRET` o `JWT_SECRET` **no** compartidas en el código.
- Asegúrate de **no** commitear `.env` ni datos sensibles.

## Licencia
Uso educativo (DAW / ITB). Añade tu licencia si corresponde.
