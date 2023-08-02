const express = require('express');
const { getAllActivities } = require('../db');
const router = express.Router();

// GET /api/activities/:activityId/routines


// GET /api/activities
router.get('/api/activities', async (req, res, next) => {
    try{
        const allActivites = await getAllActivities();
        res.send({
            allActivites
          });
    } catch ({ name, message }) {
        next({ name, message });
    }
})
// POST /api/activities

// PATCH /api/activities/:activityId

module.exports = router;
