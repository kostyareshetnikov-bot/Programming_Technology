// Журнал событий входа/выхода — только для преподавателя
import { Router } from 'express';
import { requireAuth, requireRole } from '../auth.js';
import { getEvents } from '../audit.js';

export const auditRouter = Router();

// GET /api/audit
auditRouter.get('/', requireAuth, requireRole('teacher'), (req, res) => {
  res.json({ events: getEvents().slice(0, 50) });
});
