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
