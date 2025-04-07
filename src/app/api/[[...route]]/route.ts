import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import auth from '@/features/auth/server/route'
import workspaces from '@/features/workspaces/server/route'
import records from '@/features/records/server/route'
import members from '@/features/members/server/route'
import tasks from '@/features/tasks/server/route'
import billing from '@/features/billing-management/server/route'
import settings from '@/features/settings/server/route'

const app = new Hono().basePath('/api')

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const routes = app
  .route('/auth', auth)
  .route('/workspaces', workspaces)
  .route('/records', records)
  .route('/members', members)
  .route('/tasks', tasks)
  .route('/billing', billing)
  .route('/settings', settings)

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes;