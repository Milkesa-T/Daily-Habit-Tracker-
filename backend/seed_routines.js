require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_HABITS_DB;

// Your personal daily routines — looping forever, every single day.
const ROUTINES = [
  { habitName: '🌄 Wake Up at 04:00',      category: 'Health',    startTime: '04:00', endTime: '04:15', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '🤲 Morning Prayer',         category: 'Spiritual', startTime: '04:15', endTime: '04:45', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '📖 Melka Mariam',           category: 'Spiritual', startTime: '04:45', endTime: '05:00', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '📖 Melka Eyasus',           category: 'Spiritual', startTime: '05:00', endTime: '05:15', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '🏋️ Exercise',              category: 'Health',    startTime: '05:15', endTime: '06:00', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '🚿 Bath & Freshen Up',      category: 'Health',    startTime: '06:00', endTime: '06:20', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '🍳 Eat Breakfast',          category: 'Health',    startTime: '06:20', endTime: '06:45', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '🏢 Head to Office / Start Work', category: 'Coding', startTime: '07:00', endTime: '08:00', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '💻 Code (Deep Work)',       category: 'Coding',    startTime: '08:00', endTime: '12:00', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '📚 Learn / Study',          category: 'Coding',    startTime: '13:00', endTime: '15:00', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '🌐 English Practice',       category: 'English',   startTime: '15:00', endTime: '16:00', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '📈 Forex Review & Journal', category: 'Coding',    startTime: '16:00', endTime: '17:00', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '📕 Read a Book (30 min)',   category: 'English',   startTime: '20:00', endTime: '20:30', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '🐙 GitHub Commit',          category: 'Coding',    startTime: '21:00', endTime: '21:15', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
  { habitName: '🌙 Evening Prayer',         category: 'Spiritual', startTime: '21:30', endTime: '22:00', isRoutine: true, streak: 0, frequency: 'Daily', completed: false },
];

function toHabitProperties(habit) {
  return {
    habitName:  { title: [{ text: { content: habit.habitName } }] },
    category:   { select: { name: habit.category } },
    frequency:  { select: { name: habit.frequency } },
    completed:  { checkbox: false },
    streak:     { number: 0 },
    isRoutine:  { checkbox: true },
    startTime:  { rich_text: [{ text: { content: habit.startTime } }] },
    endTime:    { rich_text: [{ text: { content: habit.endTime } }] },
  };
}

async function seedRoutines() {
  console.log(`Seeding ${ROUTINES.length} daily routines into Notion...\n`);
  for (const routine of ROUTINES) {
    try {
      await notion.pages.create({
        parent: { database_id: DB_ID },
        properties: toHabitProperties(routine),
      });
      console.log(`✅ Created: ${routine.habitName}`);
    } catch (e) {
      console.error(`❌ Failed: ${routine.habitName} —`, e.message);
    }
  }
  console.log('\n🎉 All daily routines seeded!');
}

seedRoutines();
