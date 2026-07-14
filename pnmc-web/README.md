# PNMC Web

Frontend oficial del PNMC construido con Angular 21, componentes standalone, Signals, Router, HttpClient, Tailwind CSS y Leaflet.

## Desarrollo

```bash
npm install
npm start
```

La aplicación queda disponible en `http://127.0.0.1:4200` y consume la API local en `http://localhost:8080`.

## Verificación

```bash
npm test
npm run build
```

En producción, las llamadas usan rutas relativas contra el mismo origen. El servidor debe redirigir `/api` al backend y devolver `index.html` para las rutas del SPA.
