const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  const {
    rows: [routine],
  } = await client.query(
    `
  INSERT INTO routines("creatorId", "isPublic", name, goal)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  `,
    [creatorId, isPublic, name, goal]
  );
  return routine;
}

async function getRoutineById(id) {
  const {
    rows: [routine],
  } = await client.query(`
  SELECT * FROM routines
  WHERE id = ${id}
  `);
  return routine;
}

async function getRoutinesWithoutActivities() {
  const { rows } = await client.query(`
  SELECT * FROM routines
  `);
  return rows;
}

async function getAllRoutines() {
  const { rows } = await client.query(`
  SELECT * FROM routines;
  `);
  return rows;
}

async function getAllPublicRoutines() {
  const { rows } = await client.query(`
  SELECT * FROM routines 
  WHERE "isPublic" = true; 
  `);
  return rows;
}

async function getAllRoutinesByUser({ username }) {
  const {
    rows: [routine],
  } = await client.query(
    `
  SELECT * FROM routines
  WHERE "creatorId" IN ( SELECT id FROM users WHERE username = $1 ); 
  `,
    [username]
  );
  return routine;
}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
