# Charmaway — PAI-4 DevSecOps

[![CI](https://github.com/mjnizac/PAI-5-Charmaway/actions/workflows/ci.yml/badge.svg)](https://github.com/mjnizac/PAI-5-Charmaway/actions/workflows/ci.yml)
[![DevSecOps](https://github.com/mjnizac/PAI-5-Charmaway/actions/workflows/devsecops.yml/badge.svg)](https://github.com/mjnizac/PAI-5-Charmaway/actions/workflows/devsecops.yml)

Proyecto Django para la asignatura PAI-4. Incluye un pipeline DevSecOps completo con integración en DefectDojo.

## Mockups
Puede encontrarlos [aquí](https://marvelapp.com/prototype/agedh8d)

## Para ejecutar el proyecto:

### Base de Datos (PostgreSQL)

1. **Instalar PostgreSQL**
   - Descargar e instalar desde: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)  
   - Durante la instalación:
     - Mantener el puerto por defecto (`5432`).

2. **Abrir SQL Shell (psql) o pgAdmin**

3. **Crear base de datos `charmaway`**  
   ```bash
   psql -U postgres
   CREATE DATABASE charmaway;
   CREATE USER charmaway_user WITH PASSWORD 'charmaway_password';
   GRANT ALL PRIVILEGES ON DATABASE charmaway TO charmaway_user;
   ALTER USER charmaway_user CREATEDB;
   \c charmaway
   GRANT ALL PRIVILEGES ON SCHEMA public TO charmaway_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO charmaway_user;
   \q
   ```
   
### Proyecto
1. Crear y acceder a un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate (Linux/MacOS)
   venv\Scripts\activate (Windows)
   ```
2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Acceder a la carpeta del proyecto:
   ```bash
   cd charmaway/
   ```
4. Aplicar migraciones:
   ```bash
   python manage.py migrate
   ```
5. Aplicar seeders (datos):
   ```bash
   python seed_all.py
   ```
5. Ejecutar la aplicación:
   ```bash
   python manage.py runserver
   ```

### Stripe:   

1. Para que stripe funcione y procese los pagos es necesario tener una cuenta de stripe.

2. Después es importante acceder a nuestro dashboard de stripe para obtener tanto nuestor publishable token como nuestro private/secret token.

3. Usa el .env.example como .env.
   ```bash
   mv .env.example .env
   ```

4. Sustituye los campos requeridos con tus tokens.

5. Para obtener el webhook token, debes instalar el cli de stripe.

6. Una vez descargado y puesto en nuestro path, debemos ejecutar en una pantalla cmd.
   ```bash
   stripe listen --forward-to localhost:<PUERTO>/webhook
   ```

    Siendo PUERTO el puerto donde esté escuchando nuestra aplicación, en nuestro caso por defecto es el 8000.

7. Se mostrará este mensaje o uno similar:
  Ready! Your webhook signing secret is whsec_ABC123...
  whsec_ABC123... será el token que debe sustituirse en el .env.

8.Nuestro servicio estará escuchando y podrá probarse con una tarjeta de prueba:
  ```
    Tarjeta de prueba -> 4242 4242 4242 4242 11/44 111
  ```

9. Podremos ver las llamadas que nos llegan al webhook desde el cmd donde ejecutamos nuestro comando.

10. En nuestro dashboard de Stripe aparecerán también dichos movimientos.

### Tests:
1. Para que django los detecte, los tests de cada módulo tienen que estar en un archivo llamado explícitamente 'tests.py' dentro de cada uno de los módulos correspondientes.
2. Ejecutar desde `charmaway/`:
   ```bash
   cd charmaway/
   pytest
   ```

## Pipeline DevSecOps

El pipeline se activa en cada push a `develop` o `main` y ejecuta cuatro fases de seguridad. Los resultados se suben a DefectDojo automáticamente para acumular historial.

| Fase | Herramienta | Tipo | Engagement en DefectDojo |
|------|------------|------|--------------------------|
| 1 | pip-audit | SCA — dependencias con CVE | CI – SCA |
| 2 | Bandit | SAST — código inseguro en Python/Django | CI – SAST |
| 3 | Trivy | IaC — secrets expuestos, misconfigs | CI – IaC |
| 4 | OWASP ZAP | DAST — scan dinámico contra la app en ejecución | CI – DAST |

### Secrets necesarios en GitHub

Configurar en *Settings → Secrets and variables → Actions*:

| Secret | Descripción |
|--------|-------------|
| `DEFECTDOJO_URL` | URL base de la instancia DefectDojo (ej. `http://localhost:8080`) |
| `DEFECTDOJO_API_KEY` | Token de API de DefectDojo |

Si los secrets no están configurados, los pasos de subida a DefectDojo se omiten automáticamente (los scans igualmente se ejecutan y quedan como artefactos).

### CodeRabbit

Las PRs hacia `develop` y `main` reciben revisión automática por CodeRabbit. Requiere instalar la [GitHub App de CodeRabbit](https://github.com/apps/coderabbit-ai) en el repositorio. La configuración está en `.coderabbit.yaml`.

## Sincronización Automática: DefectDojo a GitHub Issues

Hemos configurado un script (`sync_issues.py`) que lee las vulnerabilidades detectadas en nuestro entorno local de DefectDojo y crea automáticamente Issues en este repositorio de GitHub para que el equipo de desarrollo pueda solucionarlas.

### 1. Preparación del entorno
Antes de ejecutar el script por primera vez, necesitas instalar las librerías de Python encargadas de las peticiones web y la gestión de variables de entorno:

```bash
pip install requests python-dotenv
```

### 2. Obtención de Credenciales (API Keys)

Por motivos de seguridad, las contraseñas nunca deben estar escritas directamente en el código. Cada miembro del equipo debe generar sus propios tokens de acceso:

### A. DefectDojo API Key
1. Inicia sesión en tu instancia local de DefectDojo (`http://localhost:8080`).
2. Haz clic en el icono de tu perfil (esquina superior derecha).
3. Selecciona **API v2 Key**.
4. Copia el token alfanumérico.

### B. GitHub Personal Access Token (Classic)
1. Ve a tu cuenta de GitHub -> **Settings**.
2. En el menú lateral izquierdo, ve al final a **Developer settings**.
3. Selecciona **Personal access tokens** -> **Tokens (classic)**.
4. Haz clic en **Generate new token (classic)**.
5. Define un nombre (ej. "DefectDojo-Sync") y selecciona únicamente el permiso `repo`.
6. Genera el token y cópialo. (*Nota: No podrás volver a verlo una vez cierres la página*).

### 3. Configuración del archivo secreto (`.env`)

Para que el script funcione, debes crear un archivo a partir del archivo `.env.example` llamado exactamente `.env` en la raíz del proyecto. Este archivo servirá para almacenar tus claves locales sin que se suban al repositorio, copielas en sus respectivos lugares.

> [!IMPORTANT]
> El archivo `.env` ya está incluido en el `.gitignore`. Nunca fuerces su subida al repositorio, ya que expondrías tus claves privadas.

### 4. Ejecución del script

Una vez hayas importado nuevos escaneos a DefectDojo y quieras sincronizarlos con GitHub, simplemente ejecuta el script desde la raíz del proyecto:

```bash
python sync_issues.py
```

### ¿Qué hace el script exactamente?
1. Filtra: Busca vulnerabilidades activas que no sean duplicadas.
2. Evita spam: Comprueba si la vulnerabilidad ya tiene la etiqueta `enviado-a-github` para no crear Issues repetidas.
3. Crea: Genera una Issue en GitHub con el título, severidad, descripción y archivo afectado.
4. Etiqueta: Tras crear la Issue con éxito, añade el tag `enviado-a-github` en DefectDojo mediante un `PATCH` para marcarla como sincronizada.