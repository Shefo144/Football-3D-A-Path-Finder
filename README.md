Football 3D A* Pathfinding System ⚽🧠

An interactive, web-based 3D simulation demonstrating the A* (A-Star) Pathfinding Algorithm applied on a football pitch. The system calculates the most optimal path for an attacking player to maneuver around defenders, avoid obstacles, and score a goal.

🌟 Key Features

Realistic 3D Environment: Fully rendered pitch, players, ball, and goalpost using Three.js.

A* Pathfinding Algorithm:

Dynamically calculates the shortest path while dodging defensive obstacles.

Supports 8-directional movement (orthogonal and diagonal grid traversals with corner-cutting prevention).

Player & Ball Animation:

Realistic leg/arm swinging animations when moving.

Ball movement and rotation synced to the attacker's trajectory.

Interactive Controls:

Drag & Drop: Click and reposition defenders anywhere on the field in real-time.

Orbit Camera: Rotate, zoom, and tilt around the 3D stadium.

Add, remove, or randomize defender placements.

Real-Time Analytics: Displays path cost, total steps, number of explored nodes, and algorithm search execution time in milliseconds (ms).

Responsive Design: Designed to fit seamlessly across various screen sizes.

🛠️ Tech Stack

HTML5 & CSS3: Custom responsive overlay UI and layout styling.

JavaScript (ES6 Modules): Core logic and algorithm implementation.

Three.js (v0.170.0): WebGL 3D rendering engine.

OrbitControls: Interactive camera control library for Three.js.

🚀 Getting Started

No build process or backend server installation is required.

Prerequisites

A modern WebGL-supported web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).

Running Locally

Clone or download the repository:

git clone https://github.com/your-username/football-3d-astar.git


Navigate to the project directory:

cd football-3d-astar


Open index.html directly in your browser.

Note: For optimal ES6 module loading performance, running via a local web server (such as VS Code's Live Server extension) is recommended.

🎮 How to Use

Randomize / Move Defenders: Click Randomize or drag defenders directly on the pitch to set up obstacles.

Find Path: Click Find Path to run the A* algorithm. The explored nodes and the calculated path will be visualized on the pitch.

Play: Click Play to animate the attacker dribbling the ball along the generated path toward the goal.

Reset: Click Reset to clear the path and return the attacker to the starting position.

Controls Overview

Action

Input Method

Rotate View

Left Click + Drag

Zoom In / Out

Mouse Scroll Wheel / Pinch

Move Defender

Left Click + Drag on Defender Mesh

📐 Algorithm Highlights

Heuristic: Uses Octile/Chebyshev distance heuristics to evaluate diagonal vs. orthogonal movement costs ($\sqrt{2}$ vs $1$).

Safety Checks: Includes diagonal corner-cutting checks to ensure the player doesn't squeeze through adjacent defenders diagonally when blocked.

📄 File Structure

.
├── index.html   # Main HTML layout & import maps
├── style.css    # UI styling and overlay panels
├── script.js   # 3D scene creation, animation loop, and A* algorithm
└── README.md    # Project
