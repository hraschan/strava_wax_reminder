const pool = require("../database");
const MY_STRAVA_ID = process.env.MY_STRAVA_ID || "";

const saveRefreshTokenIntoDB = async (refreshToken) => {
  const [result] = await pool.query(
    "UPDATE auth SET refresh_token = ? WHERE strava_id = ?",
    [refreshToken, MY_STRAVA_ID]
  );

  console.log(result);
};

const getRefreshTokenFromDB = async () => {
  try {
    const [result] = await pool.query(
      "SELECT refresh_token FROM auth WHERE strava_id = ?",
      [MY_STRAVA_ID]
    );
    return result[0].refresh_token;
  } catch (error) {
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
    console.error("Error getting last waxed from DB:", error);
  }
};

module.exports = {
  saveRefreshTokenIntoDB,
  getRefreshTokenFromDB,
  getLastWaxedFromDB,
};