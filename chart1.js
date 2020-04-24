class Chart1 {
  d3;

  countries = [
    { name: "Italie", population: 60 * 1000000 },
    { name: "Espagne", population: 46 * 1000000 },
    { name: "États-Unis", population: 327 * 1000000 },
    { name: "Belgique", population: 11 * 1000000 },
    { name: "Royaume-Uni", population: 66 * 1000000 },
    { name: "Allemagne", population: 83 * 1000000 },
    { name: "Suède", population: 10 * 1000000 },
    { name: "France", population: 65 * 1000000 },
  ];

  nbFramesPerDay = 15;
  firstDayOffset = 0;
  svg;
  x;
  y;

  setup(d3, rawData, nbFramesPerDay) {
    this.d3 = d3;
    this.nbFramesPerDay = nbFramesPerDay;
    let flatten = this.countries
      .map((p) =>
        rawData.PaysData.filter((datum) => datum.Pays == p.name)
          .map((datum) => ({ ...datum, population: p.population }))
          .reverse()
      )
      .flat();
    let maxDeces = Math.max(
      ...flatten.map((d) => (d.Deces / d.population) * 1000000)
    );
    let maxInfection = Math.max(
      ...flatten.map((d) => (d.Infection / d.population) * 1000000)
    );

    let date = moment("2020-03-01T00:00:00");
    let today = moment();
    this.data = [];
    let from, to;
    while (!date.isAfter(today, "day")) {
      from = to;
      to = {
        date: moment(date),
        countries: this.countries.map((p) => {
          let datum = rawData.PaysData.find(
            (d) =>
              d.Pays == p.name && d.Date == date.format("YYYY-MM-DDTHH:mm:ss")
          );

          return {
            ...p,
            deces: datum.Deces,
            infections: datum.Infection,
          };
        }),
      };
      for (let i = 0; from && to && i <= this.nbFramesPerDay; i++) {
        let frameData = this._interpolate(from, to, i);
        this.data = [...this.data, frameData];
      }
      date = date.add(1, "days");
    }

    let width = 800;
    let height = 600;
    let margin = { bottom: 50, top: 50, left: 50, right: 50 };

    let svg = this.d3
      .select(".chart1")
      .style("background", "#ffffff")
      .style("width", width)
      .style("height", height)
      .style("font-size", "12px")
      .style("font-family", "arial")
      .style("font-weight", "bold")
      .attr("viewBox", [0, 0, width, height]);

    svg
      .append("text")
      .attr("x", width - margin.right - 150)
      .attr("y", margin.top - 25)
      .text("Source: politologue.com");

    svg
      .append("text")
      .attr("x", width - margin.right - 150)
      .attr("y", margin.top - 10)
      .text("Icons: flaticon.com");

    // xAxis - Deaths
    this.x = this.d3
      .scaleLinear()
      .domain([0, maxDeces])
      .range([margin.left, width - margin.right]);
    let xAxis = this.d3
      .axisTop(this.x)
      .tickSize(height - margin.top - margin.bottom);

    // yAxis - Infections
    this.y = this.d3
      .scaleLinear()
      .domain([0, maxInfection])
      .range([height - margin.bottom, margin.top]);
    let yAxis = this.d3
      .axisRight(this.y)
      .tickSize(width - margin.left - margin.right);

    // Grid - xAxis
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

    // Grid - yAxis
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

    // Flags
    svg
      .append("defs")
      .selectAll("pattern")
      .data(this.countries)
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
      .attr(
        "xlink:xlink:href",
        (p) => `http://localhost:8080/${p.name.toLowerCase()}.svg`
      );

    svg
      .selectAll(".chart1 .day")
      .data([this.data[this.firstDayOffset]])
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
      .data(this.data[this.firstDayOffset].countries)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("r", (d) => 20)
      .attr("cx", (d) => this.deces(d))
      .attr("cy", (d) => this.infection(d))
      .attr("stroke", "black")
      .attr("stroke-width", "1px")
      .attr("fill", (d) => {
        let v = `url(#${d.name.toLowerCase()})`;
        return v;
      });
    return this.data;
  }

  _interpolate(from, to, frame) {
    let coef = frame / this.nbFramesPerDay;
    return {
      ...(frame < this.nbFramesPerDay ? from : to),
      coef,
      countries: this.countries.map((country) => {
        let fromDatum = from.countries.find((p) => p.name == country.name);
        let toDatum = to.countries.find((p) => p.name == country.name);

        let deces = fromDatum.deces + (toDatum.deces - fromDatum.deces) * coef;
        let infections =
          fromDatum.infections +
          (toDatum.infections - fromDatum.infections) * coef;
        return {
          ...country,
          deces,
          infections,
        };
      }),
    };
  }

  update(day) {
    this.d3
      .selectAll(".chart1 .day")
      .data([this.data[day]])
      .text((d) => d.date.format("DD/MM/YYYY"));

    this.d3
      .selectAll(".chart1 .circle")
      .data(this.data[day].countries)
      .attr("cx", (d) => this.deces(d))
      .attr("cy", (d) => this.infection(d));
  }

  deces(datum) {
    return this.x((datum.deces / datum.population) * 1000000);
  }

  infection(datum) {
    return this.y((datum.infections / datum.population) * 1000000);
  }
}

module.exports = {
  Chart1: Chart1,
};
