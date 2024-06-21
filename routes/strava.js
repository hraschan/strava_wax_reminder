const router = require("express").Router();
const NodeCache = require("node-cache");
const axios = require("axios");
const GEAR_ID = process.env.GEAR_ID || "";
const logger = require("../logger");
const cache = new NodeCache();
const {
  getLastWaxedFromDB,
  updateLastWaxedInDB,
} = require("../services/Events");
const WAXING_INTERVAL = parseInt(process.env.WAXING_INTERVAL) || 300; // All 300 KMs
router.get("/stats", async (req, res) => {
  const apiUrl = `https://www.strava.com/api/v3/gear/${GEAR_ID}`; // Replace with the actual API endpoint

  try {
    const accessToken = cache.get("access_token");
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Current KMs:", response.data.converted_distance);
    const currentKms = response.data.converted_distance;
    const lastWaxed = await getLastWaxedFromDB();

    const needsWaxingIn = Math.floor(lastWaxed + WAXING_INTERVAL - currentKms);

    res.json({
      currentKms: currentKms,
      lastWaxed: lastWaxed,
      needsWaxingIn: needsWaxingIn,
      waxingInterval: WAXING_INTERVAL,
    });
  } catch (error) {
    logger.error("Error getting stats:" + JSON.stringify(error));
    console.error("Error getting stats:", error);
    res.status(500).send("Error getting stats");
  }
});

router.patch("/", async (req, res) => {
  const apiUrl = `https://www.strava.com/api/v3/gear/${GEAR_ID}`; // Replace with the actual API endpoint

  try {
    const accessToken = cache.get("access_token");
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const currentKms = response.data.converted_distance;
    await updateLastWaxedInDB(currentKms);
    const lastWaxed = currentKms;
    const needsWaxingIn = Math.floor(lastWaxed + WAXING_INTERVAL - currentKms);

    res.json({
      currentKms: currentKms,
      lastWaxed: lastWaxed,
      needsWaxingIn: needsWaxingIn,
      waxingInterval: WAXING_INTERVAL,
    });
  } catch (error) {
    logger.error("Error updating last waxed" + JSON.stringify(error));
    console.error("Error updating last waxed", error);
    res.status(500).send("Error updating last waxed");
  }
});

module.exports = router;
