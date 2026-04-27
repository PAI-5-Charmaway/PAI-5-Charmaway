const fs = require("fs");
const docx = require("docx");
const {
  Document: D, Packer: P, Paragraph: Pa, TextRun: T, Table: Tb, TableRow: Tr,
  TableCell: Tc, Header, Footer, AlignmentType: AT, LevelFormat, HeadingLevel: HL,
  BorderStyle: BS, WidthType: WT, ShadingType: ST, PageNumber, PageBreak: PB,
  VerticalAlign, ImageRun,
} = docx;

const EVD = "E:/Visual Studio/PAI-5-Charmaway/docs/entrega/evidencias";
const diagram = fs.readFileSync(`${EVD}/diagrama-pipeline.png`);
const capActions = fs.readFileSync(`${EVD}/cap-actions-run.png`);
const capPr = fs.readFileSync(`${EVD}/cap-pr-57.png`);
const capIssues = fs.readFileSync(`${EVD}/cap-issues.png`);
let capDojo = null;
try { capDojo = fs.readFileSync(`${EVD}/cap-dojo.png`); } catch (e) { /* opcional */ }

const figure = (data, w, h, caption) => [
  new Pa({
    alignment: AT.CENTER,
    spacing: { before: 120, after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data,
        transformation: { width: w, height: h },
        altText: { title: caption, description: caption, name: "fig" },
      }),
    ],
  }),
  new Pa({
    alignment: AT.CENTER,
    spacing: { after: 140 },
    children: [new T({ text: caption, italics: true, size: 18, color: "808080", font: FONT })],
  }),
];

const FONT = "Calibri";
const COLOR_PRIMARY = "1F4E79";
const COLOR_TABLE_HEAD_BG = "D9E2F3";
const BORDER = { style: BS.SINGLE, size: 4, color: "BFBFBF" };
const ALL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

const h1 = (text) =>
  new Pa({
    heading: HL.HEADING_1,
    children: [new T({ text, bold: true, color: COLOR_PRIMARY, size: 30, font: FONT })],
    spacing: { before: 240, after: 140 },
  });

const h2 = (text) =>
  new Pa({
    heading: HL.HEADING_2,
    children: [new T({ text, bold: true, color: COLOR_PRIMARY, size: 24, font: FONT })],
    spacing: { before: 180, after: 100 },
  });

const p = (text) =>
  new Pa({
    children: [new T({ text, size: 20, font: FONT })],
    spacing: { after: 100 },
    alignment: AT.JUSTIFIED,
  });

const bullet = (text) =>
  new Pa({
    numbering: { reference: "bullets", level: 0 },
    children: [new T({ text, size: 20, font: FONT })],
    spacing: { after: 40 },
  });

const code = (text) =>
  new Pa({
    children: [new T({ text, size: 18, font: "Consolas" })],
    shading: { fill: "F2F2F2", type: ST.CLEAR },
    spacing: { after: 100 },
  });

const cell = (text, opts = {}) =>
  new Tc({
    borders: ALL_BORDERS,
    width: { size: opts.width, type: WT.DXA },
    shading: opts.head ? { fill: COLOR_TABLE_HEAD_BG, type: ST.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Pa({
        children: [new T({ text, size: 18, font: FONT, bold: !!opts.head })],
        alignment: opts.center ? AT.CENTER : AT.LEFT,
      }),
    ],
  });

const cellRich = (runs, opts = {}) =>
  new Tc({
    borders: ALL_BORDERS,
    width: { size: opts.width, type: WT.DXA },
    shading: opts.head ? { fill: COLOR_TABLE_HEAD_BG, type: ST.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Pa({
        children: runs.map((r) =>
          typeof r === "string"
            ? new T({ text: r, size: 18, font: FONT })
            : new T({ size: 18, font: FONT, ...r })
        ),
        alignment: opts.center ? AT.CENTER : AT.LEFT,
      }),
    ],
  });

