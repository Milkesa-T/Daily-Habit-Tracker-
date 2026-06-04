require("dotenv").config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DS_IDS = {
  tasks: process.env.NOTION_TASKS_DS,
  habits: process.env.NOTION_HABITS_DS,
  goals: process.env.NOTION_GOALS_DS,
  projects: process.env.NOTION_PROJECTS_DS,
  english: process.env.NOTION_ENGLISH_DS,
  journal: process.env.NOTION_JOURNAL_DS,
};

const SCHEMA_ADDITIONS = {
  tasks: {
    description: { rich_text: {} },
    timeframe: {
      select: {
        options: [
          { name: "Daily", color: "blue" },
          { name: "Weekly", color: "purple" },
          { name: "Monthly", color: "orange" },
        ],
      },
    },
    startTime: { rich_text: {} },
    endTime: { rich_text: {} },
  },
  habits: {
    lastCompletedDate: { date: {} },
    startTime: { rich_text: {} },
    endTime: { rich_text: {} },
    isRoutine: { checkbox: {} },
  },
  goals: {
    description: { rich_text: {} },
  },
};

async function addSchemaColumns() {
  for (const [type, additions] of Object.entries(SCHEMA_ADDITIONS)) {
    const dsId = DS_IDS[type];
    if (!dsId) continue;
    console.log(`Adding new columns to '${type}'...`);
    try {
      await notion.dataSources.update({
        data_source_id: dsId,
        properties: additions,
      });
      console.log(`✅ '${type}' updated successfully.`);
    } catch (e) {
      console.error(`❌ Failed to update '${type}':`, e.message);
    }
  }
  console.log("\n🎉 Schema migration done!");
}

addSchemaColumns();
