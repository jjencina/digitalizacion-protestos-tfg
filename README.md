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
- **Formulario de digitalización:** registro rápido de protestos completos con sus letras, endosos y entidades relacionadas.  
- **Gestión de datos (CRUD):** consulta, edición y eliminación de entidades y relaciones.  
- **Análisis interactivo:**
  - Filtros dinámicos  
  - Gráficos (Chart.js)  
  - Mapas interactivos (Leaflet)  
  - Grafos de relaciones (D3.js)  
  - Exportación de resultados a SQL  

## Arquitectura
La aplicación sigue un patrón en capas (vista, controlador, lógica de negocio e integración de datos), contenedorizada con Docker y desplegada en Google Cloud.
Frontend (EJS + Bootstrap)
        ↓
Backend (Node.js + Express)
        ↓
Base de Datos (MySQL)

## Tecnologías
- **Backend:** Node.js, Express  
- **Frontend:** EJS, Bootstrap  
- **Base de datos:** MySQL  
- **Contenedores:** Docker  
- **Cloud Deployment:** Google Cloud  
- **Visualización y análisis:**  
  - Chart.js → gráficos  
  - Leaflet → mapas  
  - D3.js → grafos  
- **Testing:** Jest  

## Trabajo Futuro
- Nuevos formatos de exportación (CSV, JSON).  
- Sistema de usuarios y permisos para trabajo colaborativo.  
- Extender el análisis a cualquier entidad del modelo.  
- Integración con OCR (Transkribus) y LLM para pre-rellenado automático de formularios.  

---

## Flujo de trabajo

### Pantalla principal
Aceso a la entrada de datos (formulario), el CRUD de entidades y a la exploració y exportación de datos

### 🧾 Introducción de datos mediante formulario optimizado
Permite registrar de forma rápida un protesto con todos sus elementos relacionados.  
<p align="center">
  <img width="90%" alt="Formulario de digitalización" src="https://github.com/user-attachments/assets/e4cb8654-585f-4e70-8898-4602ac6d1fae" />
</p>

### 🔄 CRUD de entidades y relaciones
Gestión completa (crear, leer, actualizar y eliminar) de personas, roles, letras, monedas y protestos.  
<p align="center">
  <img width="90%" alt="CRUD de entidades" src="https://github.com/user-attachments/assets/d6b69c07-95d1-4cda-918e-786842da4e8f" />
</p>

### 📊 Exploración y análisis de datos
Incluye filtros dinámicos, tablas interactivas, gráficos, mapas y grafos.

#### 🔍 Búsqueda de datos por filtros
<p align="center">
  <img width="90%" alt="Búsqueda de datos" src="https://github.com/user-attachments/assets/d56e198e-4bb9-4c97-8326-caf08fea3079" />
  <img width="90%" alt="Filtros dinámicos" src="https://github.com/user-attachments/assets/dca2a8f4-0496-4a8b-aaa3-f5bef97c7c3c" />
</p>

#### 🗺️ Mapamundi interactivo
Visualización geográfica de las ciudades involucradas en los protestos.  
<p align="center">
  <img width="90%" alt="Mapamundi interactivo" src="https://github.com/user-attachments/assets/4f9f2f83-bed3-4c85-8b2e-7429463ca9f9" />
</p>

#### 🔗 Grafos de relaciones
Análisis visual de las conexiones entre personas, roles y ciudades.  
<p align="center">
  <img width="90%" alt="Grafo de relaciones" src="https://github.com/user-attachments/assets/281ab192-6cb9-4d9f-a617-cb072423678c" />
</p>

#### 📋 Tabla de datos
Consulta detallada y ordenable de los registros digitalizados.  
<p align="center">
  <img width="90%" alt="Tabla de datos" src="https://github.com/user-attachments/assets/864fd13e-523c-4515-acee-ea76f9014c4b" />
</p>

#### 💾 Exportación SQL
Generación automática de consultas SQL a partir de los filtros aplicados.  
<p align="center">
  <img width="90%" alt="Exportación SQL" src="https://github.com/user-attachments/assets/aef25d7a-56fd-4cb4-adc2-eea0fc8e146d" />
</p>

---

## 📜 Documento histórico de referencia
Ejemplo de un protesto real que se intenta digitalizar y analizar con esta aplicación:  
<p align="center">
  <img width="90%" alt="Protesto histórico" src="https://github.com/user-attachments/assets/a3686ef5-2801-4304-baba-c6e5c7c86c08" />
</p> 

Imagen completa del formulario que emula los protestos
<p align="center">
  <img width="1006" height="1051" alt="image10" src="https://github.com/user-attachments/assets/a61a7c33-792e-4b5c-bf17-7208e8270c6e" />
</p> 
