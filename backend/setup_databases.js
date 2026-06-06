require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const pageId = process.env.NOTION_PAGE_ID;

async function createDatabases() {
  try {
    console.log(`Starting to create databases inside Page: ${pageId}...`);

    // 1. Tasks Database
    console.log("Creating Tasks database...");
    const tasksDb = await notion.databases.create({
      parent: { type: "page_id", page_id: pageId },
      title: [{ type: "text", text: { content: "Tasks" } }],
      properties: {
        "title": { title: {} }, // title property is required
        "status": { select: { options: [{ name: "Todo", color: "gray" }, { name: "Doing", color: "blue" }, { name: "Done", color: "green" }] } },
        "priority": { select: { options: [{ name: "Low", color: "green" }, { name: "Medium", color: "yellow" }, { name: "High", color: "red" }] } },
        "category": { select: { options: [{ name: "English" }, { name: "Internship" }, { name: "Projects" }, { name: "Cybersecurity" }, { name: "CP" }, { name: "Forex" }, { name: "Spiritual" }, { name: "Reading" }, { name: "Career" }] } },
        "dueDate": { date: {} },
        "phase": { select: { options: [{ name: "Phase 1" }, { name: "Phase 2" }, { name: "Phase 3" }, { name: "Phase 4" }] } },
        "completed": { checkbox: {} }
      }
    });
    console.log(`✅ Tasks created! ID: ${tasksDb.id}`);

    // 2. Habits Database
    console.log("Creating Habits database...");
    const habitsDb = await notion.databases.create({
      parent: { type: "page_id", page_id: pageId },
      title: [{ type: "text", text: { content: "Habits" } }],
      properties: {
        "habitName": { title: {} },
        "completed": { checkbox: {} },
        "streak": { number: { format: "number" } },
        "frequency": { select: { options: [{ name: "Daily" }, { name: "Weekly" }] } },
        "category": { select: { options: [{ name: "Spiritual" }, { name: "Coding" }, { name: "English" }, { name: "Health" }] } }
      }
    });
    console.log(`✅ Habits created! ID: ${habitsDb.id}`);
    // 3. Goals Database
    console.log("Creating Goals database...");
    const goalsDb = await notion.databases.create({
      parent: { type: "page_id", page_id: pageId },
      title: [{ type: "text", text: { content: "Goals" } }],
      properties: {
        "goalTitle": { title: {} },
        "category": { select: { options: [{ name: "Spiritual" }, { name: "Coding" }, { name: "English" }, { name: "Career" }, { name: "Finance" }] } },
        "targetDate": { date: {} },
        "progress": { number: { format: "percent" } },
        "status": { select: { options: [{ name: "Not Started", color: "gray" }, { name: "In Progress", color: "blue" }, { name: "Completed", color: "green" }] } }
      }
    });
    console.log(✅ Goals created! ID: ${goalsDb.id});