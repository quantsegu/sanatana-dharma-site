import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { categories } from '../data/content';
import { flattenItems } from '../utils/content';

const width = 1100;
const height = 820;
const centerX = width / 2;
const centerY = height / 2;

function createGraphData() {
  const topics = flattenItems();
  const catRadius = 230;
  const topicRadius = 350;

  const nodes = [];
  const links = [];

  categories.forEach((category, categoryIndex) => {
    const angle = (categoryIndex / categories.length) * Math.PI * 2;
    const catX = centerX + catRadius * Math.cos(angle);
    const catY = centerY + catRadius * Math.sin(angle);

    nodes.push({
      id: category.id,
      label: category.label,
      x: catX,
      y: catY,
      type: 'category',
      categoryId: category.id,
      icon: category.icon,
    });

    category.items.forEach((topic, topicIndex) => {
      const localAngle = angle + ((topicIndex - category.items.length / 2) * 0.13);
      const x = centerX + topicRadius * Math.cos(localAngle);
      const y = centerY + topicRadius * Math.sin(localAngle);

      nodes.push({
        id: topic.id,
        label: topic.title,
        x,
        y,
        type: 'topic',
        categoryId: category.id,
        icon: category.icon,
      });

      links.push({ source: category.id, target: topic.id, type: 'contains' });
    });
  });

  const topicNodes = nodes.filter((node) => node.type === 'topic');
  for (let i = 0; i < topicNodes.length - 1; i += 1) {
    if (topicNodes[i].categoryId !== topicNodes[i + 1].categoryId) {
      links.push({ source: topicNodes[i].id, target: topicNodes[i + 1].id, type: 'cross' });
    }
  }

  return { nodes, links, topics };
}

export default function KnowledgeGraphPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredNode, setHoveredNode] = useState(null);
  const graph = useMemo(() => createGraphData(), []);
  const [nodes, setNodes] = useState(() => graph.nodes.map((node) => ({ ...node })));
  const simulationRef = useRef(null);
  const svgRef = useRef(null);
  const dragStateRef = useRef({ id: null });
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  useEffect(() => {
    const simNodes = graph.nodes.map((node) => ({ ...node }));
    const simLinks = graph.links.map((link) => ({ ...link }));

    const simulation = forceSimulation(simNodes)
      .force('charge', forceManyBody().strength(-90))
      .force('center', forceCenter(centerX, centerY))
      .force('collide', forceCollide().radius((node) => (node.type === 'category' ? 34 : 16)).strength(0.8))
      .force('link', forceLink(simLinks).id((node) => node.id).distance((link) => (link.type === 'contains' ? 80 : 140)).strength((link) => (link.type === 'contains' ? 0.6 : 0.15)))
      .alpha(1)
      .alphaDecay(0.03)
      .on('tick', () => {
        setNodes([...simNodes]);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graph]);

  const visibleNodes = nodes.filter((node) => (activeCategory === 'all' ? true : node.categoryId === activeCategory));
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleLinks = graph.links.filter((link) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  function pointFromEvent(event) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function onNodePointerDown(event, node) {
    event.preventDefault();
    dragStateRef.current.id = node.id;
    const simulation = simulationRef.current;
    const liveNode = simulation?.nodes().find((current) => current.id === node.id);
    if (!simulation || !liveNode) return;

    const point = pointFromEvent(event);
    if (!point) return;

    liveNode.fx = point.x;
    liveNode.fy = point.y;
    simulation.alphaTarget(0.2).restart();
  }

  function onPointerMove(event) {
    const dragId = dragStateRef.current.id;
    if (!dragId) return;
    const simulation = simulationRef.current;
    const liveNode = simulation?.nodes().find((current) => current.id === dragId);
    if (!simulation || !liveNode) return;

    const point = pointFromEvent(event);
    if (!point) return;

    liveNode.fx = Math.max(40, Math.min(width - 40, point.x));
    liveNode.fy = Math.max(40, Math.min(height - 40, point.y));
    simulation.alphaTarget(0.2).restart();
  }

  function onPointerUp() {
    const dragId = dragStateRef.current.id;
    if (!dragId) return;

    const simulation = simulationRef.current;
    const liveNode = simulation?.nodes().find((current) => current.id === dragId);
    if (liveNode) {
      liveNode.fx = null;
      liveNode.fy = null;
    }

    dragStateRef.current.id = null;
    if (simulation) {
      simulation.alphaTarget(0);
    }
  }

  return (
    <section className="page-body graph-page">
      <div className="toolbox graph-toolbox">
        <h1>Knowledge Graph</h1>
        <p>
          Force-directed graph with drag physics. Hover nodes to inspect context, drag to reorganize, click a topic to open it.
        </p>
        <div className="toolbox-controls">
          <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.icon} {category.label}</option>
            ))}
          </select>
          {hoveredNode?.type === 'topic' ? (
            <Link className="cta-button" to={`/topic/${hoveredNode.id}`}>Open Topic</Link>
          ) : (
            <Link className="cta-button ghost" to="/explore">Open Explorer</Link>
          )}
        </div>
      </div>

      <div className="graph-wrapper">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Interactive Sanatana Dharma knowledge graph"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <defs>
            <radialGradient id="bgGlow" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="rgba(220, 174, 89, 0.22)" />
              <stop offset="100%" stopColor="rgba(47, 19, 40, 0.07)" />
            </radialGradient>
          </defs>
          <rect width={width} height={height} fill="url(#bgGlow)" />

          {visibleLinks.map((link) => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            const source = nodeMap.get(sourceId);
            const target = nodeMap.get(targetId);
            if (!source || !target) return null;
            return (
              <line
                key={`${sourceId}-${targetId}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={link.type === 'contains' ? 'rgba(194, 87, 26, 0.35)' : 'rgba(107, 29, 42, 0.14)'}
                strokeWidth={link.type === 'contains' ? 1.6 : 1}
              />
            );
          })}

          {visibleNodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onPointerDown={(event) => onNodePointerDown(event, node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => {
                if (node.type === 'topic') {
                  navigate(`/topic/${node.id}`);
                }
              }}
              style={{ cursor: node.type === 'topic' ? 'pointer' : 'grab' }}
            >
              <circle
                r={node.type === 'category' ? 20 : 10}
                fill={node.type === 'category' ? '#6B1D2A' : '#C2571A'}
                stroke="#FDF6EC"
                strokeWidth={2}
              />
              {node.type === 'category' ? (
                <text y={5} textAnchor="middle" fontSize="12" fill="#FDF6EC">{node.icon}</text>
              ) : null}
              <text
                y={node.type === 'category' ? 34 : 18}
                textAnchor="middle"
                fontSize={node.type === 'category' ? 11 : 9}
                fill="#3D2417"
                style={{ pointerEvents: 'none' }}
              >
                {node.label.length > (node.type === 'category' ? 20 : 25)
                  ? `${node.label.slice(0, node.type === 'category' ? 20 : 25)}...`
                  : node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="graph-inspector">
        {hoveredNode ? (
          <>
            <h3>{hoveredNode.label}</h3>
            <p>{hoveredNode.type === 'category' ? 'Category node' : 'Topic node'}</p>
            {hoveredNode.type === 'topic' ? (
              <Link className="back-btn" to={`/topic/${hoveredNode.id}`}>Read this topic →</Link>
            ) : (
              <p>Select a topic node to open full article content.</p>
            )}
          </>
        ) : (
          <p>Hover any node to inspect it.</p>
        )}
      </div>
    </section>
  );
}