const buildTable = (widths, header, rows) => {
  const total = widths.reduce((a, b) => a + b, 0);
  return new Tb({
    width: { size: total, type: WT.DXA },
    columnWidths: widths,
    rows: [
      new Tr({
        tableHeader: true,
        children: header.map((h, i) =>
          cell(h, { width: widths[i], head: true, center: true })
        ),
      }),
      ...rows.map(
        (r) =>
          new Tr({
            children: r.map((c, i) =>
              Array.isArray(c)
                ? cellRich(c, { width: widths[i] })
                : cell(c, { width: widths[i] })
            ),
          })
      ),
    ],
  });
};

// ===== PORTADA =====

const cover = [
  new Pa({
    children: [
      new T({
        text: "Práctica PAI-4",
        size: 28,
        color: "808080",
        font: FONT,
      }),
    ],
    alignment: AT.CENTER,
    spacing: { before: 1400, after: 100 },
  }),
  new Pa({
    children: [
      new T({
        text: "Informe Técnico — Pipeline DevSecOps",
        bold: true,
        size: 44,
        color: COLOR_PRIMARY,
        font: FONT,
      }),
    ],
    alignment: AT.CENTER,
    spacing: { after: 160 },
  }),
  new Pa({
    children: [
      new T({
        text: "Proyecto Charmaway",
        size: 32,
        color: "404040",
        font: FONT,
      }),
    ],
    alignment: AT.CENTER,
    spacing: { after: 1000 },
  }),
  buildTable(
    [3000, 6000],
    ["Campo", "Valor"],
    [
      ["Asignatura", "Programación y Administración de Internet (PAI)"],
      ["Profesor", "Ángel Jesús Varela Vaca"],
      ["Grupo", "Security Team 5"],
      ["Integrantes", "Andrés Ponga González\nJosé Egido Carnerero\nManuel Jesús Niza Cobo"],
      ["Repositorio", "github.com/PAI-5-Charmaway/PAI-5-Charmaway"],
      ["Fecha de entrega", "27 de abril de 2026"],
    ]
  ),
  new Pa({ children: [new PB()] }),
];

// ===== 1. INFORME TÉCNICO =====

