var delay = 500;
var firstDay = 25;
var pays = [
  { name: "Italie", population: 60 * 1000000 },
  { name: "Espagne", population: 46 * 1000000 },
  { name: "États-Unis", population: 327 * 1000000 },
  { name: "Royaume-Uni", population: 66 * 1000000 },
  { name: "Allemagne", population: 83 * 1000000 },
  { name: "Suède", population: 10 * 1000000 },
  { name: "France", population: 65 * 1000000 },
];

let rawData;
var svg;

fetch("data.json")
  .then((response) => response.json())
  .then((json) => {
    setup(json);
    go();
  })
  .catch((e) => console.log("fetch error:", e));

function go() {
  setTimeout(() => update(firstDay), delay);
}

function setup(rawData) {
  data = pays.map((p) =>
    rawData.PaysData.filter((datum) => datum.Pays == p.name).reverse()
  );
  data.forEach((pays) => {
    pays[0].newDeces = 0;
    pays[0].newInfections = 0;
    for (let i = 1; i < pays.length; i++) {
      pays[i].newDeces = pays[i].Deces - pays[i - 1].Deces;
      pays[i].newInfections = pays[i].Infection - pays[i - 1].Infection;
    }
  });

  console.log(data);

  maxDeces = 28000;
  maxInfection = 650000;

  let date = moment("2020-02-01T00:00:00");
  let today = moment().format("YYYY-MM-DDT00:00:00");
  nbDays = 100;
  let out = [];
  for (day = 0; day < nbDays; day++) {
    if (date.format("YYYY-MM-DDTHH:mm:ss") == today) {
      break;
    }
    dateStr = date.format("YYYY-MM-DDTHH:mm:ss");
    let obj = {
      date: date,
      dateStr: date.format("YYYY-MM-DDTHH:mm:ss"),
      pays: pays.map((p) => {
        return {
          ...p,
          datum: rawData.PaysData.find(
            (d) =>
              d.Pays == p.name && d.Date == date.format("YYYY-MM-DDTHH:mm:ss")
          ),
        };
      }),
    };
    out = [...out, obj];
    date = date.add(1, "days");
  }
  data = out;
  console.log(data);

  width = 800;
  height = 600;
  margin = { bottom: 50, top: 50, left: 50, right: 50 };

  // DECES
  x = d3
    .scaleLinear()
    .domain([0, maxDeces])
    .range([margin.left, width - margin.right]);
  let xAxis = d3.axisTop(x).tickSize(height - margin.top - margin.bottom);

  // INFECTIONS
  y = d3
    .scaleLinear()
    .domain([0, maxInfection])
    .range([height - margin.bottom, margin.top]);
  let yAxis = d3.axisRight(y).tickSize(width - margin.left - margin.right);

  svg = d3
    .select("svg")
    .style("background", "#ffffff")
    .style("width", width)
    .style("height", height)
    .attr("viewBox", [0, 0, width, height]);

  svg
    .append("g")
    .attr("transform", `translate(${0},${height - margin.bottom})`)
    .call(xAxis)
    .call((g) => {
      g.selectAll(".tick:nth-child(even) line").style("display", "none");
      return g
        .selectAll(".tick:nth-child(odd) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2");
    })
    .call((g) =>
      g
        .selectAll(".tick text")
        .attr("x", 0)
        .attr("dy", height - margin.top - margin.bottom + 20)
    )
    .append("text")
    .attr("x", width - margin.right - 40)
    .attr("y", (3 * margin.bottom) / 4)
    .attr("fill", "currentColor")
    .attr("text-anchor", "start")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Death");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},${0})`)
    .call(yAxis)
    .call((g) => {
      g.selectAll(".tick:nth-child(even) line").style("display", "none");
      return g
        .selectAll(".tick:nth-child(odd) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2");
    })
    .call((g) => g.selectAll(".tick text").attr("x", -40).attr("dy", -4))
    .append("text")
    .attr("x", -margin.left * 0.75)
    .attr("y", margin.top / 2)
    .attr("fill", "currentColor")
    .attr("text-anchor", "start")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Cases");

  svg
    .append("defs")
    .selectAll("pattern")
    .data(pays)
    .enter()
    .append("pattern")
    .attr("id", (p) => `${p.name.toLowerCase()}`)
    .attr("x", "0%")
    .attr("y", "0%")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 512 512")
    .append("image")
    .attr("x", "0%")
    .attr("y", "0%")
    .attr("width", "512")
    .attr("height", "512")
    .attr("xlink:xlink:href", (p) => `${p.name.toLowerCase()}.svg`);

  svg
    .selectAll("day")
    .data([0])
    .enter()
    .append("text")
    .attr("class", "day")
    .attr("x", width / 2 - 100)
    .attr("y", height / 2)
    .attr("fill", "currentColor")
    .attr("text-anchor", "start")
    .style("font-family", "arial")
    .style("font-size", "30px")
    .style("font-weight", "bold")
    .style("letter-spacing", "2px")
    .text((d) => dayf(d));

  svg
    .selectAll("circle")
    .data(valueAtDay(firstDay))
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("r", (d) => 20)
    .attr("cx", infection)
    .attr("cy", deces)
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .attr("fill", (d) => {
      let v = `url(#${d.name.toLowerCase()})`;
      return v;
    });
}

function update(day) {
  d3.selectAll(".day")
    .data(valueAtDay(day))
    .text((d) => dayf(d));

  d3.selectAll(".circle")
    .data(valueAtDay(day))
    .transition(d3.transition().duration(delay).ease(d3.easeLinear))
    .attr("cx", deces)
    .attr("cy", infection);

  // if (day > firstDay) {
  //   svg
  //     .selectAll(".line" + day)
  //     .data(valueAtDay(day))
  //     .enter()
  //     .append("line")
  //     .attr("x1", (d) => {
  //       let v = deces(valueAtDay(day - 1)[0]);
  //       return v;
  //     })
  //     .attr("y1", (d) => {
  //       let v = infection(valueAtDay(day - 1)[0]);
  //       return v;
  //     })
  //     .attr("x2", deces)
  //     .attr("y2", infection)
  //     .attr("stroke", "#cccccc")
  //     .attr("stroke-width", "1px")
  //     .attr("fill", "none");
  // }
  if (day + 1 == data.length) {
    return;
  }
  setTimeout(() => update(day + 1), delay);
}

function valueAtDay(day) {
  let v = data[day].pays;
  return v;
}

function deces(datum) {
  if (!datum || !datum.datum) {
    return;
  }

  let p = pays.find((p) => p.name == datum.name);
  let v = x((datum.datum.Deces / p.population) * 1000000);
  v = x(datum.datum.Deces)
  return v;
}

function infection(datum) {
  if (!datum || !datum.datum) {
    return;
  }
  let p = pays.find((p) => p.name == datum.name);
  let v = y((datum.datum.Infection / p.population) * 1000000);
  v = y(datum.datum.Infection)
  return v;
}

function dayf(datum) {
  if (!datum || !datum.datum) {
    return;
  }
  return moment(datum.datum.Date).format("DD/MM/YYYY");
}
