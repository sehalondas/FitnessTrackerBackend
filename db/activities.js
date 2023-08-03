const client = require("./client");

async function createActivity({ name, description }) {
  const {
    rows: [activity],
  } = await client.query(
    `
  INSERT INTO activities (name, description)
  VALUES ($1, $2)
  RETURNING *;
  `,
    [name, description]
  );
  return activity;
}

async function getAllActivities() {
  const { rows: activity } = await client.query(
    `
  SELECT *
  FROM activities;
  `
  );
  return activity;
}

async function getActivityById(id) {
  const {
    rows: [activity],
  } = await client.query(
    `
  SELECT * 
  FROM activities
  WHERE id = $1;
  `,
    [id]
  );
  return activity;
}

async function getActivityByName(name) {
  const {
    rows: [activity],
  } = await client.query(
    `
  SELECT *
  FROM activities
  WHERE name = $1;
  `,
    [name]
  );
  return activity;
}

async function attachActivitiesToRoutines(routine) {
  try {
    const { rows: activities } = await client.query(`
    SELECT activities.* 
    FROM activities
    JOIN routine_activities ON activities.id = routine_activities."activityId"
    WHERE routine_activities."routineId"= ${routine.id};
    `);

    const { rows: routine_activities } = await client.query(`
    SELECT routine_activities.*
    FROM routine_activities
    JOIN activities ON routine_activities."activityId"= activities.id
    WHERE routine_activities."routineId"= ${routine.id};
    `);

    activities.map((activity) =>
      routine_activities.filter(routine_activity => {
        if (activity.id === routine_activity.activityId) {
          activity.count = routine_activity.count;
          activity.duration = routine_activity.duration;
          activity.routineId = routine_activity.routineId;
          activity.routineActivityId = routine_activity.id;
        }
      })
    );

    routine.activities = activities;
    return activities;
  } catch (error) {
    console.error(error);
  }
}

async function updateActivity({ id, ...fields }) {
  const string = Object.keys(fields)
    .map(
      (key, index) =>
        `"${key}" = $${index + 1}
    `
    )
    .join(", ");

  
    rows: [activity],
  } = await client.query(
    `
    UPDATE activities
    SET ${string} 
    WHERE id=${id}
    RETURNING *;
  `,
    Object.values(fields)
  );
  return activity;
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
