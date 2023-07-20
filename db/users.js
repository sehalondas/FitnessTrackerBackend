const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  const { rows: user } = await client.query(
    `
  INSERT INTO users (username, password)
  VALUES ($1, $2)
  ON CONFLICT (username) DO NOTHING
  RETURNING *; 
  
  `,
    [username, password]
  );
  return user;
}

async function getUser({ username, password }) {
  const { rows } = await client.query(
    `
  SELECT * FROM users,
  WHERE username = $1 AND password = $2
  `,
    [username, password]
  );
  return rows;
}

async function getUserById(userId) {
  const { rows: user } = await client.query(
    `
  SELECT * FROM users
  WHERE id = $1;
  `,
    [userId]
  );
  return user;
}

async function getUserByUsername(userName) {
  const { rows: user } = await client.query(
    `
  SELECT * FROM users
  WHERE username = $1;
  `,
    [userName]
  );
  return user;
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
