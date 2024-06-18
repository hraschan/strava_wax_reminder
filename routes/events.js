const router = require("express").Router();
const NodeCache = require("node-cache");
const cache = new NodeCache();
const axios = require("axios");
const { getLastWaxedFromDB } = require("../services/Events");
const transporter = require("../nodemailer");
const logger = require("../logger");
const GEAR_ID = process.env.GEAR_ID || "";
const MY_STRAVA_ID = process.env.MY_STRAVA_ID || "";

const WAXING_INTERVAL = parseInt(process.env.WAXING_INTERVAL) || 300; // All 300 KMs
const calculateNextWaxing = (lastWaxed) => {
  return lastWaxed + WAXING_INTERVAL;
};

const isTimeToWax = (lastWaxed, currentKms) => {
  console.log("Current KMs:", currentKms);
  console.log("Next waxing:", calculateNextWaxing(lastWaxed));
  return currentKms >= calculateNextWaxing(lastWaxed);
};

const checkIfGearNeedsWaxing = async () => {
  const apiUrl = `https://www.strava.com/api/v3/gear/${GEAR_ID}`; // Replace with the actual API endpoint

  try {
    const accessToken = cache.get("access_token");
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const lastWaxed = await getLastWaxedFromDB();
    console.log("Last waxed:", lastWaxed);

    const needsWaxing = isTimeToWax(
      lastWaxed,
      response.data.converted_distance
    );

    if (needsWaxing) {
      const mailOptions = {
        from: "Strava <maximilian.hraschan@gmail.com>",
        to: "maximilian.hraschan@gmail.com",
        subject: "Dein Canyon CF7 braucht Wachs!",
        html: "<b><h1>Hey there!</h1> </b> <br>Dein Canyon CF7 muss wieder mit Wachs versorgt werden. Hier kannst du bestätigen, dass du das Rad auf Vordermann gebracht hast: <a href='https://strava.mhraschan.com'>Wieder fahrbereit</a><br/>",
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.error(err);
          logger.log("error", "Error sending email:", JSON.stringify(err));
        } else console.log(info);
      });
    }
    // Send email

    const responseMessage = needsWaxing
      ? "It's time to wax your bike"
      : "No need to wax your bike yet";

    logger.log("info", responseMessage);
    console.log(responseMessage);
  } catch (error) {
    logger.log("error", "Error making API request:", JSON.stringify(error));
    console.error("Error making API request:", error);
  }
};

router.post("/", async (req, res) => {
  console.log("POST EVENTS", req.body.owner_id, MY_STRAVA_ID);
  if (
    req.body.object_type === "activity" &&
    req.body.owner_id === parseInt(MY_STRAVA_ID)
  ) {
    console.log("Activity event received");
    await checkIfGearNeedsWaxing();
  }
  res.sendStatus(200);
});

router.get("/", (req, res) => {
  const challenge = req.query["hub.challenge"];

  console.log("GET EVENTS");
  res.json({
    "hub.challenge": challenge,
  });
});

module.exports = router;
