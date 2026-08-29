# Plan de acción — Rediseño de Billing > Analítica

## Objetivo

Rediseñar completamente la sección **Analítica** de Billing para que deje de ser una colección de gráficos y se convierta en una herramienta de análisis y toma de decisiones.

La sección debe responder:

1. ¿Qué está pasando?
2. ¿Por qué está pasando?
3. ¿Qué tendencias existen?
4. ¿Qué puede pasar?
5. ¿Qué debería hacer?

No agregar gráficos simplemente por cantidad. Priorizar utilidad, interacción, drill-down y acciones.

---

## 1. Cabecera y filtros

Agregar una cabecera de Analítica con:

- Selector de período:
  - Últimos 6 meses
  - Últimos 12 meses
  - YTD
  - Personalizado
- Selector de categorías
- Selector de tipo:
  - Ingresos
  - Egresos
  - Ambos
- Comparación:
  - Período anterior
  - Mismo período del año anterior
  - Presupuesto, si existe

Todos los componentes de la página deberían respetar estos filtros.

---

## 2. Insights

Agregar una sección superior llamada **Insights**.

Debe detectar automáticamente cambios o situaciones relevantes a partir de los datos.

Ejemplos:

- "Los ingresos crecieron 18% respecto al período anterior."
- "Los gastos aumentaron 27%, principalmente por Marketing y Software."
- "Tenés $12.400 pendientes de cobro."
- "Marketing lleva 4 meses consecutivos creciendo."
- "El ticket promedio aumentó 9%."

Cada insight debería ser accionable cuando corresponda:

- Ver operaciones
- Ver facturas
- Analizar categoría
- Ver detalles

Evitar insights genéricos o que no aporten información, y que la accion tenga sentido y finalidad.

---

## 3. Evolución financiera

Mantener/mejorar el gráfico **Ingresos vs gastos (6 meses)**.

Convertirlo en un gráfico más completo con:

- Ingresos
- Egresos
- Balance

Permitir activar/desactivar cada serie.

Agregar interacción:

- Hover con valores detallados.
- Click sobre un mes.
- Al seleccionar un mes, mostrar breakdown de ingresos/egresos de ese período.

Ejemplo:

Julio:

- Ingresos: $84.500
- Gastos: $61.200
- Balance: +$23.300

Si los gastos aumentaron, mostrar cuáles fueron las principales categorías responsables.

---

## 4. Estructura financiera

Revisar los dos donuts actuales de ingresos y egresos.

No mantener gráficos únicamente porque ya existen.

Preferentemente reemplazarlos o complementarlos con una visualización más útil, por ejemplo:

### Ingresos por categoría

Mostrar:

- Categoría
- Monto
- Porcentaje
- Variación respecto al período anterior

### Gastos por categoría

Misma estructura.

Preferir barras/listas comparativas antes que múltiples donuts si permiten interpretar mejor los datos.

Al seleccionar una categoría:

- Mostrar monto
- Porcentaje del total
- Variación
- Evolución histórica
- Link para ver operaciones relacionadas

---

## 5. Tendencias

Agregar una sección **Tendencias**.

Detectar categorías que están creciendo, disminuyendo o permaneciendo estables.

Ejemplo:

| Categoría   | Tendencia   | Variación |
| ----------- | ----------- | --------: |
| Marketing   | ↑ Creciente |      +31% |
| Software    | ↑ Creciente |      +18% |
| Ventas      | ↑ Creciente |      +12% |
| Operaciones | → Estable   |       +2% |

Cuando sea posible, mostrar contexto:

- "Marketing lleva 4 meses consecutivos creciendo."
- "Software aumentó 18% respecto al período anterior."

---

## 6. Cuentas por cobrar

Crear una sección dedicada al estado de cobros.

Mostrar:

- Total pendiente
- Total vencido
- Total por vencer

Agregar **aging de deuda**:

- 0–30 días
- 31–60 días
- 61–90 días
- 90+ días

Ejemplo:

> $3.600 llevan más de 90 días pendientes.

Agregar acciones:

- Ver facturas
- Ver facturas vencidas
- Filtrar operaciones relacionadas

Esta sección debe permitir pasar directamente del análisis a la acción.

---

## 7. Proyección

Aprovechar la información de proyección que ya existe en Dashboard.

Crear una sección de **Proyección financiera** con:

- Evolución histórica
- Proyección de próximos meses
- Balance proyectado
- Tendencia esperada de ingresos y gastos

Ejemplo:

- Septiembre: +$18.200
- Octubre: +$22.400
- Noviembre: +$11.800

Agregar alertas cuando exista una tendencia negativa:

> "Si los gastos mantienen la tendencia actual, el balance de noviembre podría caer 24%."

---

## 8. Objetivos y planificación

Eliminar/reemplazar el concepto actual de **"Hoja de ruta de analítica"**.

Renombrarlo a:

**Objetivos y planificación**

La idea es que el usuario pueda convertir un insight en un objetivo medible.

Ejemplo:

### Reducir gastos de software

Actual: $8.200/mes
Objetivo: $6.500/mes
Fecha objetivo: Octubre 2026

Mostrar progreso visual.

Otro ejemplo:

### Aumentar ingresos recurrentes

Actual: $24.000/mes
Objetivo: $35.000/mes

Agregar una lista de **Próximas acciones**:

- Revisar suscripciones
- Contactar facturas vencidas
- Revisar gastos de Marketing
- Analizar categoría "Otros"

La idea es que el usuario pueda volver a Analítica posteriormente y comprobar si sus acciones están funcionando.

---

## 9. Interacción entre componentes

Los gráficos y métricas no deberían funcionar como elementos aislados.

Implementar drill-down.

Ejemplo:

Al seleccionar "Marketing":

Mostrar:

- Gasto total
- Variación
- Participación sobre gastos
- Evolución mensual
- Operaciones relacionadas
- Comparación con período anterior

Agregar:

**Ver operaciones relacionadas →**

Esto debe llevar directamente a Operaciones con los filtros correspondientes.

---

## 10. Compartir análisis

Agregar una acción:

**Compartir reporte**

Generar un resumen del período actual con:

- Ingresos
- Egresos
- Balance
- Principales categorías
- Variaciones
- Pendientes/vencidos
- Insights relevantes

Idealmente permitir:

- Compartir mediante link
- Exportar PDF
- Exportar/compartir imagen, si resulta sencillo con la arquitectura actual

El reporte debe ser entendible sin necesidad de acceder a toda la aplicación.

---

# Principios de UX

La sección debe priorizar:

**Datos → Insights → Diagnóstico → Acción**

Evitar:

- Agregar gráficos redundantes.
- Saturar la página.
- Donuts innecesarios.
- Métricas que no generan ninguna decisión.
- Componentes que no interactúan entre sí.

Priorizar:

- Comparaciones.
- Tendencias.
- Drill-down.
- Alertas.
- Insights automáticos.
- Links hacia Operaciones/Facturas.
- Objetivos medibles.
- Proyección.
- Compartir resultados.

---

# Resultado esperado

La arquitectura conceptual de Billing debería quedar:

### Dashboard

**¿Cómo estamos?**

Vista rápida del estado financiero actual.

### Operaciones

**¿Qué pasó?**

Listado y detalle de las operaciones.

### Analítica

**¿Por qué pasó, qué tendencia existe, qué puede pasar y qué debería hacer?**

La sección Analítica debe sentirse como una herramienta de gestión, no como una página de gráficos.
