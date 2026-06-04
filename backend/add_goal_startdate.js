require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Add startDate to goals dataSource (targetDate already exists = deadline/end)
async function addStartDate() {
  const dsId = process.env.NOTION_GOALS_DS;
  console.log('Adding startDate to Goals schema...');
  try {
    await notion.dataSources.update({
      data_source_id: dsId,
      properties: {
        startDate: { date: {} },
      },
    });
    console.log('✅ startDate added to Goals successfully.');
  } catch (e) {
    console.error('❌ Failed:', e.message);
  }
}

addStartDate();
