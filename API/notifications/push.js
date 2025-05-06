const fetch = require('node-fetch');
const { Pool } = require('pg');

const pool = new Pool(); // configure if needed

// Save or update a user's push token
async function savePushToken(userId, token, platform = null) {
  await pool.query(
    `
    INSERT INTO push_tokens (user_id, token, platform, last_used_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (token) DO UPDATE
    SET user_id = $1, platform = $3, last_used_at = NOW()
    `,
    [userId, token, platform]
  );
}

// Get all stored push tokens from DB
async function getAllTokens() {
  const res = await pool.query('SELECT token FROM push_tokens');
  return res.rows.map(row => row.token);
}

// Send push notification to a single token
async function sendPushNotification(token, title, body) {
  const message = {
    to: token,
    sound: 'default',
    title,
    body,
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  return await response.json();
}

// Send notification to all stored tokens
async function sendPushNotificationsToAll(title, body) {
  const tokens = await getAllTokens();
  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });

  return await response.json();
}

module.exports = {
  savePushToken,
  sendPushNotification,
  sendPushNotificationsToAll,
};
