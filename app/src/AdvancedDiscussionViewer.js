import React, { useState, useEffect, useRef, useTransition } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsUp, ChevronsDown } from 'lucide-react';
import DOMPurify from 'dompurify';
import * as d3 from 'd3';

const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
};

const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp * 1000);
  const diffInHours = (now - postTime) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return `${Math.round(diffInHours)} hours ago`;
  } else {
    return postTime.toLocaleString();
  }
};

const formatFullTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

const Tile = ({ content, isActive, transitionState }) => {
  const [showFullTime, setShowFullTime] = useState(false);

  if (!content) {
    return (
      <div className={`p-6 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${
        isActive ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200'
      } border border-gray-200 shadow-lg ${
        transitionState === 'entering' ? 'opacity-0 scale-95' :
          transitionState === 'entered' ? 'opacity-100 scale-100' :
            transitionState === 'exiting' ? 'opacity-0 scale-105' :
              'opacity-0 scale-95'
      }`}>
        <p className={`${isActive ? 'text-white' : 'text-gray-600'}`}>Empty</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${
      isActive ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200'
    } border border-gray-200 shadow-lg ${
      transitionState === 'entering' ? 'opacity-0 scale-95' :
        transitionState === 'entered' ? 'opacity-100 scale-100' :
          transitionState === 'exiting' ? 'opacity-0 scale-105' :
            'opacity-0 scale-95'
    }`}>
      <h3 className="font-bold text-lg mb-2">
        {content.deleted ? '[Deleted]' : content.by || 'Anonymous'} - {' '}
        <span
          onMouseEnter={() => setShowFullTime(true)}
          onMouseLeave={() => setShowFullTime(false)}
        >
          {showFullTime
            ? formatFullTime(content.time)
            : formatRelativeTime(content.time)
          }
        </span>
      </h3>
      {content.title && <h4 className="font-semibold mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.title) }} />}
      {content.text && !content.deleted && (
        <div
          className={`${isActive ? 'text-white' : 'text-gray-800'}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.text) }}
        />
      )}
      {content.deleted && <p className={`${isActive ? 'text-white' : 'text-gray-600'}`}>[Content deleted]</p>}
      {!content.text && !content.title && !content.deleted && <p className={`${isActive ? 'text-white' : 'text-gray-600'}`}>No content</p>}
    </div>
  );
};
const TreeVisualization = ({ treeData, focusedNodeId }) => {
  const svgRef = useRef();
  const margin = { top: 20, right: 90, bottom: 30, left: 90 };
  const width = 400 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  useEffect(() => {
    if (!treeData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tree = d3.tree().size([height, width]);
    const root = d3.hierarchy(treeData);
    tree(root);

    const link = g.selectAll(".link")
      .data(root.descendants().slice(1))
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d => `
        M${d.y},${d.x}
        C${(d.y + d.parent.y) / 2},${d.x}
         ${(d.y + d.parent.y) / 2},${d.parent.x}
         ${d.parent.y},${d.parent.x}
      `)
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 5)
      .attr("fill", d => d.data.name === focusedNodeId ? "#fd79a8" : "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => d.children ? -13 : 13)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .style("font-size", "10px");
  }, [treeData, focusedNodeId]);

  return (
    <svg ref={svgRef} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}></svg>
  );
};

