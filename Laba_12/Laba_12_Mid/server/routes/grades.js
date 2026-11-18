// Оценки: студент видит только свои, преподаватель — всю группу и может ставить оценки
import { Router } from 'express';
import { requireAuth, requireRole } from '../auth.js';
import { grades, students, findUserById, createGradeId, SUBJECTS } from '../db.js';
import { logEvent } from '../audit.js';

export const gradesRouter = Router();
gradesRouter.use(requireAuth);

const byDateDesc = (a, b) => b.date - a.date;

// GET /api/students/:id/grades — оценки студента: свои — студенту, любые — преподавателю
gradesRouter.get('/students/:id/grades', (req, res) => {
  const studentId = Number(req.params.id);
  const isOwner = req.user.id === studentId;

  if (req.user.role !== 'teacher' && !isOwner) {
    logEvent(req, 'access_denied', req.user.login, `чужие оценки, студент №${studentId}`);
    return res.status(403).json({ code: 'forbidden', error: 'Можно смотреть только свои оценки' });
  }

  const student = findUserById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ code: 'not_found', error: 'Студент не найден' });
  }

  res.json({
    student: { id: student.id, name: student.name, group: student.group },
    grades: grades.filter((grade) => grade.studentId === studentId).sort(byDateDesc),
  });
});

// GET /api/journal — журнал группы (только преподаватель)
gradesRouter.get('/journal', requireRole('teacher'), (req, res) => {
  const list = students().map(({ id, name, group }) => ({ id, name, group }));
  const rows = grades
    .map((grade) => ({ ...grade, studentName: findUserById(grade.studentId).name }))
    .sort(byDateDesc);
  res.json({ students: list, subjects: SUBJECTS, grades: rows });
});

// POST /api/journal — поставить оценку (только преподаватель)
gradesRouter.post('/journal', requireRole('teacher'), (req, res) => {
  const studentId = Number(req.body?.studentId);
  const subject = String(req.body?.subject ?? '');
  const value = Number(req.body?.value);

  const student = findUserById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(400).json({ code: 'validation', error: 'Выберите студента' });
  }
  if (!SUBJECTS.includes(subject)) {
    return res.status(400).json({ code: 'validation', error: 'Выберите предмет' });
  }
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    return res.status(400).json({ code: 'validation', error: 'Балл — целое число от 0 до 100' });
  }

  const grade = { id: createGradeId(), studentId, subject, value, date: Date.now() };
  grades.push(grade);
  res.status(201).json({ grade });
});
