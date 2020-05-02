const Twitter = require("twitter-lite");
import * as fs from "fs";

const uploadClient = new Twitter({
  subdomain: "upload",
  consumer_key: process.env.TWITTER_CONSUMER_KEY || "",
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || "",
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const tweetClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY || "",
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || "",
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function tweet(gifFileName: string, txtFileName: string) {
  const gif = fs.readFileSync(gifFileName);
  const base64Image = new Buffer(gif).toString("base64");
  const mediaUploadResponse = await uploadClient.post("media/upload", {
    media_data: base64Image,
  });

  await tweetClient.post("statuses/update", {
    status: fs.readFileSync(txtFileName).toString(),
    media_ids: [mediaUploadResponse.media_id_string],
  });
}

if (process.argv.length != 4) {
  console.log("Invalid arguments : need gif file name and text file name.\n");
  process.exit(1);
}

let gifFileName = process.argv[2];
let txtFileName = process.argv[3];

tweet(gifFileName, txtFileName).catch(console.error);