const AdvancedDiscussionViewer = () => {
  const [currentView, setCurrentView] = useState({
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    bottomRight: null,
    focusedIndex: -1, // -1 means no focus (stories at bottom)
  });
  const [isPending, startTransition] = useTransition();
  const [transitionState, setTransitionState] = useState('entered');
  const [error, setError] = useState(null);
  const [topStories, setTopStories] = useState([]);
  const [currentTopStoryIndex, setCurrentTopStoryIndex] = useState(0);
  const [treeData, setTreeData] = useState(null);

  const fetchTopStories = async () => {
    try {
      const response = await fetch('http://localhost:8080/wave/api/v1.0/topStories?limit=30');
      if (!response.ok) throw new Error('Failed to fetch top stories');
      const data = await response.json();
      setTopStories(data);
    } catch (error) {
      console.error('Error fetching top stories:', error);
      setError('Failed to fetch top stories. Please try again.');
    }
  };

  const fetchPostData = async (postId) => {
    if (typeof postId === 'object' && postId !== null) {
      postId = postId.id || postId.name;  // Assuming the object has an 'id' or 'name' property
    }
    if (typeof postId !== 'string' && typeof postId !== 'number') {
      console.error('Invalid post ID type:', typeof postId, postId);
      setError('Invalid post ID');
      return null;
    }
    try {
      const response = await fetch(`http://localhost:8080/wave/api/v1.0/search?post=${postId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching post data:', error);
      setError('Failed to fetch post data. Please check your connection and try again.');
      return null;
    }
  };

  const fetchChildren = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8080/wave/api/v1.0/children?post=${postId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.children;
    } catch (error) {
      console.error('Error fetching children:', error);
      setError('Failed to fetch children. Please try again.');
      return [];
    }
  };

  const updateView = async (newView) => {
    setTransitionState('exiting');
    setTimeout(() => {
      setTransitionState('entering');
      startTransition(() => {
        setCurrentView(newView);
      });
      setTimeout(() => setTransitionState('entered'), 50);
    }, 150);

    if (newView.focusedIndex !== -1) {
      try {
        const focusedItem = newView.focusedIndex === 0 ? newView.topLeft : newView.topRight;
        if (focusedItem && focusedItem.id) {
          const updatedTreeData = await buildTreeData(focusedItem.id);
          setTreeData(updatedTreeData);
        } else {
          setTreeData(null);
        }
      } catch (error) {
        console.error('Error updating tree data:', error);
        setError('Failed to update tree visualization. Please try again.');
      }
    } else {
      setTreeData(null);
    }
  };
  const buildTreeData = async (rootId) => {
    const buildNode = async (id, depth = 0) => {
      if (depth > 2) {  // Limit depth to prevent excessive API calls
        return { name: id, children: [] };
      }
      try {
        const post = await fetchPostData(id);
        if (!post) {
          console.error(`Failed to fetch post data for ID: ${id}`);
          return { name: id, children: [] };
        }
        const children = post.kids || [];
        const childNodes = await Promise.all(
          children.slice(0, 5).map(childId => buildNode(childId, depth + 1))
        );
        return { name: id, children: childNodes };
      } catch (error) {
        console.error(`Error building node for ID ${id}:`, error);
        return { name: id, children: [] };
      }
    };

    return await buildNode(rootId);
  };

  const handleKeyDown = async (e) => {
    if (isPending) return;

    const newView = { ...currentView };

    switch (e.key) {
      case 'ArrowUp':
        if (newView.focusedIndex === -1 && (newView.bottomLeft || newView.bottomRight)) {
          // Move bottom item to top-left and fetch its children
          const focusedItem = newView.bottomLeft || newView.bottomRight;
          const children = await fetchChildren(focusedItem.id);
          newView.topLeft = focusedItem;
          newView.topRight = null;
          newView.bottomLeft = children[0] || null;
          newView.bottomRight = children[1] || null;
          newView.focusedIndex = 0;
        }
        break;
      case 'ArrowDown':
        if (newView.focusedIndex !== -1) {
          // Move focused item back to bottom and reset top row
          if (newView.focusedIndex === 0) {
            newView.bottomLeft = newView.topLeft;
            newView.bottomRight = newView.topRight;
          } else {
            newView.bottomLeft = newView.topRight;
            newView.bottomRight = await fetchPostData(topStories[(currentTopStoryIndex + 1) % topStories.length]);
          }
          newView.topLeft = null;
          newView.topRight = null;
          newView.focusedIndex = -1;
        } else {
          // Cycle to next top story
          const newIndex = (currentTopStoryIndex + 1) % topStories.length;
          setCurrentTopStoryIndex(newIndex);
          newView.bottomLeft = await fetchPostData(topStories[newIndex]);
          newView.bottomRight = await fetchPostData(topStories[(newIndex + 1) % topStories.length]);
        }
        break;
      case 'ArrowLeft':
        if (newView.focusedIndex === 1) {
          newView.focusedIndex = 0;
        } else if (newView.focusedIndex === -1 && currentTopStoryIndex > 0) {
          const newIndex = (currentTopStoryIndex - 1 + topStories.length) % topStories.length;
          setCurrentTopStoryIndex(newIndex);
          newView.bottomLeft = await fetchPostData(topStories[newIndex]);
          newView.bottomRight = await fetchPostData(topStories[(newIndex + 1) % topStories.length]);
        }
        break;
      case 'ArrowRight':
        if (newView.focusedIndex === 0 && newView.topRight) {
          newView.focusedIndex = 1;
        } else if (newView.focusedIndex === -1) {
          const newIndex = (currentTopStoryIndex + 1) % topStories.length;
          setCurrentTopStoryIndex(newIndex);
          const nextStory = await fetchPostData(topStories[newIndex]);
          const nextNextStory = await fetchPostData(topStories[(newIndex + 1) % topStories.length]);
          if (nextStory) newView.bottomLeft = nextStory;
          if (nextNextStory) newView.bottomRight = nextNextStory;
        }
        break;
    }

    await updateView(newView);
  };

  useEffect(() => {
    fetchTopStories();
  }, []);

  useEffect(() => {
    const initializeView = async () => {
      if (topStories.length > 0) {
        try {
          const firstStory = await fetchPostData(topStories[0]);
          const secondStory = await fetchPostData(topStories[1]);
          setCurrentView({
            topLeft: null,
            topRight: null,
            bottomLeft: firstStory,
            bottomRight: secondStory,
            focusedIndex: -1,
          });
        } catch (error) {
          console.error('Error initializing view:', error);
          setError('Failed to initialize view. Please refresh the page.');
        }
      }
    };

    initializeView();
  }, [topStories]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, isPending, topStories, currentTopStoryIndex]);

  const canNavigateUp = currentView.focusedIndex === -1 && (currentView.bottomLeft || currentView.bottomRight);
  const canNavigateDown = currentView.focusedIndex !== -1 || topStories.length > 1;
  const canNavigateLeft = (currentView.focusedIndex === 1) || (currentView.focusedIndex === -1 && currentTopStoryIndex > 0);
  const canNavigateRight = (currentView.focusedIndex === 0 && currentView.topRight) || (currentView.focusedIndex === -1 && topStories.length > 1);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen w-screen flex flex-col p-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100" tabIndex={0}>
      <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
        Hierarchical Discussion Explorer
      </h1>
      <div className="flex">
        <div className="grid grid-cols-2 grid-rows-2 gap-6 flex-grow">
          <Tile content={currentView.topLeft} isActive={currentView.focusedIndex === 0} transitionState={transitionState} />
          <Tile content={currentView.topRight} isActive={currentView.focusedIndex === 1} transitionState={transitionState} />
          <Tile content={currentView.bottomLeft} isActive={currentView.focusedIndex === -1} transitionState={transitionState} />
          <Tile content={currentView.bottomRight} isActive={false} transitionState={transitionState} />
        </div>
        <div className="ml-6 flex-shrink-0">
          <TreeVisualization treeData={treeData} focusedNodeId={currentView.focusedIndex !== -1 ? currentView.topLeft?.id : null} />
        </div>
      </div>
      <div className="fixed bottom-8 right-8 flex gap-4 bg-white bg-opacity-70 p-4 rounded-full shadow-lg">
        <ChevronUp
          size={32}
          className={`${canNavigateUp ? 'text-purple-600 hover:text-pink-600 cursor-pointer' : 'text-gray-400'} transition-colors duration-300`}
          title="Navigate to child"
        />
        <ChevronDown
          size={32}
          className={`${canNavigateDown ? 'text-purple-600 hover:text-pink-600 cursor-pointer' : 'text-gray-400'} transition-colors duration-300`}
          title="Navigate to parent or next story"
        />
        <ChevronLeft
          size={32}
          className={`${canNavigateLeft ? 'text-purple-600 hover:text-pink-600 cursor-pointer' : 'text-gray-400'} transition-colors duration-300`}
          title="Previous item or story"
        />
        <ChevronRight
          size={32}
          className={`${canNavigateRight ? 'text-purple-600 hover:text-pink-600 cursor-pointer' : 'text-gray-400'} transition-colors duration-300`}
          title="Next item or story"
        />
      </div>
    </div>
  );
};

export default AdvancedDiscussionViewer;