const seccion1 = [
  h1("1. Informe técnico"),

  h2("1.1 Contexto y alcance"),
  p(
    "Charmaway es una aplicación e-commerce desarrollada en Django 5.2 con persistencia en PostgreSQL, integración de pagos Stripe, envío de correo vía Mailjet y despliegue en Render. El alcance de la práctica PAI-4 consiste en dotar a su ciclo de integración continua de capacidades DevSecOps mediante la integración de herramientas de testeo de seguridad en cada fase del pipeline y la centralización de las vulnerabilidades detectadas en una plataforma de gestión, completando un ciclo trazable detección → ticketing → corrección → verificación."
  ),

  h2("1.2 Pipeline CI/CD"),
  new Pa({
    alignment: AT.CENTER,
    spacing: { before: 80, after: 120 },
    children: [
      new ImageRun({
        type: "png",
        data: diagram,
        transformation: { width: 540, height: 290 },
        altText: { title: "Diagrama del pipeline DevSecOps", description: "Flujo del pipeline DevSecOps de Charmaway", name: "diagrama-pipeline" },
      }),
    ],
  }),
  new Pa({
    alignment: AT.CENTER,
    spacing: { after: 140 },
    children: [new T({ text: "Figura 1. Arquitectura del pipeline DevSecOps de Charmaway.", italics: true, size: 18, color: "808080", font: FONT })],
  }),
  p(
    "Se ha implementado un único workflow de GitHub Actions ubicado en .github/workflows/devsecops.yml que se dispara automáticamente con cada push a las ramas develop y main, así como manualmente mediante workflow_dispatch. El pipeline está compuesto por cuatro jobs independientes que se ejecutan en paralelo, lo que reduce el tiempo total de ejecución a menos de dos minutos por commit."
  ),
  p(
    "Cada job sigue el mismo patrón de tres pasos: (1) ejecución de la herramienta de análisis con generación de reporte en JSON o XML, (2) publicación del reporte como artifact descargable de GitHub, y (3) envío del reporte a la API de DefectDojo mediante el endpoint /api/v2/reimport-scan/, lo que permite el versionado y la deduplicación automática de findings entre ejecuciones."
  ),

  h2("1.3 Herramientas de seguridad seleccionadas"),
  p(
    "Se han integrado cuatro herramientas que cubren cuatro de las cinco categorías sugeridas en el enunciado, superando el mínimo de tres exigido. Se ha priorizado la cobertura de la cadena de suministro, el código fuente, la infraestructura como código y el comportamiento dinámico de la aplicación en ejecución."
  ),
  buildTable(
    [1200, 1700, 1900, 4560],
    ["Fase", "Herramienta", "Tipo de análisis", "Justificación"],
    [
      ["SCA", "pip-audit", "Dependencias Python", "Mantenida por la PyPA. Consume las advisories del Python Packaging Advisory Database y de GitHub Security Advisory. Sin necesidad de registro ni clave."],
      ["SAST", "Bandit", "Código fuente Python", "Estándar de facto para auditoría estática de Python. Detecta uso inseguro de aleatoriedad, contraseñas hardcoded, SQL injection y assertions, entre otros."],
      ["IaC", "Trivy (modo fs)", "Infraestructura y secretos", "Soporta múltiples formatos (Dockerfile, docker-compose, manifiestos) y combina escaneo de configuración, vulnerabilidades de SO y detección de secretos en un único binario."],
      ["DAST", "OWASP ZAP Baseline", "Aplicación en ejecución", "Acción oficial action-baseline mantenida por la Fundación OWASP. Lanza un escaneo pasivo contra la aplicación servida en localhost:8080 y exporta el reporte en XML compatible con DefectDojo."],
    ]
  ),

  h2("1.4 Gestión centralizada de vulnerabilidades"),
  p(
    "Se ha desplegado DefectDojo como herramienta de gestión, agregación y triage de los findings producidos por las cuatro herramientas anteriores. El despliegue se realiza mediante un docker-compose propio (defectdojo/docker-compose.yml) compuesto por siete servicios: postgres, redis, initializer, uwsgi, celeryworker, celerybeat y nginx. La instancia se expone en el puerto 8080 y se inicializa con las credenciales por defecto admin/admin."
  ),
  p(
    "Cada job del pipeline sube su reporte al producto Charmaway, dentro de un engagement específico por fase (CI - SCA, CI - SAST, CI - IaC, CI - DAST). El uso del endpoint reimport-scan en lugar de import-scan garantiza que los findings ya conocidos se deduplican en lugar de crearse de nuevo, y los que han desaparecido en la nueva ejecución se marcan automáticamente como Mitigated, lo que permite rastrear el ciclo de vida completo de cada vulnerabilidad."
  ),
  p(
    "Como complemento al panel se ha desarrollado el script scripts/sync_issues.py, que consulta los findings activos vía API REST y crea automáticamente un issue en GitHub por cada uno, etiquetando el finding en DefectDojo con el tag enviado-a-github para evitar duplicados en sucesivas ejecuciones. De este modo cada vulnerabilidad queda trazada en el mismo SCM donde se gestiona el código."
  ),

  h2("1.5 Resultados de la última ejecución"),
  p(
    "La siguiente tabla resume los hallazgos detectados por cada herramienta en la última ejecución completa del pipeline (workflow run 24991055473)."
  ),
  buildTable(
    [1300, 1500, 4060, 2500],
    ["Fase", "Findings", "Distribución", "Estado"],
    [
      ["SCA", "4 CVEs", "Medium en pytest, requests, python-dotenv, sqlparse", "2 mitigadas, 2 activas"],
      ["SAST", "339 hallazgos", "B101 assert (291), B106 password (37), B311 random (9), B105 (2). Todos LOW.", "Pendientes de triage"],
      ["IaC", "4 vulnerabilidades", "Mismas dependencias detectadas también por Trivy fs.", "Coinciden con SCA"],
      ["DAST", "12 alertas", "2 Medium, 5 Low, 5 Informational. CSP, SRI, COEP, CORP, etc.", "Parcialmente mitigadas"],
    ]
  ),
  p(
    "Como prueba del flujo end-to-end, durante esta práctica se han mitigado dos CVEs concretos detectados por la fase SCA mediante actualización dirigida de las dependencias afectadas:"
  ),
  buildTable(
    [2200, 1100, 1100, 4960],
    ["Dependencia", "Inicial", "Fijada", "Identificador y descripción"],
    [
      ["python-dotenv", "1.2.1", "1.2.2", "CVE-2026-28684 — Symlink overwrite en set_key/unset_key"],
      ["sqlparse", "0.5.3", "0.5.4", "GHSA-27jp-wm6q-gp25 — ReDoS al formatear tuplas largas"],
    ]
  ),
  p(
    "Tras el merge de los fix a main (PR #57 a develop y PR #58 a main, ambos con rebase merge para preservar historial individual), el reimport del nuevo reporte de pip-audit en DefectDojo marcó los dos findings como Mitigated con timestamp, mientras que los dos restantes (CVE-2025-71176 en pytest y CVE-2026-25645 en requests) permanecen activos y se han documentado para una iteración posterior por requerir un major bump."
  ),
];

