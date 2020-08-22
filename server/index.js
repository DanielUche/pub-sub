const express = require("express");
const bodyParser = require("body-parser");

const db = require("./db/models");
const SubScriptionQueue = require("./queue");


const queue = new SubScriptionQueue();
const app = express();
const port = process.env.PORT || "8000";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("You are here pub/sub api. Welcome");
});

app.post("/event", (req, res) => {
  console.log("Event received: ", req.body);
  res.status(200).send("OK!");
});

app.post("/subscribe/:topic", async (req, res) => {
  try {
    const { url } = JSON.parse(Object.keys(req.body)[0]);
    const { topic: t } = req.params;

    if (!url) {
      res.status(400).send("Bad Request! Provide callback url");
    }

    const [topic, created] = await db.Topic.findOrCreate({
      where: { name: t },
      defaults: {
        name: t,
      },
    });

    await db.Subscription.findOrCreate({
      where: { topic_id: topic.id, url },
      defaults: {
        topic_id: topic.id,
        url,
      },
    });
    res.status(200).send("OK");
  } catch (error) {
    res.status(400).send("Bad Request!");
  }
});

app.post("/publish/:topic", async (req, res) => {
  const { topic } = req.params;
  const message = req.body;
  try {
    let savedTopic = await db.Topic.findOne({
      where: { name: topic },
      raw: true,
    });

    if (!savedTopic) {
      throw new Error("Topic not found");
    }

    const subscriptions = await db.Subscription.findAll({
      where: { topic_id: savedTopic.id },
      attributes: ["url"],
      raw: true,
    });

    const callbackURLs = [];
    for (let i = 0; i < subscriptions.length; i++) {
      callbackURLs.push(subscriptions[i].url);
    }

    /* ========== Use Queue to send/notify subscribing parties =========== */
    queue.addUrlsToQueue({
      urls: callbackURLs,
      message,
    });

    /* This works as well but we do not want sending out notifications 
        to block the event table. So we send this operation to the background
       await axios.all(callbackURLs.map((url) => axios.post(url, message)));
     */

    res.status(200).send("OK");
  } catch (error) {
    console.log(error);
    res.status(400).send("Bad Request");
  }
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
