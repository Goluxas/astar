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

## Up Next

~~Add timer.~~

Limit how often a path is requested. Currently it's running every frame, ~~and sometimes one algorithm doesn't finish before the next frame is requested.~~ Actually appears to stall the timer because I only end it when a path is found, and that's not the only way the algorithm exits.

Implement a heap queue to efficiently sort nodes.
