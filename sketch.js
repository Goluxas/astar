class Node {
  f_cost; // g + h
  g_cost; // (best) distance to start
  h_cost; // distance to target (heuristic)
  parent; // the node that calculated these values

  constructor(x, y, walkable) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
    //this.parent = null;
  }

  get f_cost() {
    return this.g_cost + this.h_cost
  }
}

let grid_width;
let grid_height;
let box_width;
let box_height;
let margin;

let world;
let start_node;
let target_node;
let current_node;

let path;
let open;
let closed;

let MAX_ITERATIONS = 10000;

function setup() {
  let canvas_width = floor(windowWidth * 0.90);
  let canvas_height = floor(windowHeight * 0.90);

  grid_width = 80;
  grid_height = 40;
  margin = 5;

  box_width = floor((canvas_width - margin * 2) / grid_width)
  box_height = floor((canvas_height - margin*2) / grid_height)
  world = initialize_grid();

  // Testing
  for (let y=0; y<grid_height; y++) {
    world[floor(grid_width/2)][y].walkable = false;
  }
  world[floor(grid_width/2)][3].walkable = true;

  start_node = world[0][0];
  start_node.walkable = true;

  target_node = world[grid_width-1][grid_height-1]
  target_node.walkable = true;

  createCanvas(canvas_width, canvas_height);
}

function draw() {
  pathfind_a(start_node, target_node);
  background(0);
  render_nodes(world);
  render_grid(world, box_width, box_height, margin);
}

function initialize_grid() {
  let grid = [];
  for (let x = 0; x < grid_width; x++) {
    grid[x] = [];
    for (let y = 0; y < grid_height; y++) {
      //let walkable = random() > 0.1;
      let walkable = true;
      grid[x][y] = new Node(x, y, walkable);
    }
  }
  return grid;
}

function render_grid() {
  /* Draw a line horizontally each box_height from top+margin to canvas_height-margin
     and same vertically
  */
  noFill();
  stroke(255);
  let right_edge = margin + (box_width * grid_width);
  let bottom_edge = margin + (box_height * grid_height);
  for (let x = margin; x <= right_edge; x += box_width) {
    line(x, margin, x, bottom_edge)
  }
  for (let y = margin; y <= bottom_edge; y += box_height) {
    line(margin, y, right_edge, y)
  }

}

function render_nodes(grid) {
  for (let row of grid) {
    for (let node of row) {
      render_node(node);
    }
  }

}

function render_node(node) {
  /* If the node is:
    unwalkable = gray
    start point = blue
    goal = yellow
    visited = red
    calculated = light blue
  */
  let color = null;
  if (!node.walkable) {
    color = "gray";
  }
  else if (node == start_node) {
    color = "green";
  }
  else if (node == target_node) {
    color = "yellow";
  }
  else if (path.includes(node)) {
    color = "magenta";
  }
  else if (open.includes(node)) {
    color = "blue";
  }
  else if (closed.has(node)) {
    color = "cyan";
  }

  if (color !== null) {
    noStroke();
    fill(color);
    let top = node.y * box_height + margin
    let left = node.x * box_width + margin
    rect(left, top, box_width, box_height)
  }
}

function pathfind_a(start_node, goal_node) {

  open = [];
  closed = new Set();

  start_node.g_cost = 0;
  start_node.h_cost = get_distance(start_node, goal_node);
  open.push(start_node);

  while (open.length > 0) {

    // lowest f_cost, then h_cost
    minimum = null;
    for (let node of open) {
      if (minimum == null || node.f_cost < minimum.f_cost || node.f_cost == minimum.f_cost && node.h_cost < minimum.h_cost) {
        minimum = node;
      }
    }
    current = minimum
    open.splice( open.indexOf(current) )
    closed.add(current)
    
    if (current == goal_node) {
      retrace_path(start_node, goal_node);
      return;
    }

    check_neighbors(current, goal_node, open, closed);
  }

}

