const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  const {
    rows: [activity],
  } = await client.query(
    `
  INSERT INTO routine_activities("routineId", "activityId", count, duration)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  `,
    [routineId, activityId, count, duration]
  );
  return activity;
}

async function getRoutineActivityById(id) {
  const {
    rows: [routineActivity],
  } = await client.query(
    `
    SELECT *
    FROM routine_activities
    WHERE id = $1;
    `,
    [id]
  );
  return routineActivity;
}

async function getRoutineActivitiesByRoutine({ id }) {
  const { rows: routineActivities } = await client.query(
    `
    SELECT *
    FROM routine_activities
    WHERE "routineId" = $1;
    `,
    [id]
  );
  return routineActivities;
}

async function updateRoutineActivity({ id, ...fields }) {
  const string = Object.keys(fields)
    .map(
      (key, index) =>
        `"${key}" = $${index + 1}
    `
    )
    .join(", ");

  const {
    rows: [routineActivities],
  } = await client.query(
    `
      UPDATE routine_activities
      SET ${string} 
      WHERE id=${id}
      RETURNING *;
    `,
    Object.values(fields)
  );
  return routineActivities;
}

async function destroyRoutineActivity(id) {
  const { rows: [routineActivities] } = await client.query(
    `
  DELETE FROM routine_activities
  WHERE id = $1
  RETURNING *;
  `,
    [id]
  );
  return routineActivities;
}

async function canEditRoutineActivity(routineActivityId, userId) {
  const { rows: [routineActivities] } = await client.query(
    `
    SELECT "creatorId"
    FROM routine_activities
    JOIN routines ON "routineId" = routines.id
    WHERE routine_activities.id = $1;
    `,
    [routineActivityId]
  );
  return routineActivities && routineActivities.creatorId === userId;
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
