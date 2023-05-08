class Node {
  constructor(x, y, walkable) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
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

let visited;
let checked;

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
      let walkable = random() > 0.1;
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
    color = "blue";
  }
  else if (node == target_node) {
    color = "yellow";
  }
  else if (visited.includes(node)) {
    color = "red";
  }
  else if (checked.has(node)) {
    color= "cyan";
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

  visited = [];
  checked = new Set();

  current_node = start_node;

  check_neighbors(current_node, goal_node, checked, visited);
  let next_node = find_cheapest(checked, visited);

  // Add min_cost_node to our visited path and check its neighbors
  let i = 0;
  while (!visited.includes(target_node) || i > MAX_ITERATIONS) {
    visited.push(next_node);
    check_neighbors(next_node, goal_node, checked, visited);
    next_node = find_cheapest(checked, visited);
    i++;
  }

  return visited;

}

function check_neighbors(current_node, goal_node, checked, visited) { 

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let neighbor = get_node(current_node.x + i,  current_node.y + j)

      // If that neighbor is the goal, add it to the path and return
      if (neighbor == goal_node) {
        visited.push(neighbor);
        return visited;
      }

      // Otherwise if that neighbor's walkable, calculate its costs
      if (neighbor !== null && neighbor.walkable) {
        // calculate f- and g-costs
        f_cost = calc_cost(neighbor, goal_node);
        g_cost = calc_cost(neighbor, start_node);

        // add to checked list
        if (!checked.has(neighbor) || g_cost < neighbor.g_cost) {
          neighbor.cost = f_cost + g_cost;
          neighbor.f_cost = f_cost;
          neighbor.g_cost = g_cost;
          checked.add(neighbor);
        }
      }
    }
  }

}

function find_cheapest(checked, visited) {

  // find the cheapest node and check its neighbors
  let min_cost_node = null;
  for (let node of checked) {
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

function calc_cost(node_a, node_b) {
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