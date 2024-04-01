// NBAChart.js

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NBA_RosterGraph = ({ data }) => {
  const svgRef = useRef();
  const [activeTeam, setActiveTeam] = useState(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 1500;
    const height = 1500;

    // Create a force simulation
    const simulation = d3
      .forceSimulation()
      .force('link', d3.forceLink().id((d) => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Process the data
    const nodes = [];
    const links = [];
    const teamMap = new Map();

    data.forEach((game) => {
      const awayTeam = game['Visitor/Neutral'];
      const homeTeam = game['Home/Neutral'];
      const score = `${game.PTS}-${game.PTS2}`;

      if (!teamMap.has(awayTeam)) {
        teamMap.set(awayTeam, { id: awayTeam, games: [] });
      }
      if (!teamMap.has(homeTeam)) {
        teamMap.set(homeTeam, { id: homeTeam, games: [] });
      }

      teamMap.get(awayTeam).games.push({ opponent: homeTeam, score });
      teamMap.get(homeTeam).games.push({ opponent: awayTeam, score });
    });

    teamMap.forEach((team) => {
      nodes.push(team);
      team.games.forEach((game) => {
        links.push({ source: team.id, target: game.opponent, score: game.score });
      });
    });

    // Draw the graph
    const link = svg
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', 'gray')
      .attr('marker-end', 'url(#arrowhead)');

    const node = svg
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 15)
      .attr('fill', (d) => (d.id === activeTeam ? 'blue' : 'orange'))
      .on('click', (event, d) => setActiveTeam(d.id));

    node.attr('data-team', (d) => d.id);

    simulation.nodes(nodes).on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });

    simulation.force('link').links(links);

    // Add arrowhead marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'gray');
  }, [data, activeTeam]);

  return (
    <svg ref={svgRef} width={1500} height={1500}>
      {/* Additional SVG elements can be added here */}
    </svg>
  );
};

export default NBA_RosterGraph;