function check_neighbors(node, goal, open, closed) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {

      neighbor = get_node(node.x+i, node.y+j)
      if (neighbor == null || !neighbor.walkable || closed.has(neighbor)) {
        continue;
      }
      
      // calculate the cost and save to node
      h_cost = get_distance(neighbor, goal);
      g_cost = node.g_cost + get_distance(node, neighbor);

      if (neighbor.parent == null || neighbor.g_cost > g_cost) {
        neighbor.g_cost = g_cost;
        neighbor.h_cost = h_cost;
        neighbor.parent = node;
      }

      open.push(neighbor);
    }
  }
}

function retrace_path(start_node, end_node) {
  path = [];

  let node = end_node;

  while (node.parent != null) {
    path.push(node.parent)
    node = node.parent
  }

  return path
}

function __pathfind_a(start_node, goal_node) {
  let neighbors = check_neighbors(current_node, goal_node, checked, visited);
  let next_node = find_cheapest(neighbors, visited);
  path.push(next_node);
  visited.push(next_node);

  // Add min_cost_node to our visited path and check its neighbors
  let i = 0;
  while (!visited.includes(target_node) && i < MAX_ITERATIONS) {
    current_node = next_node;
    path.push(current_node);
    neighbors = check_neighbors(current_node, goal_node, checked, visited);
    if (neighbors == null) {
      break;
    }
    next_node = find_cheapest(neighbors, visited);
    if (next_node === null || next_node.cost > current_node.cost) {
      path.pop();
      next_node = find_cheapest(checked, visited);
    }
    visited.push(next_node);

    i++;
  }

  return visited;

}

function __check_neighbors(current_node, goal_node, checked, visited) { 

  let neighbors = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i == 0 && j  == 0) {
        continue;
      }

      let neighbor = get_node(current_node.x + i,  current_node.y + j)

      // If that neighbor is the goal, add it to the path and return
      if (neighbor == goal_node) {
        visited.push(neighbor);
        return null;
      }

      // Otherwise if that neighbor's walkable, calculate its costs
      if (neighbor !== null && neighbor.walkable) {
        // calculate f- and g-costs
        f_cost = get_distance(neighbor, goal_node);
        g_cost = get_distance(neighbor, start_node);

        // add to checked list
        neighbors.push(neighbor)
        if (!checked.has(neighbor) || g_cost < neighbor.g_cost) {
          neighbor.cost = f_cost + g_cost;
          neighbor.f_cost = f_cost;
          neighbor.g_cost = g_cost;
          checked.add(neighbor);
        }
      }
    }
  }

  return neighbors;

}

function find_cheapest(set_to_check, visited) {

  // find the cheapest node and check its neighbors
  let min_cost_node = null;
  for (let node of set_to_check) {
    if (visited.includes(node)) {
      continue;
    }

    if (min_cost_node === null || min_cost_node.cost > node.cost) {
      min_cost_node = node;
    }

    if (node.cost == min_cost_node.cost && min_cost_node.g_cost > node.cost) {
      min_cost_node = node;
    }
  }

  return min_cost_node;

}

function get_node(x, y) {
  if (x < 0 || x > grid_width || y < 0 || y > grid_height) {
    return null;
  }
  else {
    return world[x][y]; 
  }
}

function get_distance(node_a, node_b) {
  vector_a = createVector(node_a.x, node_a.y)
  vector_b = createVector(node_b.x, node_b.y)

  return vector_a.dist(vector_b)
}

/*

So... for A* pathfinding I need:
* a grid
* the concept of a node
* a start and end point
* a way to display the grid
* a way to display the path
* (ideally) a way to display the progress of the algorithm
* some reporting such as iteration count and runtime
* displayed gridlines

The basic pathfinding algorithm is:

For each node adjacent to the starting node, calculate 2 "costs".
F_cost = distance from goal
G_cost = distance from start

Pick the node with the lowest F+G and repeat

If all the new caluclations are higher than a previously calculated node, go to that node instead
In other words, keep a list of  all nodes that have been calculated, sorted by ascending F+G cost

If a node is recalculated and the G cost is lower, update that node with the new numbers
(this addresses the issue of the Greedy Pathfinding algorithm where it will sometimes take bad paths that could have been shortcutted)

Data needs:

Grid<nodes>
Node
+ position
+ walkable
+ costs

Function needs:

pathfind(start_node, end_node, grid)
+ list of traveled nodes
+ list of calculated nodes

render(grid)
*/