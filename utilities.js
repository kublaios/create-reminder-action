function calculateTime(num, unit) {
  const now = new Date();
  let time = now.getTime();

  switch (unit) {
    case 'minutes':
    case 'minute':
      time += num * 60000;
      break;
    case 'hours':
    case 'hour':
      time += num * 3600000;
      break;
    case 'days':
    case 'day':
      time += num * 86400000;
      break;
    case 'months':
    case 'month':
      time = new Date(
        now.getFullYear(),
        now.getMonth() + num,
        now.getDate()
      ).getTime();
      break;
    case 'years':
    case 'year':
      time = new Date(
        now.getFullYear() + num,
        now.getMonth(),
        now.getDate()
      ).getTime();
      break;
  }

  return new Date(time);
}

function parseReminder(prompt) {
  // remind {who} to {what} {when}
  const regex1 =
    /remind\s+(?:@?([\w-]+))?\s+to\s+(.+(?=\sin|\safter))\s*(?:(?:in|after)\s+(\d+)\s+(minutes?|hours?|days?|months?|years?)?)?/i;
  // remind {who} {when} to {what}
  const regex2 =
    /remind\s+(?:@?([\w-]+))?\s*(?:(?:in|after)\s+(\d+)\s+(minutes?|hours?|days?|months?|years?)?)?\s+to\s+(.+)/i;

  const match1 = prompt.match(regex1);
  const match2 = prompt.match(regex2);

  if (!match1 && !match2) {
    throw new Error(
      "Invalid reminder format. Please use the format: 'remind {who} to {what} {when}' or 'remind {who} {when} to {what}'"
    );
  }

  let who, what, num, unit;

  if (match1) {
    who = match1[1] ? match1[1] : 'me';
    what = match1[2].trim();
    num = match1[3] ? Number(match1[3]) : 0;
    unit = match1[4] ? match1[4].toLowerCase() : 'minutes';
  } else {
    who = match2[1] ? match2[1] : 'me';
    what = match2[4].trim();
    num = match2[2] ? Number(match2[2]) : 0;
    unit = match2[3] ? match2[3].toLowerCase() : 'minutes';
  }

  const when = calculateTime(num, unit);

  return { who, what, when };
}

function getReminder(context) {
  const body = context.comment.body;
  let remindLine = null;
  let inCode = false;

  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // handle code blocks
    if (line.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    // find /remind at the beginning of the line.
    if (line.startsWith('/remind ')) {
      remindLine = line;
      break;
    }
  }

  if (remindLine === null) {
    return null;
  }
  let prompt = remindLine.slice(1);
  console.log('prompt', prompt);
  console.log('current date and time', new Date());
  const reminder = parseReminder(prompt);

  if (!reminder) {
    throw new Error(`Unable to parse reminder: remind ${body}`);
  } else {
    console.log('reminder', reminder);
  }

  if (reminder.who === 'me') {
    reminder.who = context.sender.login;
  }

  return reminder;
}

function addReminderToBody(body, reminder) {
  const regex = /\r?\n\r?\n<!-- bot: (?<reminder>{"reminders":.*) -->/;

  // body is null instead of empty on no comment issues and pr's #83
  if (!body) {
    body = '';
  }

  const match = body.match(regex);

  const reminders = match ? JSON.parse(match.groups.reminder).reminders : [];
  let id = 1;
  if (reminders.length > 0) {
    id = reminders[reminders.length - 1].id + 1;
  }

  reminders.push({
    id,
    ...reminder,
  });

  const comment = `\n\n<!-- bot: ${JSON.stringify({ reminders })} -->`;
  if (match) {
    return body.replace(regex, comment);
  }

  return `${body}${comment}`;
}

module.exports = { getReminder, addReminderToBody };
