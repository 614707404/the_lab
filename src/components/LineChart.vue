<template>
  <div>
    <div class="legend">
      <div v-for="(dataset, index) in datasets" :key="index" class="legend-item">
        <div :style="{ background: colors[index] }" class="color-box"></div>
        <div>{{ dataset.name }}</div>
      </div>
    </div>
    <svg ref="svg" :width="width" :height="height"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "LineChart",
  props: {
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 180
    },
    datasets: {
      type: Array,
      required: true
    },
    xData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      colors: d3.schemeCategory10
    };
  },
  watch: {
    datasets: {
      handler() {
        this.drawChart();
      },
      deep: true
    }
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    drawChart() {
      const svg = d3.select(this.$refs.svg);
      svg.selectAll("*").remove();

      const yMax = d3.max(this.datasets, d => Math.ceil(d3.max(d.data)));
      const xMax = this.xData.length > 0 ? this.xData.length - 1 : 0;

      const xScale = d3.scaleLinear().domain([0, xMax]).range([10, this.width - 10]);
      const yScale = d3.scaleLinear().domain([0, yMax]).range([this.height - 10, 10]).nice();

      const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat((d, i) => this.xData[i]);
      const yAxis = d3.axisLeft(yScale).tickFormat(d3.format("d"));

      svg.append("g").attr("transform", `translate(0,${this.height - 10})`).call(xAxis);
      svg.append("g").attr("transform", "translate(10,0)").call(yAxis);

      if (this.xData.length > 0) {
        this.datasets.forEach((dataset, index) => {
          const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d));

          svg.append("path")
            .attr("fill", "none")
            .attr("stroke", this.colors[index])
            .attr("stroke-width", 2)
            .attr("d", line(dataset.data));
        });
      }
    }

  }
};

</script>

<style scoped>
.legend {
  display: flex;
  flex-direction: column; /* This will stack the legend items vertically */
  margin-left: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px; /* Add space between legend items */
}

.color-box {
  width: 10px;
  height: 10px;
  margin-right: 5px;
}
</style>

