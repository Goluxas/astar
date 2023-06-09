class Node {
  g_cost; // (best) distance to start
  h_cost; // distance to target (heuristic)
  parent; // the node that calculated these values

  constructor(x, y, walkable) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
    //this.parent = null;
  }

  valueOf() {
    /* A bit awkward since JavaScript doesn't let us override less-than
       The idea is that if f_cost is equal we should go by the lower h_cost.
       So by raising f_cost's magnitude we can combine them into one number.
       This is hacky though because if h_cost exceeds 10000 everything breaks.
    */
    if (this.h_cost == null || this.g_cost == null) {
      return null;
    }
    return this.f_cost * 10000 + this.h_cost;
  }

  get f_cost() {
    return this.g_cost + this.h_cost;
  }

  reset() {
    this.g_cost = null;
    this.h_cost = null;
    this.parent = null;
  }
}

class BouncingBall {
  constructor(x, y) {
    this.position = createVector(x, y)
    this.momentum = p5.Vector.random2D().mult(random(1,5));
    this.size = 10;
    this.color = "yellow";
  }

  update() {
    this.position = this.position.add(this.momentum);
    this.checkBounds();
  }

  checkBounds() {
    if (this.position.x - this.size/2 < 0 || this.position.x + this.size/2 > grid_bounds.x) {
      this.momentum.x = this.momentum.x * -1
      this.position.x = constrain(this.position.x, margin + this.size/2, grid_bounds.x-this.size/2)
    }
    if (this.position.y - this.size/2 < 0 || this.position.y + this.size/2 > grid_bounds.y) {
      this.momentum.y = this.momentum.y * -1
      this.position.y = constrain(this.position.y, margin+this.size/2, grid_bounds.y-this.size/2)
    }
  }

  draw() {
    noStroke();
    fill(this.color);
    circle(this.position.x, this.position.y, this.size);
  }
}

class Heap {
  // This particular heap sorts the lowest values to the top (index 0), which is the opposite of textbook heaps
  _array;
  _lastIndex;

  constructor(max_size) {
    this._array = new Array(max_size);
    this._lastIndex = 0;
  }

  [Symbol.iterator]() {
    return this._array;
  }

  add(item) {
    // Don't add duplicates
    // unless they're lower f_cost, then reorganize them
    let existing_index = this._array.indexOf(item)
    if (existing_index != -1) {
      let existing_item = this._array[existing_index]
      if (existing_item.f_cost > item.f_cost) {
        this._array[existing_index] = item;
        this._sort_up(existing_index);
        return;
      }
      else {
        return;
      }
    }

    this._array[this._lastIndex] = item;
    this._sort_up(this._lastIndex);
    this._lastIndex++;
  }

  pop() {
    let item = this._array[0];
    this._array[0] = this._array[this._lastIndex-1];
    this._lastIndex--;
    this._sort_down(0);
    return item;
  }

  get size() {
    return this._lastIndex;
  }

  _sort_up(index) {
    while (true) {
      let parent = floor((index - 1) / 2)

      if (parent >= 0 && this._array[index] < this._array[parent]) {
        this._swap(index, parent)
        index = parent;
      }
      else {
        break;
      }
    }
  }

  _sort_down(index) {
    while (true) {
      let left = 2 * index + 1
      let right = left + 1

      let cur_val = this._array[index];

      if (left < this._lastIndex) {
        let lesser_val = this._array[left]
        let lesser_i = left

        if (right < this._lastIndex) {
          let right_val = this._array[right]

          if (right_val < lesser_val) {
            lesser_val = right_val
            lesser_i = right
          }
        }
        
        if (cur_val > lesser_val) {
          this._swap(index, lesser_i);
          index = lesser_i;
        }
        else {
          break;
        }
      }
      else {
        break;
      }
    }
  }

  _swap(i1, i2) {
    let item1 = this._array[i1]
    this._array[i1] = this._array[i2]
    this._array[i2] = item1;
  }

  has(item) {
    return this._array.includes(item);
  }

}


let grid_width;
let grid_height;
let box_width;
let box_height;
let margin;
let grid_bounds;

let world;
let target;

let start_node;
let current_node;

let path = [];
let open;
let closed;

const MAX_ITERATIONS = 100000;
const HOLE_IN_V_WALL_ENABLED = true;
const OBS_NOISE_ENABLED = true;
const DISPLAY_EXPLORED = false;
const FIND_PATH_ONCE = false;
const FIND_PATH = true;
const FIND_ON_FRAME = 10; // amount to delay in frames. 1 = run every frame, 2 = every other, etc. Only works if FIND_PATH = true
let path_frame = 0;


