# Inconsistencias de UI detectadas durante testing E2E

> Generado durante la sesión de testing con Playwright.
> Estas son brechas funcionales o bugs identificados en el análisis del código y el flujo de tests.
> Cada ítem incluye severidad, ubicación en el código y pasos para verificar.

---

## [INC-01] No existe flujo de upgrade/downgrade in-app

**Severidad:** Alta  
**Área:** `src/app/organization/page.tsx`, `src/features/billing-management/`, `src/app/api/team/`

### Descripción
El botón "Change plan" en `/organization` es un simple `<a href="/pricing">` que redirige al usuario a la landing de pricing para iniciar una **nueva compra**. No existe llamada a `stripe.subscriptions.update()` ni endpoint de upgrade/downgrade real.

### Impacto
- Un usuario con plan PLUS que quiere pasar a PRO debe **cancelar y re-comprar**, perdiendo acceso en el intermedio si no lo hace correctamente.
- No hay transferencia del cliente Stripe existente al nuevo checkout — se crean organizaciones duplicadas.
- No se puede hacer downgrade parcial (PLUS → PRO → PLUS) sin re-onboarding completo.

### Pasos para reproducir
1. Hacer login como OWNER con plan PLUS
2. Ir a `/organization`
3. Hacer click en "Change plan"
4. **Resultado actual:** Redirige a `/pricing` (landing pública, sin contexto del plan actual)
5. **Resultado esperado:** Modal o página in-app que propone upgrade/downgrade conservando datos de facturación

### Solución sugerida
Implementar `stripe.subscriptions.update()` en un endpoint `PUT /api/team/change-plan` con proration.

---

## [INC-02] Botón "See plans" en Settings sin href

**Severidad:** Media  
**Archivo:** `src/features/settings/components/sections/plan.tsx`

### Descripción
En la sección de plan dentro de `/settings`, el botón "See plans" no tiene atributo `href` ni handler de click. Es un botón roto que no hace nada al ser clickeado.

### Pasos para reproducir
1. Ir a `/settings` con cualquier plan
2. Localizar el botón "See plans" (o "Ver planes")
3. **Resultado actual:** Click no hace nada
4. **Resultado esperado:** Navegar a `/pricing`

### Solución sugerida
```tsx
// plan.tsx
<Button asChild>
  <a href="/pricing">See plans</a>
</Button>
```

---

## [INC-03] No existe flujo de reactivación de suscripción

**Severidad:** Alta  
**Área:** `src/app/api/team/`, `src/features/billing-management/`

### Descripción
Cuando un usuario cancela su suscripción (`cancel_at_period_end: true`), no existe forma de reactivarla desde la app. No hay endpoint `POST /api/team/reactivate-subscription` ni llamada a `stripe.subscriptions.update({ cancel_at_period_end: false })`.

### Impacto
- Un usuario que cancela por error no puede revertir la acción.
- El estado `subscriptionStatus: 'canceling'` no muestra ninguna opción de "undo".

### Pasos para reproducir
1. Cancelar una suscripción activa
2. Ir a `/organization` con estado `canceling`
3. **Resultado actual:** No hay botón de "Reactivar"
4. **Resultado esperado:** Botón "Reactivar" que llame a `stripe.subscriptions.update({ cancel_at_period_end: false })`

### Solución sugerida
Crear `POST /api/team/reactivate-subscription` usando `stripe.subscriptions.update`.

---

## [INC-04] No hay Stripe Customer Portal

**Severidad:** Media  
**Área:** `src/app/api/`, `src/app/organization/`, `src/features/settings/`

### Descripción
No existe ninguna ruta ni botón que genere una sesión del Stripe Customer Portal (`stripe.billingPortal.sessions.create()`). Los usuarios no tienen forma de:
- Cambiar su método de pago
- Ver historial de facturas
- Actualizar dirección de facturación

### Impacto
- Soporte manual necesario para cambios de tarjeta.
- Incumplimiento de expectativas estándar de SaaS B2B.

### Solución sugerida
Crear `POST /api/billing/portal` que genere y retorne la URL del portal de Stripe.

---

## ~~[INC-05] Endpoint `/api/pricing/stripe` sin autenticación~~ ✅ RESUELTO

**Resuelta en:** `fix: add sessionMiddleware to POST /api/pricing/stripe`

**Severidad:** Alta  
**Archivo:** `src/app/api/pricing/stripe/route.ts` (o equivalente en Hono)

### Descripción
El endpoint que inicia el Stripe checkout no verifica que el usuario esté autenticado antes de crear una sesión de checkout. Cualquier visitante anónimo puede disparar llamadas a la API de Stripe.

### Impacto
- Posible abuso para generar sesiones de checkout masivas (DoS contra la cuenta de Stripe).
- Stripe puede suspender la cuenta ante actividad anómala.

### Pasos para verificar
```bash
curl -X POST http://localhost:3000/api/pricing/stripe \
  -H "Content-Type: application/json" \
  -d '{"plan":"pro","billing":"MONTHLY"}' \
  # Sin cookies de sesión — debería devolver 401, pero devuelve 200 + URL de checkout
```

### Solución sugerida
Agregar `sessionMiddleware` antes del handler de Stripe checkout.

---

## Resumen de prioridades

| ID | Descripción | Severidad | Esfuerzo estimado |
|----|-------------|-----------|-------------------|
| INC-01 | Sin flujo upgrade/downgrade in-app | Alta | Alto (requiere stripe.subscriptions.update + UI) |
| INC-03 | Sin reactivación de suscripción | Alta | Bajo (1 endpoint + botón condicional) |
| INC-05 | Checkout sin auth middleware | Alta | Muy bajo (agregar middleware) |
| INC-02 | Botón "See plans" sin href | Media | Trivial (1 línea) |
| INC-04 | Sin Stripe Customer Portal | Media | Medio (1 endpoint + enlace en UI) |
