const express = require("express");
const axios = require("axios");
require("dotenv").config();
const NodeCache = require("node-cache");
var bodyParser = require("body-parser");
const app = express();
const eventsRouter = require("./routes/events");
const logger = require("./logger");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const {
  saveRefreshTokenIntoDB,
  getRefreshTokenFromDB,
} = require("./services/Events");

const INITIAL_ACCESS_TOKEN = process.env.INITIAL_ACCESS_TOKEN || "";
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";
const PORT = parseInt(process.env.PORT) || 3000;
const cache = new NodeCache();
const APP_VERSION = process.env.APP_VERSION || "1.0.0";
const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        console.log("Refreshing token");
        logger.log("info", "Refreshing token");

        originalRequest._retry = true;

        const url = "https://www.strava.com/oauth/token";
        const refresh_token = await getRefreshTokenFromDB();
        const data = {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: refresh_token,
          grant_type: "refresh_token",
        };

        try {
          const response = await axios.post(url, null, {
            params: data,
          });
          cache.set("access_token", response.data.access_token);
          saveRefreshTokenIntoDB(response.data.refresh_token);
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${response.data.access_token}`;
          console.log("Token refreshed");
          logger.log("info", "Token refreshed");

          return axios(originalRequest);
        } catch (error) {
          logger.error("Error refreshing token:", JSON.stringify(error));
          console.error("Error refreshing token:", error);
        }
      }

      return Promise.reject(error);
    }
  );
};
setupAxiosInterceptors();

app.use("/events", eventsRouter);

app.get("/", (req, res) => {
  res.send(
    "Hello! This is the Strava to get your bike waxed! 🚴‍♂️ - Version: " +
      APP_VERSION
  );
});

app.listen(PORT, () => {
  // app._router.stack.forEach(function (r) {
  //   if (r.route && r.route.path) {
  //     console.log(r.route.stack[0].method.toUpperCase(), r.route.path);
  //     //   console.log(r.route.methode, r.route.path);
  //   }
  // });
  // cache.set("refresh_token", INITIAL_REFRESH_TOKEN);
  logger.info(`App listening on port ${PORT}!`);
  cache.set("access_token", INITIAL_ACCESS_TOKEN);
  // console.log(`App listening at http://localhost:${PORT}`);
});
