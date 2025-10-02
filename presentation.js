const prompt = require('prompt-sync')();
const business = require('./business');

/**
 * Format ISO date string to "Month Day, Year".
 * @param {string} iso - ISO timestamp string.
 * @returns {string} Human-readable formatted date.
 */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Prompt user for a new value while allowing reuse of the previous value.
 * @param {string} field - The label of the field.
 * @param {string} previous - The previous value.
 * @returns {string} New value entered or the previous value if left blank.
 */
function promptReuse(field, previous) {
  const v = prompt(`Enter value for ${field} [${previous}]: `);
  return v === '' ? previous : v;
}

/**
 * Menu loop after login. Displays options and executes user actions.
 * @param {{id:number, username:string}} user - Logged in user object.
 * @returns {Promise<void>}
 */
async function runMenu(user) {
  while (true) {
    console.log('\n===== Digital Media Catalog =====');
    console.log(`Logged in as: ${user.username}`);
    console.log('1. Find Photo (by ID)');
    console.log('2. Update Photo Details');
    console.log('3. Tag Photo');
    console.log('4. Exit');
    const sel = Number(prompt('Your selection> '));

    if (Number.isNaN(sel) || sel < 1 || sel > 4) {
      console.log('**** ERROR **** select a valid option');
      continue;
    }
    if (sel === 4) break;

    if (sel === 1) {
      await uiFindPhoto(user.id);
    } else if (sel === 2) {
      await uiUpdatePhoto(user.id);
    } else if (sel === 3) {
      await uiTagPhoto(user.id);
    }
  }
  console.log('Goodbye!');
}

/**
 * Find and display a photo owned by the user.
 * @param {number} userId - ID of the logged in user.
 * @returns {Promise<void>}
 */
async function uiFindPhoto(userId) {
  console.log('\n');
  const pid = Number(prompt('Photo ID? '));
  const res = await business.getOwnedPhoto(userId, pid);
  if (res.error) {
    console.log(`!!! ${res.error}\n`);
    return;
  }
  console.log(`Filename: ${res.filename}`);
  console.log(` Title: ${res.title}`);
  console.log(`  Date: ${formatDate(res.date)}`);
  console.log(`Albums: ${Array.isArray(res.albums) ? res.albums.join(', ') : ''}`);
  console.log(`  Tags: ${res.tags.join(', ')}\n`);
}

/**
 * Update the title and description of a photo owned by the user.
 * @param {number} userId - ID of the logged in user.
 * @returns {Promise<void>}
 */
async function uiUpdatePhoto(userId) {
  console.log('\n');
  const pid = Number(prompt('Photo ID? '));
  const res = await business.getOwnedPhoto(userId, pid);
  if (res.error) {
    console.log(`!!! ${res.error}\n`);
    return;
  }
  console.log('Press Enter to keep existing values.');
  const newTitle = promptReuse('title', res.title);
  const newDesc = promptReuse('description', res.description);
  const out = await business.updatePhotoDetails(userId, pid, newTitle, newDesc);
  if (out.ok) console.log('Photo updated\n');
  else console.log(`!!! ${out.error || 'Problem updating'}\n`);
}

/**
 * Add a new tag to a photo owned by the user.
 * Prevents duplicates.
 * @param {number} userId - ID of the logged in user.
 * @returns {Promise<void>}
 */
async function uiTagPhoto(userId) {
  console.log('\n');
  const pid = Number(prompt('What photo ID to tag? '));
  const res = await business.getOwnedPhoto(userId, pid);
  if (res.error) {
    console.log(`!!! ${res.error}\n`);
    return;
  }
  const tag = String(prompt(`What tag to add (${res.tags.join(',')})? `)).toLowerCase();
  const out = await business.addTag(userId, pid, tag);
  if (!out.ok) {
    console.log(`!!! ${out.error}\n`);
    return;
  }
  if (out.skipped) console.log('Tag already exists (no change)\n');
  else console.log('Updated!\n');
}

/**
 * Entry point of the application. Handles login then runs the menu.
 * @returns {Promise<void>}
 */
async function main() {
  console.log('Welcome to Digital Media Catalog (Assignment 2)');
  const username = prompt('Username: ');
  const password = prompt.hide('Password: ');
  const user = await business.login(username, password);
  if (!user) {
    console.log('Invalid credentials. Exiting.');
    return;
  }
  await runMenu(user);
}

main();