// ===== 2. MANUAL DE DESPLIEGUE Y USO =====

const seccion2 = [
  new Pa({ children: [new PB()] }),
  h1("2. Manual de despliegue y uso"),

  h2("2.1 Requisitos previos"),
  bullet("Git con acceso al repositorio PAI-5-Charmaway."),
  bullet("Docker Engine 24+ y Docker Compose v2."),
  bullet("Python 3.12 (sólo si se desea ejecutar la aplicación o las herramientas fuera de Docker)."),
  bullet("Cuenta GitHub con permisos sobre el repositorio para los workflows y la creación de tokens."),

  h2("2.2 Despliegue de la aplicación Charmaway"),
  code("git clone https://github.com/PAI-5-Charmaway/PAI-5-Charmaway.git"),
  code("cd PAI-5-Charmaway && python -m venv .venv && source .venv/Scripts/activate"),
  code("pip install -r requirements.txt"),
  code("cp charmaway/.env.example charmaway/.env"),
  code("cd charmaway && python manage.py migrate && python manage.py runserver 8080"),

  h2("2.3 Despliegue de DefectDojo en local"),
  p(
    "El stack de DefectDojo está parametrizado en defectdojo/docker-compose.yml. Para levantarlo:"
  ),
  code("cd defectdojo && docker compose up -d"),
  p(
    "El primer arranque tarda entre tres y cinco minutos, ya que el servicio initializer ejecuta las migraciones y carga los datos semilla. Una vez listo, la interfaz web queda disponible en http://localhost:8080 con las credenciales admin/admin (deben cambiarse antes de cualquier exposición pública)."
  ),
  p("Obtención de la API key necesaria para sync_issues.py:"),
  code('curl -X POST http://localhost:8080/api/v2/api-token-auth/ -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin"}\''),
  p("Para detener el stack:"),
  code("docker compose down       # mantiene los volúmenes"),
  code("docker compose down -v    # elimina también la base de datos"),

  h2("2.4 Configuración del pipeline"),
  p(
    "El workflow .github/workflows/devsecops.yml requiere dos secrets en Settings → Secrets and variables → Actions para la subida automática a DefectDojo:"
  ),
  buildTable(
    [3000, 6360],
    ["Secret", "Descripción"],
    [
      ["DEFECTDOJO_URL", "URL pública del DefectDojo. Durante el desarrollo se ha empleado un túnel ngrok contra la instancia local del equipo encargado del Dojo."],
      ["DEFECTDOJO_API_KEY", "API key generada en el panel de DefectDojo del usuario admin."],
    ]
  ),
  p(
    "Si los secrets no están definidos los pasos de subida se omiten silenciosamente (marcados como non-blocking) y el pipeline continúa generando los artifacts descargables."
  ),

  h2("2.5 Ejecución y verificación"),
  p("Lanzamiento manual del pipeline a demanda contra cualquier rama:"),
  code("gh workflow run devsecops.yml --ref <rama>"),
  p("Descarga de reportes una vez finalizado:"),
  code("gh run download <run-id>"),
  p("Sincronización automática de findings a issues de GitHub (requiere .env en la raíz con DOJO_URL, DOJO_TOKEN, GITHUB_API y GITHUB_TOKEN):"),
  code("python scripts/sync_issues.py"),

  h2("2.6 Errores comunes"),
  buildTable(
    [4000, 5360],
    ["Síntoma", "Solución"],
    [
      ["Puerto 8080 ya en uso al levantar DefectDojo", "Localizar el proceso (netstat -ano | grep :8080) y cerrarlo, o crear un docker-compose.override.yml exponiendo otro puerto."],
      ["DefectDojo upload failed (non-blocking) en CI", "El túnel ngrok que expone el Dojo del equipo está caído. Verificar el estado del túnel o ignorar el aviso si solo se necesitan los artifacts."],
      ["pip-audit reporta vulnerabilidades resueltas", "Volver a ejecutar el reimport-scan; DefectDojo marcará automáticamente los findings ausentes como Mitigated."],
      ["Issue duplicada al ejecutar sync_issues.py", "Comprobar que el finding tiene el tag enviado-a-github en DefectDojo; si no, el script lo creará de nuevo."],
    ]
  ),
];

