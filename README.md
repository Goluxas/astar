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

## Up Next

~~Add timer.~~

Limit how often a path is requested. Currently it's running every frame, ~~and sometimes one algorithm doesn't finish before the next frame is requested.~~ Actually appears to stall the timer because I only end it when a path is found, and that's not the only way the algorithm exits.

Implement a heap queue to efficiently sort nodes.
