import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import csvData from './data.csv'; // Import your CSV data here
import './NBARosterGraph.css'; // Import your CSS file here

const NBA_RosterGraph = () => {
  const svgRef = useRef(null);
  const simulation = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Load CSV data
    d3.csv(csvData).then(data => {
      // Extract unique team names
      let teams = [...new Set([
        ...data.map(d => d['Visitor/Neutral']),
        ...data.map(d => d['Home/Neutral'])
      ])]

      console.log("TEAMS")
      console.log(teams);

      // Create data structure for nodes and links
      const nodes = teams.map((team, index) => ({ id: index, name: team }));

      console.log(nodes);

      const links = data.map(d => ({
        source: nodes.find(node => node.name === d['Visitor/Neutral']),
        target: nodes.find(node => node.name === d['Home/Neutral']),
        score: `${d.PTS} - ${d.PTS2}`
      }));

      console.log(links)
      // Set up simulation

      simulation.current = d3
        .forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-200))
        .force('link', d3.forceLink(links).distance(200))
        .force('center', d3.forceCenter(500, 500))
        .on('tick', () => {
          node.attr('cx', d => d.x).attr('cy', d => d.y);
          svg.selectAll('.link').attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        });



      // Draw links
      // Draw links with tooltips
      svg
        .selectAll('.link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('marker-end', 'url(#arrow)')
        .attr('stroke', 'black') // Set default color
        .attr('stroke-width', 1.5)
        .append('title') // Add a title element for the tooltip
        .text(d => d.score); // Set the text of the tooltip to the game score

      // // Event listeners for tooltips
      svg.selectAll('.link')
        .on('mouseover', function () {
          d3.select(this).attr('stroke', 'red'); // Change link color on hover
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke', 'black'); // Restore default link color on mouseout
        });


      // Draw nodes
      const node = svg
        .selectAll('.node')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', 15)
        .attr('fill', 'blue')
        .call(
          d3
            .drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)
        );

      // Append marker for arrow
      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '-5 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');

      // Click event handler for node centralization
      // node.on('click', function (event, d) {
      //   svg.selectAll('.node').classed('active', false);
      //   d3.select(this).classed('active', true);

      //   const targetNode = d3.select(this);
      //   const x = 500;
      //   const y = 500;
      //   targetNode.transition().duration(500).attr('cx', x).attr('cy', y);
      //   simulation.current.alpha(0.3).restart();
      // });


      // Functions for drag simulation
      function dragstarted(event, d) {
        if (!event.active) simulation.current.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.current.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    });
  }, []);

  return <svg ref={svgRef} width={1000} height={1000}></svg>;
};

export default NBA_RosterGraph;
