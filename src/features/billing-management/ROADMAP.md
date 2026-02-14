# Billing Management Roadmap

## Objetivo

Evolucionar Billing desde un control financiero básico hacia una herramienta útil para gestión administrativa/contable de una pyme.

## Estado general

- [x] Roadmap creado
- [x] Migraciones de base de datos aplicadas en Appwrite
- [x] Step 1 completado (modelo operativo base)
- [x] Step 2 completado (CRUD y filtros operativos)
- [x] Step 3 completado (vencimientos y seguimiento)
- [x] Step 4 completado (exportación y reportes)
- [x] Step 5 completado (calidad de datos y recurrencias)
- [ ] Step 6 completado (moneda base, cuentas y consistencia fiscal)
- [ ] Step 7 completado (automatización de recurrencias y cierre operativo)

---

## Step 1 — Modelo operativo base (completado)

### Alcance funcional

- [x] Extender schema de operación con campos administrativos clave
- [x] Guardar nuevos campos en API `POST /api/billing`
- [x] Exponer campos base en formulario de alta
- [x] Mostrar identificador de comprobante real en tabla (si existe)
- [x] Ejecutar migración Appwrite y validar creación con nuevos campos

### Cambios en DB (Appwrite) necesarios

Colección: `BILLINGS_ID`

Agregar columnas:

- `invoiceNumber`: String (size sugerido: 40, required: false)
- `partyName`: String (size sugerido: 120, required: false)
- `status`: Enum (`PENDING`, `PAID`, `OVERDUE`) (required: false, default recomendado: `PENDING`)
- `dueDate`: Datetime (required: false)
- `paymentMethod`: Enum (`CASH`, `BANK_TRANSFER`, `DEBIT_CARD`, `CREDIT_CARD`, `DIGITAL_WALLET`, `OTHER`) (required: false)
- `currency`: String (size: 3, required: false, default recomendado: `EUR`)
- `taxRate`: Float (required: false)
- `taxAmount`: Float (required: false)

Opcional recomendado:

- Índice por `teamId, date`
- Índice por `teamId, status, dueDate`

---

## Step 2 — CRUD de operaciones + filtros de trabajo diario

### Alcance funcional

- [x] Editar operación
- [x] Eliminar operación
- [x] Filtro por rango de fecha
- [x] Filtro por tipo (ingreso/gasto)
- [x] Filtro por estado
- [x] Filtro por categoría
- [x] Búsqueda por texto (comprobante, nota, tercero)

### Cambios en DB (Appwrite) necesarios

- Sin columnas nuevas obligatorias.
- Opcional recomendado: índices por `teamId, type`, `teamId, category`, `teamId, invoiceNumber`.

---

## Step 3 — Gestión de vencimientos y cobranza/pagos

### Alcance funcional

- [x] Vista: por vencer
- [x] Vista: vencidos
- [x] Vista: cobrados/pagados hoy
- [x] Acción rápida para marcar `PENDING -> PAID`

### Cambios en DB (Appwrite) necesarios

- Si Step 1 está aplicado, no requiere nuevas columnas.
- Opcional recomendado: índice por `teamId, dueDate, status`.

---

## Step 4 — Exportables y resumen mensual

### Alcance funcional

- [x] Exportación CSV
- [x] Exportación Excel
- [x] Resumen mensual comparativo (mes actual vs mes anterior)

### Cambios en DB (Appwrite) necesarios

- Sin columnas nuevas obligatorias.

---

## Step 5 — Calidad de datos + recurrencias

### Alcance funcional

- [x] Evitar categorías duplicadas
- [x] Validaciones fuertes de montos/fechas
- [x] Recurrencias básicas (mensual, semanal)
- [x] Recordatorios de vencimiento

### Cambios en DB (Appwrite) necesarios

Colección: `BILLINGS_ID` (solo si se implementa recurrencia persistida)

- `isRecurring`: Boolean (required: false, default: false)
- `recurrenceRule`: String (required: false)
- `nextOccurrenceDate`: Datetime (required: false)

---

## Step 6 — Moneda base + cuentas + consistencia fiscal

### Alcance funcional

- [ ] Definir moneda base del workspace para reportes
- [ ] Registrar tipo de cambio manual por fecha (mínimo 1 tasa por moneda activa)
- [ ] Mostrar total convertido a moneda base en dashboard/tabla/exportes
- [ ] Reemplazar `account` libre por selector de cuentas administrables
- [ ] Vincular cada cuenta a una moneda fija (evitar inconsistencias)
- [ ] Unificar lógica fiscal: ingresar tasa o monto, calcular el otro
- [ ] Validar consistencia fiscal por operación (tasa/monto/base imponible)

### Cambios en DB (Appwrite) necesarios

Colección sugerida: `BILLING_ACCOUNTS_ID`

- `teamId`: String (required)
- `name`: String (required)
- `currency`: String (size: 3, required)
- `isActive`: Boolean (required, default: true)

Colección sugerida: `BILLING_EXCHANGE_RATES_ID`

- `teamId`: String (required)
- `date`: Datetime (required)
- `fromCurrency`: String (size: 3, required)
- `toCurrency`: String (size: 3, required)
- `rate`: Float (required)

Ajustes en `BILLINGS_ID`

- `accountId`: String (required: false)
- `baseCurrencyAmount`: Float (required: false)
- `taxMode`: Enum (`RATE`, `AMOUNT`) (required: false)

---

## Step 7 — Automatización de recurrencias + cierre operativo

### Alcance funcional

- [ ] Ejecutar recurrencias con job programado (cron diario)
- [ ] Crear operación hija al vencer `nextOccurrenceDate`
- [ ] Avanzar `nextOccurrenceDate` según regla (`WEEKLY`/`MONTHLY`)
- [ ] Evitar duplicados por corrida (idempotencia)
- [ ] Registrar trazabilidad de ejecuciones (éxitos/errores)
- [ ] Alertas operativas: próximas recurrencias y fallos de ejecución

### Cambios en DB (Appwrite) necesarios

Colección sugerida: `BILLING_RECURRING_RUNS_ID`

- `teamId`: String (required)
- `operationId`: String (required)
- `runAt`: Datetime (required)
- `status`: Enum (`SUCCESS`, `SKIPPED`, `FAILED`) (required)
- `message`: String (required: false)

Opcional recomendado:

- Índice por `teamId, nextOccurrenceDate, isRecurring`
- Índice por `teamId, runAt` en `BILLING_RECURRING_RUNS_ID`

---

## Notas de implementación

- Antes de probar altas con los nuevos campos del Step 1, crear primero los atributos en Appwrite.
- Si no se agregan esas columnas, Appwrite puede rechazar el `createDocument` cuando se envían esos campos.