// ===== 3. GRADO DE COMPLETITUD =====

const seccion3 = [
  new Pa({ children: [new PB()] }),
  h1("3. Grado de completitud"),
  p(
    "La siguiente tabla traza, objetivo a objetivo, el grado de cumplimiento alcanzado y la evidencia concreta verificable en el repositorio. Se distinguen los objetivos completados íntegramente de aquéllos cubiertos sólo parcialmente, indicando en cada caso el motivo."
  ),

  buildTable(
    [600, 2900, 1100, 4760],
    ["#", "Objetivo del enunciado", "Grado", "Evidencia"],
    [
      [
        "1",
        "Definir un pipeline CI/CD en un repositorio SCM.",
        [{ text: "Completo", bold: true, color: "2E7D32" }],
        "Workflow GitHub Actions en .github/workflows/devsecops.yml con triggers automáticos (push a develop/main) y manual (workflow_dispatch).",
      ],
      [
        "2",
        "Seleccionar al menos tres herramientas de pruebas de seguridad.",
        [{ text: "Completo", bold: true, color: "2E7D32" }],
        "Cuatro herramientas integradas (supera el mínimo): pip-audit (SCA), Bandit (SAST), Trivy (IaC) y OWASP ZAP (DAST).",
      ],
      [
        "3",
        "Integrar las herramientas en el ciclo de vida del desarrollo.",
        [{ text: "Completo", bold: true, color: "2E7D32" }],
        "Cada job del workflow ejecuta su herramienta, publica el reporte como artifact y lo envía a DefectDojo. La integración está versionada en el repositorio y se ejecuta sin intervención manual en cada push.",
      ],
      [
        "4",
        "Desarrollar tests/pruebas que detecten vulnerabilidades en cada etapa del pipeline.",
        [{ text: "Parcial", bold: true, color: "B7950B" }],
        "Las cuatro herramientas detectan vulnerabilidades reales (4 CVEs en SCA, 339 en SAST, 12 alertas en DAST). Se han configurado herramientas existentes en lugar de desarrollar tests propios; se considera la interpretación más razonable del objetivo dado el alcance académico.",
      ],
      [
        "5",
        "Seleccionar una herramienta de gestión de vulnerabilidades.",
        [{ text: "Completo", bold: true, color: "2E7D32" }],
        "DefectDojo desplegado en defectdojo/docker-compose.yml. Productos, engagements y findings creados automáticamente desde CI vía reimport-scan. Sincronización con GitHub Issues mediante scripts/sync_issues.py.",
      ],
    ]
  ),

  h2("3.1 Evidencias visuales"),
  ...figure(capActions, 460, 590, "Figura 2. Workflow run 24991055473 con las cuatro fases del pipeline en verde y los cinco artifacts publicados."),
  ...figure(capPr, 460, 530, "Figura 3. Pull Request #57 con los dos commits referenciando sus identificadores CVE/GHSA."),
  ...figure(capIssues, 460, 470, "Figura 4. Listado de 32 issues de seguridad abiertos automáticamente desde DefectDojo."),
  ...(capDojo ? figure(capDojo, 460, 290, "Figura 5. Panel de DefectDojo mostrando los findings activos y mitigados de la fase SCA.") : []),

  h2("3.2 Evidencias del flujo end-to-end"),
  bullet("PR #57 (a develop) y PR #58 (a main): bumps de python-dotenv y sqlparse, rebase merge para preservar historial individual de cada commit con su CVE en el mensaje."),
  bullet("Commits 043ab9f y fc9aa9b en main, cada uno cita su identificador CVE/GHSA en el mensaje."),
  bullet("Workflow run 24991055473: las cuatro fases del pipeline en verde tras el fix."),
  bullet("DefectDojo: 4 → 2 findings activos en SCA, dos vulnerabilidades marcadas como Mitigated con timestamp 2026-04-27T11:11:09Z."),
  bullet("36 issues abiertas automáticamente en GitHub desde DefectDojo a través de sync_issues.py, sirviendo de backlog priorizable para el equipo."),

  h2("3.3 Limitaciones conocidas"),
  bullet("Los hallazgos SAST ubicados en código de tests (assert_used, hardcoded_password_funcarg) no se han mitigado: corresponden a fixtures de pruebas (charmaway/administrator/tests.py, charmaway/catalog/tests.py) y se aceptan tras revisión, dado que Bandit no aplica reglas distintas a código de test por defecto. Quedan registrados en DefectDojo para revisión futura."),
  bullet("De los 4 CVEs detectados por SCA se han mitigado dos. Los dos restantes (pytest, requests) requieren un major bump y se han pospuesto al cierre de la práctica."),
  bullet("La instancia de DefectDojo se aloja en el equipo de un miembro del grupo y se expone vía túnel ngrok, lo que provoca pérdidas puntuales de subida cuando el túnel está caído. Los artifacts del pipeline siempre quedan disponibles en GitHub Actions como respaldo."),
  bullet("ZAP se ejecuta en modo Baseline (escaneo pasivo). Una cobertura más exhaustiva exigiría un escaneo Active, que excede el tiempo razonable de un job de CI por commit."),

  h2("3.4 Conclusión"),
  p(
    "Se han cumplido los cinco objetivos del enunciado, con cobertura superior al mínimo exigido (cuatro herramientas frente a tres) y evidencia verificable de un ciclo completo detección → ticketing → corrección → verificación, sostenido sobre infraestructura reproducible mediante docker-compose y workflows declarativos en YAML. El cuarto objetivo se considera parcialmente cubierto en el sentido literal del enunciado, ya que se han integrado herramientas existentes en lugar de desarrollar tests propios; la integración resultante detecta vulnerabilidades reales en cada fase del pipeline, lo que cubre la finalidad subyacente."
  ),
];

