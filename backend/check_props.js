require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DBs = {
  tasks: process.env.NOTION_TASKS_DB,
  habits: process.env.NOTION_HABITS_DB,
  goals: process.env.NOTION_GOALS_DB,
  projects: process.env.NOTION_PROJECTS_DB,
  english: process.env.NOTION_ENGLISH_DB,
  journal: process.env.NOTION_JOURNAL_DB,
};

async function run() {
  for (const [name, dbId] of Object.entries(DBs)) {
    const db = await notion.databases.retrieve({ database_id: dbId });
    if (!db.properties) {
      console.log(name, "-> no properties field");
      continue;
    }
    const allKeys = Object.entries(db.properties).map(
      ([k, v]) => `${k}(${v.type})`,
    );
    const titleEntry = Object.entries(db.properties).find(
      ([, v]) => v.type === "title",
    );
    console.log(
      name,
      "| title key:",
      titleEntry ? titleEntry[0] : "NOT FOUND",
      "| all:",
      allKeys.join(", "),
    );
  }
}

run().catch(console.error);
