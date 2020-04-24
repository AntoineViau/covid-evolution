const express = require("express");
const app = express();
app.use(express.static("./"));
app.listen(3000);

const fs = require("fs");
const d3 = require("d3");
moment = require("moment");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fakeDom = new JSDOM(`
<!DOCTYPE html><html>
<body>
  <div class="chart1-container">  
    <svg class="chart1"></svg>
  </div>
</body>
</html>`);

document = fakeDom.window.document;

const Chart1 = require("./chart1.js");
const chart1 = new Chart1.Chart1();
const rawData = fs.readFileSync("data.json");
const json = JSON.parse(rawData);
const nbFramesPerDay = 15;
chart1.setup(d3, json, nbFramesPerDay);

const { createConverter } = require("convert-svg-to-png");
const converter = createConverter();

(async () => {
  let png;
  let frame;
  for (frame = 0; frame < chart1.data.length; frame++) {
    chart1.update(frame);
    const svgCode = d3.select(".chart1-container").html();
    fs.writeFileSync(
      `./tmp/svg/out${frame.toString().padStart(6, "0")}.svg`,
      svgCode
    );
    png = await converter.convert(svgCode, {
      width: 800,
      height: 600,
    });
    fs.writeFileSync(
      `./tmp/png/out${frame.toString().padStart(6, "0")}.png`,
      png
    );
    process.stdout.write(
      Math.ceil((frame / chart1.data.length) * 100) + "% : " + frame + "\r"
    );
  }

  process.stdout.write("\n");

  process.stdout.write("Writing trailing frames...\n");
  for (let i = 0; i < nbFramesPerDay * 10; i++) {
    let fileName = `./tmp/png/out${(frame + i)
      .toString()
      .padStart(6, "0")}.png`;
    fs.writeFileSync(fileName, png);
  }

  converter.destroy();
  process.exit(0);
})();
