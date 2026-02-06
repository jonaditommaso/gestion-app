# 🤖 AI Function Calling - Documentación

Esta carpeta contiene todo el sistema de **function calling** que permite al chatbot ejecutar acciones en la aplicación.

## 📁 Estructura

```
ai/
├── handlers/              → Ejecutores de acciones (organizados por feature)
│   ├── index.ts          → Exporta ACTION_HANDLERS
│   ├── types.ts          → Tipos compartidos (ActionContext, ActionResult)
│   └── home.handlers.ts  → Handlers del módulo home (notas, meets, etc.)
│
├── tools/                 → Definiciones de herramientas que la IA puede usar
│   ├── index.ts          → Exporta ALL_TOOLS
│   └── home.tools.ts     → Tools del módulo home
│
├── function-calling.ts    → Servicio centralizado de function calling
├── groq.ts               → Servicio de chat con Groq (streaming)
├── cerebras.ts           → Servicio de chat con Cerebras (streaming)
└── index.ts              → Exporta getNextService() para chat conversacional
```

## 🚀 Cómo Agregar una Nueva Acción

### Paso 1: Definir el Tool

Edita el archivo correspondiente en `tools/` (ej: `home.tools.ts` si es del home):

```typescript
// tools/home.tools.ts

export interface CreateMeetArgs {
  title: string;
  invited: string;
  dateStart: string;
  duration: string;
}

export const CREATE_MEET_TOOL = {
  type: "function" as const,
  function: {
    name: "create_meet",
    description:
      "Crea una reunión de Google Meet. Usa esta función cuando el usuario quiera programar o agendar una reunión.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Título de la reunión",
        },
        invited: {
          type: "string",
          description: "Email del invitado",
        },
        dateStart: {
          type: "string",
          description: "Fecha y hora de inicio en formato ISO",
        },
        duration: {
          type: "string",
          description: "Duración de la reunión (ej: '30-minute', '1-hour')",
        },
      },
      required: ["title", "invited", "dateStart"],
    },
  },
};

// Agregar a HOME_TOOLS
export const HOME_TOOLS = [
  CREATE_NOTE_TOOL,
  CREATE_MEET_TOOL, // ← Agregar aquí
];
```

### Paso 2: Crear el Handler

Edita el archivo correspondiente en `handlers/` (ej: `home.handlers.ts`):

```typescript
// handlers/home.handlers.ts

export async function handleCreateMeet(
  ctx: ActionContext,
): Promise<ActionResult> {
  const args = ctx.args as unknown as CreateMeetArgs;

  try {
    // Llamar al endpoint existente
    const response = await client.api["meet-validation-permission"].$post({
      json: {
        title: args.title,
        invited: args.invited,
        dateStart: args.dateStart,
        duration: args.duration || "30-minute",
        userId: ctx.userId,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: "❌ No se pudo crear la reunión",
        actionName: "create_meet",
      };
    }

    return {
      success: true,
      message: `✅ Reunión creada: ${args.title}`,
      actionName: "create_meet",
    };
  } catch (error) {
    console.error("Error in handleCreateMeet:", error);
    return {
      success: false,
      message: "❌ Error al crear la reunión",
      actionName: "create_meet",
    };
  }
}

// Agregar a HOME_HANDLERS
export const HOME_HANDLERS = {
  create_note: handleCreateNote,
  create_meet: handleCreateMeet, // ← Agregar aquí
};
```

### Paso 3: ¡Listo!

No necesitas tocar ningún otro archivo. El sistema ya está configurado para:

- ✅ Incluir tu tool en `ALL_TOOLS` (vía `tools/index.ts`)
- ✅ Registrar tu handler en `ACTION_HANDLERS` (vía `handlers/index.ts`)
- ✅ La IA puede detectar y ejecutar tu acción automáticamente

## 📝 Agregar un Nuevo Módulo (Tasks, Records, etc.)

### 1. Crear archivo de tools

```typescript
// tools/tasks.tools.ts

export interface CreateTaskArgs {
  title: string;
  description?: string;
  dueDate?: string;
}

export const CREATE_TASK_TOOL = {
  type: "function" as const,
  function: {
    name: "create_task",
    description: "Crea una nueva tarea",
    parameters: {
      /* ... */
    },
  },
};

export const TASKS_TOOLS = [CREATE_TASK_TOOL];
```

### 2. Crear archivo de handlers

```typescript
// handlers/tasks.handlers.ts

export async function handleCreateTask(
  ctx: ActionContext,
): Promise<ActionResult> {
  // Implementación
}

export const TASKS_HANDLERS = {
  create_task: handleCreateTask,
};
```

### 3. Importar en los index

```typescript
// tools/index.ts
import { TASKS_TOOLS } from "./tasks.tools";

export const ALL_TOOLS = [
  ...HOME_TOOLS,
  ...TASKS_TOOLS, // ← Agregar aquí
];

// handlers/index.ts
import { TASKS_HANDLERS } from "./tasks.handlers";

export const ACTION_HANDLERS = {
  ...HOME_HANDLERS,
  ...TASKS_HANDLERS, // ← Agregar aquí
};
```

## 🔍 Principios de Diseño

1. **Un tool = Un handler** - Cada tool definido debe tener su handler correspondiente
2. **Nombre consistente** - El nombre del tool debe coincidir con la key en ACTION_HANDLERS
3. **Llamar a endpoints existentes** - Los handlers NO duplican lógica, llaman a las APIs existentes
4. **Agrupar por feature** - Mantén tools y handlers relacionados juntos
5. **Tipos exportados** - Exporta los tipos de Args para reutilización

## 🎯 Flujo de Function Calling

```
[Usuario] "Crea una nota con título X"
       │
       ▼
[chatWithTools()] ← Analiza el mensaje con la IA
       │
       ├─► Si detecta tool_call
       │   └─► [executeAction()]
       │       └─► [handleCreateNote()]
       │           └─► client.api.notes.$post()
       │
       └─► Si es texto normal
           └─► Devuelve respuesta directamente
```

## 🛠️ Convenciones

- **Archivos de tools**: `<feature>.tools.ts` (ej: `home.tools.ts`)
- **Archivos de handlers**: `<feature>.handlers.ts` (ej: `home.handlers.ts`)
- **Nombres de tools**: `snake_case` (ej: `create_note`, `send_message`)
- **Nombres de handlers**: `handleCamelCase` (ej: `handleCreateNote`)
- **Tipos de Args**: `PascalCase` + `Args` (ej: `CreateNoteArgs`)