// ===== DOCUMENT =====

const headerPar = new Pa({
  children: [
    new T({ text: "PAI-4 · Pipeline DevSecOps · Security Team 5", size: 16, color: "808080", font: FONT }),
  ],
  alignment: AT.RIGHT,
});

const footerPar = new Pa({
  children: [
    new T({ text: "Página ", size: 16, color: "808080", font: FONT }),
    new T({ children: [PageNumber.CURRENT], size: 16, color: "808080", font: FONT }),
    new T({ text: " de ", size: 16, color: "808080", font: FONT }),
    new T({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "808080", font: FONT }),
  ],
  alignment: AT.CENTER,
});

const doc = new D({
  styles: {
    default: { document: { run: { font: FONT, size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: COLOR_PRIMARY, font: FONT },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: COLOR_PRIMARY, font: FONT },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AT.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        ] },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2 cm
        },
      },
      headers: { default: new Header({ children: [headerPar] }) },
      footers: { default: new Footer({ children: [footerPar] }) },
      children: [...cover, ...seccion1, ...seccion2, ...seccion3],
    },
  ],
});

const out = "E:/Visual Studio/PAI-5-Charmaway/docs/entrega/PAI4-ST5-informe.docx";
P.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log("Wrote", out, "(", buf.length, "bytes )");
});
