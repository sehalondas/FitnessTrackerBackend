const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  const {
    rows: [routine],
  } = await client.query(
    `
    INSERT INTO routines ("creatorId", "isPublic", name, goal)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `,
    [creatorId, isPublic, name, goal]
  );

  return routine;
}

async function getRoutineById(id) {
  const { rows: routine } = await client.query(`
  SELECT * 
  FROM routines
  WHERE id = ${id};
  `);
  return routine;
}

async function getRoutinesWithoutActivities() {
  const { rows: routine } = await client.query(`
  SELECT * 
  FROM routines
  WHERE routine_activities.activityId IS NULL;
  `);
  return routine;
}

async function getAllRoutines() {
  const { rows: routine } = await client.query(`
  SELECT * 
  FROM routines;
  `);
  return routine;
}

async function getAllPublicRoutines() {
  const { rows: routine } = await client.query(`
  SELECT * 
  FROM routines 
  WHERE "isPublic" = true; 
  `);
  return routine;
}

async function getAllRoutinesByUser({ username }) {
  const { rows: routine } = await client.query(
    `
  SELECT * 
  FROM routines
  WHERE "creatorId" = $1; 
  `,
    [username]
  );
  return routine;
}

async function getPublicRoutinesByUser({ username }) {
  const { rows: routine } = await client.query(
    `
  SELECT *
  FROM routines
  WHERE "isPublic" = true AND "creatorId" = $1;
  `,
    [username]
  );
  return routine;
}

async function getPublicRoutinesByActivity({ id }) {
  const { rows: routine } = await client.query(
    `
  SELECT *
  FROM routines
  JOIN routine_activities ON routines.id = routine_activities."routineId"
  WHERE routines."isPublic" = true AND routine_activities."activityId" = $1;
  `,
    [id]
  );

  await attachActivitiesToRoutines(routine);

  return routine;
}

async function updateRoutine({ id, ...fields }) {
  const string = Object.keys(fields)
    .map(
      (key, index) =>
        `"${key}" = $${index + 1}
  `
    )
    .join(", ");

  const {
    rows: [routine],
  } = await client.query(
    `
    UPDATE routines
    SET ${string} 
    WHERE id=${id}
    RETURNING *;
  `,
    Object.values(fields)
  );
  return routine;
}

async function destroyRoutine(id) {
  const { rows: routineActivities } = await client.query(
    `
  DELETE FROM routine_activities
  WHERE "routineId" = $1;
  `,
    [id]
  );

  const { rows: routine } = await client.query(
    `
  DELETE FROM routines
  WHERE "routineId" = $1;
  `,
    [id]
  );
  return routineActivities && routine;
}

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
