import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import auth from '@/features/auth/server/route'
import workspaces from '@/features/workspaces/server/route'
import records from '@/features/records/server/route'
import members from '@/features/members/server/route'
import tasks from '@/features/tasks/server/route'
import checklist from '@/features/tasks/server/checklist.route'
import comments from '@/features/tasks/server/comments.route'
import activityLogs from '@/features/tasks/server/activity-logs.route'
import billing from '@/features/billing-management/server/route'
import settings from '@/features/settings/server/route'
import team from '@/features/team/server/route'
import home from '@/features/home/server/route'
import landing from '@/features/landing/server/route'
import pricing from '@/features/pricing/server/route'
import oauth from '@/features/oauth/server/route'
import roles from '@/features/roles/server/route'
import chat from '@/features/chat/server/route'

const app = new Hono().basePath('/api')

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const routes = app
  .route('/auth', auth)
  .route('/workspaces', workspaces)
  .route('/records', records)
  .route('/members', members)
  .route('/tasks', tasks)
  .route('/checklist', checklist)
  .route('/comments', comments)
  .route('/activity-logs', activityLogs)
  .route('/billing', billing)
  .route('/settings', settings)
  .route('/team', team)
  .route('/roles', roles)
  .route('/landing', landing)
  .route('/pricing', pricing)
  .route('/oauth', oauth)
  .route('/chat', chat)
  .route('/', home)

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes;