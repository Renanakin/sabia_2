# Sabia Contable - Plataforma Web Corporativa

Plataforma web oficial de **Sabia Contable**, firma especializada en contabilidad integral, gestión de remuneraciones, gestión tributaria y auditoría para pequeñas y medianas empresas (pymes) en Chile.

## 🚀 Características Principales

*   **Sitio Web Corporativo:** Presentación de servicios (Contabilidad, Remuneraciones, Tributaria, Creación de Empresa, Auditoría), equipo de profesionales y testimonios de clientes.
*   **Diseño Responsivo (Mobile-First adaptativo):** La arquitectura de componentes está separada para ofrecer una experiencia óptima tanto en escritorio (`HomeDesktop`) como en dispositivos móviles (`HomeMobile`).
*   **Herramientas y Utilitarios (Calculadoras):** Incluye calculadoras interactivas para sueldos (`calculadora-sueldos`) y honorarios (`boleta-honorarios`) con capacidades de exportación de reportes usando Excel (`exceljs`) y PDF (`jspdf`).
*   **Integración de Correos:** Formulario de contacto integrado con la API de `Resend` para el envío de notificaciones y correos transaccionales.
*   **Seguridad:** Protección de formularios mediante Google reCAPTCHA v3.

## 🛠️ Stack Tecnológico

Este proyecto está construido utilizando tecnologías modernas para garantizar un alto rendimiento, SEO y una excelente experiencia de usuario:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, versión 16.x)
*   **Librería UI:** React 19
*   **Lenguaje:** TypeScript
*   **Estilos:** Tailwind CSS v4
*   **Iconos:** Lucide React y React Icons
*   **Validación:** Zod
*   **Mailing:** Resend
*   **Testing:** Playwright (Pruebas End-to-End)

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:
*   Node.js (versión 20+ recomendada)
*   npm (Gestor de paquetes preferido y configurado en el proyecto)

## 💻 Instalación y Desarrollo Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Renanakin/sabiacontable.git
    cd sabiacontable
    ```

2.  **Instalar las dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Copia el archivo de ejemplo (si existe) o crea un archivo `.env.local` en la raíz del proyecto. Deberás configurar claves para servicios de terceros:
    *   Claves de Resend API (para correos).
    *   Claves de Google reCAPTCHA.

4.  **Iniciar el servidor de desarrollo:**
    El proyecto incluye varios scripts útiles en el `package.json`:
    ```bash
    npm run dev          # Inicia el servidor por defecto (normalmente en localhost:3000)
    # o
    npm run dev:mobile   # Inicia el servidor en 0.0.0.0:3001 para probar en red local
    ```

5.  Abre [http://localhost:3000](http://localhost:3000) o [http://localhost:3001](http://localhost:3001) en tu navegador para ver la aplicación corriendo.

## 📁 Estructura del Proyecto

*   `/src/app`: Rutas principales de Next.js (App Router), incluyendo páginas estáticas y herramientas (`/utilitarios`).
*   `/src/components`: Componentes reutilizables de React. Separados lógicamente entre vistas de escritorio (`/desktop`) y móviles (`/mobile`).
*   `/src/hooks`: Custom hooks de React (ej. `useMindicador` para obtener valores de la UF, UTM, etc.).
*   `/src/utils`: Funciones utilitarias (matemáticas de sueldos, utilidades de exportación, etc.).
*   `/src/app/api`: Endpoints del backend (ej. envíos de email con Resend).
*   `/public`: Archivos estáticos como imágenes del equipo y logos.
*   `/tests`: Pruebas End-to-End automatizadas configuradas con Playwright.

## 🚀 Despliegue (Producción)

Dado que la plataforma está construida con Next.js, el entorno de despliegue recomendado y más óptimo es **Vercel**. Sin embargo, puede desplegarse en cualquier servidor Node.js o plataforma en la nube (AWS, DigitalOcean, Render).

**Pasos para un despliegue manual:**

1.  Construir la aplicación para producción:
    ```bash
    npm run build
    ```
2.  Iniciar el servidor de producción:
    ```bash
    npm run start
    ```

**Para desplegar en Vercel:**
Simplemente conecta tu repositorio de GitHub a tu cuenta de Vercel. Cada vez que hagas `git push` a la rama principal (`master` o `main`), Vercel construirá y desplegará la aplicación automáticamente de forma continua (CI/CD). No olvides configurar las Variables de Entorno (`.env.local`) en el panel de configuración de Vercel.
