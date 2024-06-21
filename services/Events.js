const pool = require("../database");
const logger = require("../logger");
const MY_STRAVA_ID = process.env.MY_STRAVA_ID || "";

const saveRefreshTokenIntoDB = async (refreshToken) => {
  try {
    const [result] = await pool.query(
      "UPDATE auth SET refresh_token = ? WHERE strava_id = ?",
      [refreshToken, MY_STRAVA_ID]
    );
  } catch (error) {
    logger.error("Error saving refresh token into DB:", JSON.stringify(error));
    console.error("Error saving refresh token into DB:", error);
  }
};

const getRefreshTokenFromDB = async () => {
  try {
    const [result] = await pool.query(
      "SELECT refresh_token FROM auth WHERE strava_id = ?",
      [MY_STRAVA_ID]
    );
    return result[0].refresh_token;
  } catch (error) {
    logger.error("Error getting refresh token from DB:", JSON.stringify(error));
    console.error("Error getting refresh token from DB:", error);
  }
};

const getLastWaxedFromDB = async () => {
  try {
    const [result] = await pool.query(
      "SELECT last_time_waxed FROM auth WHERE strava_id = ?",
      [MY_STRAVA_ID]
    );
    return result[0].last_time_waxed;
  } catch (error) {
    logger.error("Error getting last waxed from DB:", JSON.stringify(error));
    console.error("Error getting last waxed from DB:", error);
  }
};

const updateLastWaxedInDB = async (lastWaxed) => {
  try {
    const [result] = await pool.query(
      "UPDATE auth SET last_time_waxed = ? WHERE strava_id = ?",
      [lastWaxed, MY_STRAVA_ID]
    );
  } catch (error) {
    logger.error("Error updating last waxed in DB: " + JSON.stringify(error));
    console.error("Error updating last waxed in DB:" + error);
  }
};

module.exports = {
  saveRefreshTokenIntoDB,
  getRefreshTokenFromDB,
  getLastWaxedFromDB,
  updateLastWaxedInDB,
};
