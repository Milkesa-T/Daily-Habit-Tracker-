const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

// The Calendar ID provided by the user
const CALENDAR_ID = '1fb65402aaf576973b5912476e879885df0d6cdb0e46f98140800c860a2ee1ac@group.calendar.google.com';

// Path to the service account credentials
const KEY_PATH = path.join(__dirname, 'google_credentials.json');

let calendar;

try {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });

  calendar = google.calendar({ version: 'v3', auth });
  console.log('Google Calendar API initialized.');
} catch (err) {
  console.error('Failed to initialize Google Calendar:', err.message);
}

/**
 * Creates or updates a calendar event for a given Notion item
 * @param {string} notionId - The ID of the item in Notion
 * @param {string} title - The title of the event
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} startTime - HH:MM
 * @param {string} endTime - HH:MM
 */
async function syncEvent(notionId, title, dateStr, startTime, endTime) {
  if (!calendar || !dateStr || !startTime) return null;

  try {
    // We need to store the Notion ID in the calendar event to update/delete it later.
    // We use extendedProperties.private to store it.
    
    // First, search for an existing event with this notionId
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      privateExtendedProperty: `notionId=${notionId}`,
    });

    const existingEvent = res.data.items && res.data.items.length > 0 ? res.data.items[0] : null;

    // Parse start and end times to ISO format
    // Assume user is in Africa/Nairobi timezone as per their calendar link
    const TIMEZONE = 'Africa/Nairobi';
    const startDateTime = `${dateStr}T${startTime}:00`;
    
    // If no end time, default to 30 mins after start
    let endDateTime;
    if (endTime) {
      endDateTime = `${dateStr}T${endTime}:00`;
    } else {
      const d = new Date(startDateTime);
      d.setMinutes(d.getMinutes() + 30);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, -1);
      endDateTime = localISOTime.split('.')[0]; 
    }

    const eventParams = {
      summary: title,
      start: { dateTime: startDateTime, timeZone: TIMEZONE },
      end: { dateTime: endDateTime, timeZone: TIMEZONE },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 0 }, // Notify exactly at the start time
          { method: 'popup', minutes: 10 } // Notify 10 mins before
        ],
      },
      extendedProperties: {
        private: { notionId }
      }
    };

    if (existingEvent) {
      // Update
      const updated = await calendar.events.update({
        calendarId: CALENDAR_ID,
        eventId: existingEvent.id,
        resource: eventParams,
      });
      console.log(`Updated Calendar Event: ${updated.data.htmlLink}`);
      return updated.data;
    } else {
      // Insert
      const inserted = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        resource: eventParams,
      });
      console.log(`Created Calendar Event: ${inserted.data.htmlLink}`);
      return inserted.data;
    }
  } catch (err) {
    console.error('Calendar Sync Error:', err.message);
  }
}

async function deleteEvent(notionId) {
  if (!calendar) return;
  try {
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      privateExtendedProperty: `notionId=${notionId}`,
    });

    if (res.data.items && res.data.items.length > 0) {
      await calendar.events.delete({
        calendarId: CALENDAR_ID,
        eventId: res.data.items[0].id,
      });
      console.log(`Deleted Calendar Event for Notion ID: ${notionId}`);
    }
  } catch (err) {
    console.error('Calendar Delete Error:', err.message);
  }
}

module.exports = { syncEvent, deleteEvent };
