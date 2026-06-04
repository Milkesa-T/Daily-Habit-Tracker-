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

    