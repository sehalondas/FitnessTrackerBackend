const client = require("./client");

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  const { rows: [activity] } = await client.query(
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
  // select and return an array of all activities
  const { rows: activity } = await client.query(
    `
  SELECT *
  FROM activities;
  `
  );
  return activity;
}

async function getActivityById(id) {
  const { rows: [activity] } = await client.query(
    `
  SELECT * FROM activities
  WHERE id = $1;
  `,
    [id]
  );
  return activity;
}

async function getActivityByName(name) {
  const { rows: [activity] } = await client.query(
    `
  SELECT *
  FROM activities
  WHERE name = $1;
  `,
    [name]
  );
  return activity;
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  const name = fields.name;
  const description = fields.description;
  const { rows: [activity] } = await client.query(
    `
    UPDATE activities
    SET name = $1, description = $2
    WHERE id = $3
    RETURNING *;
  `,
    [fields, fields, id]
  );
  console.log("name", name);
  console.log("description", description);
  console.log("fields", {fields});
  console.log("update activites", activity);
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
