# TFG Sistema de Digitalización de Documentos Históricos


## Autor  
**Juan José Encina Fernández**


##  Descripción
Este proyecto desarrolla una aplicación web especializada en la digitalización, gestión y análisis de protestos de letras de cambio, documentos históricos que recogen impagos y quiebras en la Europa de finales del siglo XVIII.
La herramienta surge de una necesidad de investigación en historia económica: los protestos contienen información clave sobre personas, roles, ciudades, monedas y motivos de impago durante la crisis económica provocada por las guerras de coalición tras la Revolución Francesa.
El sistema permite transformar estos documentos manuscritos en una base de datos relacional, consultable y analizable mediante formularios inteligentes, visualizaciones interactivas y exportación de resultados.


##  Demo en producción
👉 [tfg-protestos-1016951096747.europe-west1.run.app](https://tfg-protestos-1016951096747.europe-west1.run.app)

## Objetivos
1. Modelado relacional de protestos, letras de cambio, endosos, personas, roles, ciudades, monedas y tipos.
2. Digitalización eficiente mediante formularios con autocompletado, validaciones y optimización del flujo de entrada.
3. Módulo de análisis con tablas, gráficos, mapas interactivos y grafos de relaciones.
4. Interoperabilidad, exportando datos y consultas a SQL.
5. Accesibilidad web multiplataforma, desplegada en la nube y accesible desde cualquier dispositivo.

## Funcionalidades
Formulario de digitalización: registro rápido de protestos completos con sus letras, endosos y entidades relacionadas.
Gestión de datos (CRUD): consulta, edición y eliminación de entidades y relaciones.
Análisis interactivo:
  -> Filtros dinámicos.
  -> Gráficos (Chart.js).
  -> Mapas interactivos (Leaflet).
  -> Grafos de relaciones (D3.js).
  -> Exportación de resultados a SQL.

## Arquitectura
La aplicación sigue un patrón en capas (vista, controlador, lógica de negocio e integración de datos), contenedorizada con Docker y desplegada en Google Cloud.
Frontend (EJS + Bootstrap)
        ↓
Backend (Node.js + Express)
        ↓
Base de Datos (MySQL)

## Tecnologías
  Backend: Node.js, Express
  Frontend: EJS, Bootstrap
  Base de datos: MySQL
  Contenedores: Docker
  Cloud Deployment: Google Cloud
  Visualización y análisis:
  Chart.js → gráficos
  Leaflet → mapas
  D3.js → grafos
  Testing: Jest

## Trabajo Futuro
  Nuevos formatos de exportación (CSV, JSON).
  Sistema de usuarios y permisos para trabajo colaborativo.
  Extender el análisis a cualquier entidad del modelo.
  Integración con OCR (Transkribus) y LLM para pre-rellenado automático de formularios.

