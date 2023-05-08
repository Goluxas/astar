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
  background(0);
  render_nodes(world);
  render_grid(world, box_width, box_height, margin);
}

function initialize_grid() {
  let grid = [];
  for (let x = 0; x < grid_width; x++) {
    grid[x] = [];
    for (let y = 0; y < grid_height; y++) {
      let walkable = random() > 0.01;
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

  if (color !== null) {
    noStroke();
    fill(color);
    let top = node.y * box_height + margin
    let left = node.x * box_width + margin
    rect(left, top, box_width, box_height)
  }
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