<template>
  <div ref="chart"></div>
</template>

<script>
import * as d3 from 'd3'

export default {
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      svg: null,
      x: null,
      y: null,
      line: null,
      margin: {top: 20, right: 20, bottom: 30, left: 50},
      width: null,
      height: null
    }
  },
  mounted() {
    this.width = 960 - this.margin.left - this.margin.right
    this.height = 500 - this.margin.top - this.margin.bottom

    this.x = d3.scaleLinear().range([0, this.width])
    this.y = d3.scaleLinear().range([this.height, 0])

    this.line = d3.line()
      .x(d => this.x(d.x))
      .y(d => this.y(d.y))

    this.svg = d3.select(this.$refs.chart).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(this.x))

    this.svg.append('g')
      .call(d3.axisLeft(this.y))

    this.svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)

    this.drawChart()
  },
  methods: {
    drawChart() {
      this.x.domain(d3.extent(this.data, d => d.x))
      this.y.domain(d3.extent(this.data, d => d.y))

      this.svg.selectAll('g').remove()

      this.svg.append('g')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(d3.axisBottom(this.x))

      this.svg.append('g')
        .call(d3.axisLeft(this.y))

      this.svg.select('path')
        .datum(this.data)
        .attr('d', this.line)
    }
  },
  watch: {
    data() {
      this.drawChart()
    }
  }
}
</script>
