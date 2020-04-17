class Chart1 {
  pays = [
    { name: "Italie", population: 60 * 1000000 },
    { name: "Espagne", population: 46 * 1000000 },
    { name: "États-Unis", population: 327 * 1000000 },
    { name: "Royaume-Uni", population: 66 * 1000000 },
    { name: "Allemagne", population: 83 * 1000000 },
    { name: "Suède", population: 10 * 1000000 },
    { name: "France", population: 65 * 1000000 },
  ];

  delay = 250;
  firstDay = 25;
  svg;
  x;
  y;

  go() {
    fetch("data.json")
      .then((response) => response.json())
      .then((json) => {
        this.setup(json);
        setTimeout(() => this.update(this.firstDay), this.delay);
      })
  }

  setup(rawData) {
    this.data = this.pays.map((p) =>
      rawData.PaysData.filter((datum) => datum.Pays == p.name).map(datum => ({ ...datum, population: p.population })).reverse()
    );
    let maxDeces = Math.max(...this.data.flat().map(d => d.Deces / d.population * 1000000));
    let maxInfection = Math.max(...this.data.flat().map(d => d.Infection / d.population * 1000000));

    let date = moment("2020-02-01T00:00:00");
    let today = moment().format("YYYY-MM-DDT00:00:00");
    let nbDays = 200;
    let out = [];
    for (let day = 0; day < nbDays; day++) {
      if (date.format("YYYY-MM-DDTHH:mm:ss") == today) {
        break;
      }
      let obj = {
        date: moment(date),
        dateStr: date.format("YYYY-MM-DDTHH:mm:ss"),
        pays: this.pays.map((p) => {
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
    this.data = out;

    let width = 800;
    let height = 600;
    let margin = { bottom: 50, top: 50, left: 50, right: 50 };

    // DECES
    this.x = d3
      .scaleLinear()
      .domain([0, maxDeces])
      .range([margin.left, width - margin.right]);
    let xAxis = d3.axisTop(this.x).tickSize(height - margin.top - margin.bottom);

    // INFECTIONS
    this.y = d3
      .scaleLinear()
      .domain([0, maxInfection])
      .range([height - margin.bottom, margin.top]);
    let yAxis = d3.axisRight(this.y).tickSize(width - margin.left - margin.right);

    let svg = d3
      .select(".chart1")
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
      .attr("x", width - margin.right - 50)
      .attr("y", (3 * margin.bottom) / 4)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Deaths/1M");

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
      .text("Cases/1M");

    svg
      .append("defs")
      .selectAll("pattern")
      .data(this.pays)
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
      .selectAll(".chart1 .day")
      .data([this.data[this.firstDay]])
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
      .text((d) => d.date.format("DD/MM/YYYY"));

    svg
      .selectAll(".chart1 .circle")
      .data(this.data[this.firstDay].pays)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("r", (d) => 20)
      .attr("cx", d => this.infection(d))
      .attr("cy", d => this.deces(d))
      .attr("stroke", "black")
      .attr("stroke-width", "1px")
      .attr("fill", (d) => {
        let v = `url(#${d.name.toLowerCase()})`;
        return v;
      });
  }

  update(day) {
    d3.selectAll(".chart1 .day")
      .data([this.data[day]])
      .text((d) => d.date.format("DD/MM/YYYY"));

    d3.selectAll(".chart1 .circle")
      .data(this.data[day].pays)
      .transition(d3.transition().duration(this.delay).ease(d3.easeLinear))
      .attr("cx", d => this.deces(d))
      .attr("cy", d => this.infection(d));

    if (day + 1 == this.data.length) {
      return;
    }
    setTimeout(() => this.update(day + 1), this.delay);
  }

  deces(datum) {
    let p = this.pays.find((p) => p.name == datum.name);
    let v = this.x((datum.datum.Deces / p.population) * 1000000);
    return v;
  }

  infection(datum) {
    let p = this.pays.find((p) => p.name == datum.name);
    let v = this.y((datum.datum.Infection / p.population) * 1000000);
    return v;
  }
}

