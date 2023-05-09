# A\* Pathfinding Algorithm

I made this to get hands-on experience with the A\* pathfinding algorithm. It runs in a browser using the p5.js game prototyping library.

## To Run

Currently runs through Visual Studio Code extensions.

Required Extensions:

- p5.vscode
- Live Server

This will add a Go Live button to the bottom toolbar that will launch the app in browser.

## Optimization Notes

Turning off the display of non-path explored nodes drastically sped up execution. Probably running the Set.has() function on 3000 nodes (sometimes twice!) is massively inefficient. CPU usage would climb to 94%. Turning off display dropped to 45% at peak. Did not have in-code timers at the point of this test.

Set the grid to 320x160 for performance testing. At this size it takes about 170ms to find a path on the other side of the wall.

Added FPS counter. It's about 4 fps when the algo is taking 170ms. 1000 ms / 60 frames = ~16.6 ms/frame ideally. 4 frames means we're taking about 250 ms per frame to process, so something else must be slow too. ~~Drawing the path?~~ Nope, disabling that made no difference really.

Just noticed I only get about 40 fps without any pathfinding/drawing at all. Weird.

After Heap worked: ~90ms, 8 fps at worse. Big gains!

Pathfinding set to once every 10 frames: Mantaining roughly max frame rate (40) even at worst position. No effect on algo speed, obviously. There's some hitching at the very worst and the trail delays a bit behind, but this is good.

Fixed another bug in the Heap logic where updated nodes would not be resorted higher. Processing times in the very worst case are still ~100ms, but it seems generally smoother. I think at this point the algorithm is properly (if not maximally) optimized, and the biggest slowdown is the size of the grid. 320x160 is small for pixels but probably more granular than you would need for a real use-case. In this case, the ball is bigger than the grid tiles!

## Up Next

~~Add timer.~~

~~Limit how often a path is requested. Currently it's running every frame, ~~and sometimes one algorithm doesn't finish before the next frame is requested.~~ Actually appears to stall the timer because I only end it when a path is found, and that's not the only way the algorithm exits.~~

~~Implement a heap queue to efficiently sort nodes.~~

## Takeaways

1. Grid size has a big impact on run speed.

This is not map size, it's the size of the conceptual nodes that we're using to navigate. As the size of the field increases, the processing time increases exponentially. (Maybe. Just guessing by feel, haven't analyzed the big O.)

A bigger grid equals smaller grid tiles, and a smaller grid tile only lets you more granularly control the path. My gut feeling is that the granularity of the tiles only matters if your players see unnatural mob movements, like jerking to a new heading at the center of each tile, and that's probably only noticeable at tiles that are very large, like 5x wider than the mob sprite.

When mobs are far or off-screen, they could even use a much larger node because the player won't see the weird movement.

2. Pathfind sparingly.

That is, not every frame. Could have the mob request a path when it needs one or if the target has moved to a new tile.

3. Pathfind asyncrhonously, probably.

Pathfinding asynchronously also seems like a good idea. Won't bog down the frame if the path is complicated. The mob could just stand still until it receives the path with not too much jank. Or it could move naively toward the player or in a random direction to mask it.
