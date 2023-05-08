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

function setup() {
  let canvas_width = floor(windowWidth * 0.90);
  let canvas_height = floor(windowHeight * 0.90);

  grid_width = 10;
  grid_height = 10;
  margin = 5;

  box_width = floor((canvas_width - margin * 2) / grid_width)
  box_height = floor((canvas_height - margin*2) / grid_height)
  world = initialize_grid();

  createCanvas(canvas_width, canvas_height);
}

function draw() {
  background(0);
  render_grid(world, box_width, box_height, margin);
  render_nodes(grid);
}

function initialize_grid() {
  let grid = [];
  for (let x = 0; x < grid_width; x++) {
    grid[x] = [];
    for (let y = 0; y < grid_height; y++) {
      grid[x][y] = new Node(x, y, true);
    }
  }
  return grid;
}

function render_grid() {
  /* Draw a line horizontally each box_height from top+margin to canvas_height-margin
     and same vertically
  */
  stroke(255);
  for (let x = margin; x < width; x += box_width) {
    line(x, margin, x, height - margin)
  }
  for (let y = margin; y < height; y += box_height) {
    line(margin, y, width - margin, y)
  }

}

function render_nodes() {
  /* If the node is:
    walkable = gray
    start point = blue
    goal = yellow
    visited = red
    calculated = light blue
  */

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