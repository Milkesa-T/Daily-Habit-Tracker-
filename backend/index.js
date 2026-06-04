const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const { Client } = require('@notionhq/client');
const { syncEvent, deleteEvent } = require('./google_calendar');

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DB_IDS = {
  tasks:    process.env.NOTION_TASKS_DB,
  habits:   process.env.NOTION_HABITS_DB,
  goals:    process.env.NOTION_GOALS_DB,
  projects: process.env.NOTION_PROJECTS_DB,
  english:  process.env.NOTION_ENGLISH_DB,
  journal:  process.env.NOTION_JOURNAL_DB,
};

const DS_IDS = {
  tasks:    process.env.NOTION_TASKS_DS,
  habits:   process.env.NOTION_HABITS_DS,
  goals:    process.env.NOTION_GOALS_DS,
  projects: process.env.NOTION_PROJECTS_DS,
  english:  process.env.NOTION_ENGLISH_DS,
  journal:  process.env.NOTION_JOURNAL_DS,
};

const TITLE_KEYS = {
  tasks:    'title',
  habits:   'habitName',
  goals:    'goalTitle',
  projects: 'projectName',
  english:  'word',
  journal:  'title',
};

// Select-type properties (so they don't get treated as rich_text)
const SELECT_KEYS = new Set(['status','priority','category','masteryStatus','mood','frequency','phase','timeframe']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Flatten a Notion page's properties into a plain JS object */
function formatPage(page) {
  const props = page.properties;
  const out = { id: page.id };

  for (const [key, val] of Object.entries(props)) {
    switch (val.type) {
      case 'title':
        out[key] = val.title[0]?.plain_text || '';
        break;
      case 'rich_text':
        out[key] = val.rich_text[0]?.plain_text || '';
        break;
      case 'select':
        out[key] = val.select?.name || '';
        break;
      case 'multi_select':
        out[key] = val.multi_select?.map(o => o.name) || [];
        break;
      case 'checkbox':
        out[key] = val.checkbox;
        break;
      case 'number':
        out[key] = val.number ?? 0;
        break;
      case 'date':
        // Return full date object so frontend can access start AND end
        out[key] = val.date ? { start: val.date.start, end: val.date.end || null } : null;
        break;
      case 'url':
        out[key] = val.url || '';
        break;
    }
  }
  return out;
}

/** Map a plain JS body from the frontend into Notion property format */
function toNotionProperties(type, body) {
  const titleKey = TITLE_KEYS[type];
  const properties = {};

  for (const [key, val] of Object.entries(body)) {
    if (val === null || val === undefined) continue;

    if (key === titleKey || key === 'Name') {
      properties[key] = { title: [{ text: { content: String(val) } }] };
    } else if (typeof val === 'boolean') {
      properties[key] = { checkbox: val };
    } else if (typeof val === 'number') {
      properties[key] = { number: val };
    } else if (Array.isArray(val)) {
      properties[key] = { multi_select: val.map(name => ({ name })) };
    } else if (SELECT_KEYS.has(key)) {
      properties[key] = { select: { name: String(val) } };
    } else if (key === 'githubLink') {
      properties[key] = { url: val };
    } else if (key.toLowerCase().includes('date') && typeof val === 'object' && val.start) {
      // Date range: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' or null }
      properties[key] = { date: { start: val.start, end: val.end || null } };
    } else if (key.toLowerCase().includes('date') && typeof val === 'string' && val) {
      properties[key] = { date: { start: val } };
    } else {
      // Default: rich_text (covers description, startTime, endTime, etc.)
      properties[key] = { rich_text: [{ text: { content: String(val) } }] };
    }
  }
  return properties;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/:type  – list all items
app.get('/api/:type', async (req, res) => {
  const { type } = req.params;
  const dsId = DS_IDS[type];
  if (!dsId) return res.status(404).json({ error: 'Unknown type: ' + type });

  try {
    const response = await notion.dataSources.query({ data_source_id: dsId });
    res.json(response.results.map(formatPage));
  } catch (error) {
    console.error(`GET /api/${type} error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/:type  – create a new page
app.post('/api/:type', async (req, res) => {
  const { type } = req.params;
  const dbId = DB_IDS[type];
  if (!dbId) return res.status(404).json({ error: 'Unknown type: ' + type });

  try {
    const properties = toNotionProperties(type, req.body);
    const response = await notion.pages.create({ parent: { database_id: dbId }, properties });
    const formatted = formatPage(response);
    
    // Sync to Google Calendar if it has a startTime
    if (formatted.startTime) {
      const title = formatted.title || formatted.habitName || formatted.goalTitle || 'Event';
      // For tasks, use dueDate. For habits, use today's date (and ideally make it recurring, but let's just create today's for MVP)
      const dateStr = (formatted.dueDate && formatted.dueDate.start) ? formatted.dueDate.start : new Date().toISOString().slice(0, 10);
      await syncEvent(formatted.id, title, dateStr, formatted.startTime, formatted.endTime);
    }

    res.json(formatted);
  } catch (error) {
    console.error(`POST /api/${type} error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/:type/:id  – update existing page
app.patch('/api/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    const properties = toNotionProperties(type, req.body);
    const response = await notion.pages.update({ page_id: id, properties });
    const formatted = formatPage(response);

    // Sync to Google Calendar
    if (req.body.startTime || formatted.startTime) {
      const title = formatted.title || formatted.habitName || formatted.goalTitle || 'Event';
      const dateStr = (formatted.dueDate && formatted.dueDate.start) ? formatted.dueDate.start : new Date().toISOString().slice(0, 10);
      await syncEvent(formatted.id, title, dateStr, formatted.startTime, formatted.endTime);
    }

    res.json(formatted);
  } catch (error) {
    console.error(`PATCH /api/${type}/${id} error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/:type/:id  – soft-delete (archive)
app.delete('/api/:type/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await notion.pages.update({ page_id: id, in_trash: true });
    await deleteEvent(id);
    res.json({ success: true });
  } catch (error) {
    console.error(`DELETE error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
