// Защищённый ресурс — личные заметки.
// Все маршруты требуют входа, а к одной заметке пускаем только её владельца.
import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { notes, createNoteId } from '../db.js';

export const notesRouter = Router();
notesRouter.use(requireAuth);

const MAX_LENGTH = 300;

// Найти заметку и проверить владельца; при ошибке сразу отвечает клиенту
function findOwnNote(req, res) {
  const note = notes.find((item) => item.id === Number(req.params.id));
  if (!note) {
    res.status(404).json({ code: 'not_found', error: 'Заметка не найдена' });
    return null;
  }
  if (note.ownerId !== req.user.id) {
    res.status(403).json({ code: 'forbidden', error: 'Это чужая заметка — доступ запрещён' });
    return null;
  }
  return note;
}

// GET /api/notes — только свои заметки
notesRouter.get('/', (req, res) => {
  const own = notes
    .filter((note) => note.ownerId === req.user.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json({ notes: own });
});

// GET /api/notes/:id — одна заметка
notesRouter.get('/:id', (req, res) => {
  const note = findOwnNote(req, res);
  if (note) res.json({ note });
});

// POST /api/notes — новая заметка
notesRouter.post('/', (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) {
    return res.status(400).json({ code: 'validation', error: 'Текст заметки не может быть пустым' });
  }
  if (text.length > MAX_LENGTH) {
    return res.status(400).json({ code: 'validation', error: `Не больше ${MAX_LENGTH} символов` });
  }
  const note = { id: createNoteId(), ownerId: req.user.id, text, createdAt: Date.now() };
  notes.push(note);
  res.status(201).json({ note });
});

// DELETE /api/notes/:id — удалить свою заметку
notesRouter.delete('/:id', (req, res) => {
  const note = findOwnNote(req, res);
  if (!note) return;
  notes.splice(notes.indexOf(note), 1);
  res.json({ message: 'Заметка удалена' });
});
