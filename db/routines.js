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
  const {
    rows: [routine],
  } = await client.query(
    `
    SELECT DISTINCT routines.*,
    users.username AS "creatorName",
    routine_activities.count,
    routine_activities.duration,
    routine_activities."activityId",
    routine_activities."routineId"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routines.id = routine_activities."routineId"
    WHERE routines.id = $1;
    `,
    [id]
  );

  const { rows: activities } = await client.query(
    `
    SELECT activities.*,
    routine_activities.count,
    routine_activities.duration,
    routine_activities."activityId",
    routine_activities.id AS routineActivityId,
    routine_activities."routineId"
    FROM activities
    JOIN routine_activities ON activities.id = routine_activities."activityId"
    WHERE routine_activities."routineId" = $1;
    `,
    [id]
  );

  routine.activities = activities.map((activity) => ({
    id: activity.activityId,
    routineId: activity.routineActivityId,
    ...activity,
  }));

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
  const { rows: routineId } = await client.query(`
    SELECT routines.*,
    users.username AS "creatorName", 
    routine_activities.count,
    routine_activities.duration,
    routine_activities.id AS routineActivityId,
    routine_activities."routineId"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routines.id = routine_activities."routineId"
    JOIN activities ON routine_activities."activityId" = activities.id;
  `);

  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  return routines;
}

async function getAllPublicRoutines() {
  const { rows: routineId } = await client.query(`
  SELECT routines.*,
    users.username AS "creatorName", 
    routine_activities.count,
    routine_activities.duration,
    routine_activities.id AS routineActivityId,
    routine_activities."routineId"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routines.id = routine_activities."routineId"
    JOIN activities ON routine_activities."activityId" = activities.id
    WHERE "isPublic" = true; 
  `);
  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  return routines;
}

async function getAllRoutinesByUser({ username }) {
  const { rows: routineId } = await client.query(
    `
  SELECT routines.*,
    users.username AS "creatorName", 
    routine_activities.count,
    routine_activities.duration,
    routine_activities.id AS routineActivityId,
    routine_activities."routineId"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routines.id = routine_activities."routineId"
    JOIN activities ON routine_activities."activityId" = activities.id
    WHERE users.username = $1; 
  `,
    [username]
  );
  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  return routines;
}

async function getPublicRoutinesByUser({ username }) {
  const { rows: routineId } = await client.query(
    `
  SELECT routines.*,
    users.username AS "creatorName", 
    routine_activities.count,
    routine_activities.duration,
    routine_activities.id AS routineActivityId,
    routine_activities."routineId"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routines.id = routine_activities."routineId"
    JOIN activities ON routine_activities."activityId" = activities.id
    WHERE "isPublic" = true AND users.username = $1; 
  `,
    [username]
  );
  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
  );

  return routines;
}

async function getPublicRoutinesByActivity({ id }) {
  const { rows: routineId } = await client.query(
    `
  SELECT routines.*,
    users.username AS "creatorName", 
    routine_activities.count,
    routine_activities.duration,
    routine_activities.id AS routineActivityId,
    routine_activities."routineId"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routines.id = routine_activities."routineId"
    JOIN activities ON routine_activities."activityId" = activities.id
    WHERE routines."isPublic" = true AND routine_activities."activityId" = $1;
  `,
    [id]
  );
  const routines = await Promise.all(
    routineId.map((routine) => getRoutineById(routine.id))
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
