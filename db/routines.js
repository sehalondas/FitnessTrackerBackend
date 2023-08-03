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
  try {
    const {
      rows: [routine],
    } = await client.query(`
    SELECT * 
    FROM routines
    WHERE id=${id};
    `);

    const {
      rows: [username],
    } = await client.query(`
    SELECT username
    FROM users
    JOIN routines ON users.id=routines."creatorId"
    WHERE routines."creatorId"= ${routine.creatorId};
    `);

    routine.creatorName = username.username;
    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutinesWithoutActivities() {
  const { rows: routine } = await client.query(`
  SELECT routines.*
  FROM routines
  LEFT JOIN routine_activities ON routines.id = routine_activities."routineId"
  WHERE routine_activities."activityId" IS NULL;
  `);
  return routine;
}

async function getAllRoutines() {
  const { rows: routineId } = await client.query(`
    SELECT id
    FROM routines;
    `);

  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  await Promise.all(
    routines.map(
      (routine) => (routine.activities = attachActivitiesToRoutines(routine))
    )
  );

  return routines;
}

async function getAllPublicRoutines() {
  const { rows: routineId } = await client.query(`
  SELECT routines.*
  FROM routines
  WHERE "isPublic" = true; 
  `);
  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  await Promise.all(
    routines.map(
      (routine) => (routine.activities = attachActivitiesToRoutines(routine))
    )
  );
  return routines;
}

async function getAllRoutinesByUser({ username }) {
  const { rows: routineId } = await client.query(
    `
  SELECT routines.*
  FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE users.username = $1; 
  `,
    [username]
  );

  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  await Promise.all(
    routines.map(
      (routine) => (routine.activities = attachActivitiesToRoutines(routine))
    )
  );
  return routines;
}

async function getPublicRoutinesByUser({ username }) {
  const { rows: routineId } = await client.query(
    `
  SELECT routines.*
  FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE "isPublic" = true AND users.username = $1; 
  `,
    [username]
  );
  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  await Promise.all(
    routines.map(
      (routine) => (routine.activities = attachActivitiesToRoutines(routine))
    )
  );
  return routines;
}

async function getPublicRoutinesByActivity({ id }) {
  const { rows: routineId } = await client.query(
    `
  SELECT routines.*
  FROM routines
  JOIN routine_activities ON routines.id =routine_activities."routineId"
  WHERE routines."isPublic" = true AND routine_activities."activityId" = $1;
  `,
    [id]
  );
  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  await Promise.all(
    routines.map(
      (routine) => (routine.activities = attachActivitiesToRoutines(routine))
    )
  );
  return routines;
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
  WHERE id = $1;
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
