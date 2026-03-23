# Modificaciones del codigo original

Se ha preparado un video donde se explican y listan todas las modificaciónes realizadas para cumplir con el objetivo buscado. Puedes verlo en YouTube:

[![Video explicativo del proyecto](https://img.youtube.com/vi/zJ4Gy0wUzPw/0.jpg)](https://youtu.be/zJ4Gy0wUzPw)

## IA Generativa:

Con el fin de entender al máximo el funcionamiento de JWT he priorizado usar el minimo de IA Generativa posible. Limitando su uso a los dos casos contretos:

1. **Autocompletado [GitHub Copilot]**: Uso del autocompletado de Visual Studio Code con el fin de escribir mas rápido o para saber bien bien como se introduce ciertos formatos de datos (p.e. el enum dentro del modelo).
2. **Lectura de logs [ChatGPT]**: Explicaciones más detalladas y claras sobre algunos log de errores obtenidos.

El uso de IA ha sido evitado para cualquier otra situación.

## Preguntes de reflexió

Què passaria si un usuari canvia el seu rol a "admin" manualment dins del token al navegador? El servidor ho detectaria?

> Un token JWT es genera amb una signatura digital que el protegeix de qualsevol manipulació. Aquesta signatura garanteix la integritat del payload davant de qualsevol intent de modificar-ne els claims, ja que faria que la signatura associada al token JWT deixés de correspondre amb els valors continguts en el mateix payload. Per tant, el servidor podria detectar correctament qualsevol intent de frau.

Per què és millor guardar el rol al token en lloc de consultar la base de dades a cada petició a una ruta protegida?

> Com que tota la informació que necessitem viatja dins del mateix token JWT, ens podem estalviar consultes innecessàries a la base de dades. Això fa que la nostra aplicació sigui més eficient i escalable, ja que redueix la latència, la càrrega del servidor i el nombre d’accessos a la base de dades.

---

# Seminario 7 EA — JWT (Arquitectura Profesional)

¡Bienvenido al **Seminario 7 de Enginyeria d'Aplicacions (EA)**! Este proyecto demuestra una implementación avanzada y segura de autenticación mediante **JWT (JSON Web Tokens)** utilizando una arquitectura de **Access y Refresh Tokens**, ahora refactorizada siguiendo principios de diseño profesional (Separación de responsabilidades y Configuración Centralizada).

> **IMPORTANTE: Web Sockets**
> El código de **Web Sockets** se encuentra en un repositorio independiente para mantener la limpieza arquitectónica: [EA_Sem7_Socket](https://github.com/JairoLopezCarbo/EA_Sem7_Socket.git)

---

## Novedades de la Arquitectura

Tras la última revisión, el proyecto ha evolucionado para cumplir con estándares de escalabilidad:

1.  **Configuración Centralizada (`config/config.ts`)**: El acceso a variables de entorno (`process.env`) está restringido a un solo archivo. El resto de la aplicación "bebe" de un objeto de configuración tipado y seguro.
2.  **Capa de Servicios (`services/auth.ts`)**: Se ha extraído la lógica de negocio de los controladores. Los servicios gestionan la base de datos y la validación, dejando los controladores limpios para gestionar solo entradas y salidas (E/S).
3.  **Protección de Recursos Propios**: Implementación de lógica de **Autorización**. Gracias a `req.user`, el servidor ahora valida que un usuario solo pueda modificar o eliminar su propia información (Error 403 Forbidden si intenta tocar datos ajenos).
4.  **Endpoint de Identidad (`/auth/me`)**: Un nuevo punto de acceso que extrae la identidad del usuario directamente del token, evitando el envío innecesario de IDs por la URL.

---

## Estructura del Backend (Refactorizada)

```
.
├── src/
│   ├── config/config.ts       # Único punto de contacto con el .env y constantes
│   ├── services/              # Lógica pesada (Auth, Usuarios, Organizaciones)
│   ├── controllers/           # Reciben peticiones y llaman a servicios
│   ├── middleware/            # Auth Guards (inyectan datos en req.user)
│   ├── models/                # Esquemas de Mongoose + Interfaces de datos (JwtPayload)
│   ├── routes/                # Definición de rutas Express
│   ├── utils/jwt.ts           # Funciones puras de firmado y verificación tipada
│   └── server.ts              # Inicialización del servidor y conexión Mongo
└── .env                       # Secretos y tiempos de expiración
```

---

## Seguridad: Access + Refresh Token

### 1. ¿Dónde se guarda cada token?
- **Access Token (Corta duración - 15m):** Se envía en el cuerpo de la respuesta. El frontend lo usa en la cabecera `Authorization: Bearer <token>`.
- **Refresh Token (Larga duración - 7d):** Se envía en una **Cookie `httpOnly`**. 
  - **¿Por qué?** Así es invisible para el JavaScript malicioso (XSS). El navegador la envía automáticamente pero "nadie" en el cliente puede verla o robarla.

### 2. El flujo de validación segura
1. **Identificación**: El middleware de auth valida el token y guarda los datos en `req.user`.
2. **Autorización**: En las rutas de actualización/borrado, el controlador compara `req.user.id` con `req.params.id`.
3. **Control**: Si no coinciden, se devuelve un `403 Forbidden`, impidiendo que un usuario suplante a otro aunque tenga un token válido.

---

## Endpoints Principales (API)

| Método | URL | Privado | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | No | Genera Access Token y Cookie de Refresh. |
| `GET` | `/auth/me` | **Sí** | Devuelve el perfil del usuario logueado (usa `req.user`). |
| `POST` | `/auth/refresh` | No | Renueva el Access Token usando la Cookie. |
| `POST` | `/auth/logout` | No | Limpia la cookie de sesión. |
| `DELETE` | `/usuarios/:id`| **Sí** | Borrado seguro (solo el propio usuario puede borrarse). |

---

## Instalación

Asegúrate de tener un archivo `.env` configurado así:
```env
MONGO_URI="mongodb://localhost:27017/tu_bd"
SERVER_PORT=1337
JWT_ACCESS_SECRET="tu_clave_secreta"
JWT_REFRESH_SECRET="tu_otra_clave_secreta"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

1. **Backend**: `npm install` y `npm start`.
2. **Swagger**: Documentación interactiva en `http://localhost:1337/api`.
3. **Frontend (Angular)**: `cd frontend`, `npm install` y `npm start`.

---
¡Explora el código y fíjate en cómo la separación de servicios y controladores hace que todo sea más fácil de testear y mantener! 