function setup() {
  let canvas_width = floor(windowWidth * 0.90);
  let canvas_height = floor(windowHeight * 0.90);

  grid_width = 320;
  grid_height = 160;
  margin = 5;

  box_width = floor((canvas_width - margin * 2) / grid_width)
  box_height = floor((canvas_height - margin*2) / grid_height)
  grid_bounds = createVector(margin + box_width * grid_width, margin + box_height * grid_height)

  world = initialize_grid();

  if (HOLE_IN_V_WALL_ENABLED) {
    for (let y=0; y<grid_height; y++) {
      world[floor(grid_width/2)][y].walkable = false;
    }
    world[floor(grid_width/2)][3].walkable = true;
  }

  start_node = world[0][0];
  start_node.walkable = true;

  target = new BouncingBall(box_width * (grid_width - 2), box_height * (grid_height - 2));

  //target_node = world[grid_width-1][grid_height-1]
  //target_node.walkable = true;

  //pathfind_a(start_node, target_node);
  if (FIND_PATH_ONCE) {
    pathfind_a(start_node, get_node_from_pos(target.position));
  }

  frameRate(60);
  createCanvas(canvas_width, canvas_height);
}

function draw() {
  background(0);

  // update
  target.update()
  if (FIND_PATH && (path_frame++ % FIND_ON_FRAME) == 0) {
    pathfind_a(start_node, get_node_from_pos(target.position))
  }

  // render
  render_nodes(world);
  render_grid(world, box_width, box_height, margin);
  target.draw();
  render_fps();
}



function initialize_grid() {
  let grid = [];
  for (let x = 0; x < grid_width; x++) {
    grid[x] = [];
    for (let y = 0; y < grid_height; y++) {
      let walkable = true;
      if (OBS_NOISE_ENABLED) {
        walkable = random() > 0.1;
      }
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
  //else if (node == target_node) {
    //color = "yellow";
  //}
  else if (path.includes(node)) {
    color = "magenta";
  }
  else if (DISPLAY_EXPLORED) {
    if (open.has(node)) {
      color = "blue";
    }
    else if (closed.has(node)) {
      color = "cyan";
    }
  }

  if (color !== null) {
    noStroke();
    fill(color);
    let top = node.y * box_height + margin
    let left = node.x * box_width + margin
    rect(left, top, box_width, box_height)
  }
}

function render_fps() {
  fps = floor(getFrameRate());
  fill("yellow");
  textSize(32);
  text(fps, grid_bounds.x-30, 30);
}

function pathfind_a(start_node, goal_node) {

  console.time("Pathfinding")
  reset_nodes()

  path = [];
  open = new Heap(grid_width * grid_height);
  closed = new Set();

  if (goal_node.walkable == false) {
    console.timeEnd("Pathfinding");
    return;
  }

  start_node.g_cost = 0;
  start_node.h_cost = get_distance(start_node, goal_node);
  open.add(start_node);

  let i = 0;
  while (open.size > 0 && i < MAX_ITERATIONS) {

    // lowest f_cost, then h_cost
    /*
    minimum = null;
    for (let node of open) {
      if (minimum == null || node.f_cost < minimum.f_cost || node.f_cost == minimum.f_cost && node.h_cost < minimum.h_cost) {
        minimum = node;
      }
    }
    current = minimum
    */
    current = open.pop()
    closed.add(current);
    
    if (current == goal_node) {
      retrace_path(start_node, goal_node);
      console.timeEnd("Pathfinding")
      return;
    }

    check_neighbors(current, goal_node, open, closed);
    i++;
  }

}

function reset_nodes() {
  for (let row of world) {
    for (let node of row) {
      node.reset()
    }
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

      open.add(neighbor);
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

function get_node(x, y) {
  if (x < 0 || x >= grid_width || y < 0 || y >= grid_height) {
    return null;
  }
  else {
    return world[x][y]; 
  }
}

function get_node_from_pos(pos) {
  grid_x = floor((pos.x-margin) / box_width)
  grid_y = floor((pos.y-margin) / box_height)

  grid_x = constrain(grid_x, 0, grid_width-1)
  grid_y = constrain(grid_y, 0, grid_height-1)

  return world[grid_x][grid_y]
}

function get_distance(node_a, node_b) {
  // Whole number approximation method from video
  // cleaner and faster results on a square grid
  let dx = abs(node_a.x - node_b.x)
  let dy = abs(node_a.y - node_b.y)

  if (dx > dy) {
    return 14 * dy + 10 * (dx - dy);
  }
  else {
    return 14 * dx + 10 * (dy - dx);
  }
}

function __get_distance(node_a, node_b) {
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