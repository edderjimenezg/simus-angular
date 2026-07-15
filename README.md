# PNMC Platform — Angular

Versión integral e independiente de la plataforma PNMC.

## Arquitectura

- `pnmc-web/`: Angular 21, Tailwind CSS, Leaflet y ExcelJS.
- `pnmc-api/`: .NET 10, Entity Framework Core y autenticación por cookie.
- `pnmc-database/`: SQL Server/Azure SQL y migraciones versionadas.
- `scripts/`: arranque, carga de base y comprobaciones locales.
- `docs/`: documentación funcional y técnica.

La única comunicación de datos del frontend ocurre mediante `pnmc-api`; la API es la responsable de autorización y persistencia.

## Arranque local

```bash
./scripts/dev-up.sh
```

Para detener el frontend, API y la base de datos Docker sin borrar sus datos:

```bash
./scripts/dev-down.sh
```

En macOS también puedes hacer doble clic en `Iniciar PNMC.command` o
`Detener PNMC.command` desde Finder. Estos accesos abren Terminal y muestran
el resultado antes de cerrarse.

O por separado:

```bash
./scripts/local-db-up.sh
./scripts/api-local.sh
cd pnmc-web
npm install
npm start
```

Servicios:

- Frontend: `http://127.0.0.1:4200`
- API y Swagger: `http://localhost:8080/swagger`
- Salud API: `http://localhost:8080/health/live`

## Validación

```bash
cd pnmc-web
npm test
npm run build

cd ../pnmc-api
dotnet test PNMC.Api.sln
```

## Configuración

En desarrollo Angular utiliza `src/environments/environment.ts`. La compilación de producción reemplaza ese archivo por `environment.production.ts` y usa rutas de API relativas. Para orígenes separados, ajuste `apiBaseUrl` durante el despliegue y configure `PNMC_CORS_ORIGINS` en la API.

Nunca publique archivos `.env` ni credenciales reales.
