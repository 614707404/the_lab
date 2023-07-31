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
    mounted() {
      this.drawChart()
    },
    methods: {
      drawChart() {
        const margin = {top: 20, right: 20, bottom: 30, left: 50}
        const width = 960 - margin.left - margin.right
        const height = 500 - margin.top - margin.bottom
  
        const x = d3.scaleLinear().range([0, width])
        const y = d3.scaleLinear().range([height, 0])
  
        const line = d3.line()
          .x(d => x(d.x))
          .y(d => y(d.y))
  
        const svg = d3.select(this.$refs.chart).append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  
        x.domain(d3.extent(this.data, d => d.x))
        y.domain(d3.extent(this.data, d => d.y))
  
        svg.append('g')
          .attr('transform', 'translate(0,' + height + ')')
          .call(d3.axisBottom(x))
  
        svg.append('g')
          .call(d3.axisLeft(y))
  
        svg.append('path')
          .datum(this.data)
          .attr('fill', 'none')
          .attr('stroke', 'steelblue')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-width', 1.5)
          .attr('d', line)
      }
    },
    watch: {
      data() {
        this.drawChart()
      }
    }
  }
  </script>
  