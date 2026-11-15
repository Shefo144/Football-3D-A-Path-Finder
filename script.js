import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* =========================
   GAME SETTINGS
========================= */

const ROWS = 20;
const COLS = 36;

const START = [10, 2];
const GOAL = [10, 33];

const container = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101b24);

const camera = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    150
);

camera.position.set(0, 27, 30);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 12;
controls.maxDistance = 55;

/* =========================
   LIGHTING
========================= */

scene.add(
    new THREE.HemisphereLight(0xffffff, 0x34513b, 2)
);

const light = new THREE.DirectionalLight(0xffffff, 2.5);
light.position.set(-12, 25, 10);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);
scene.add(light);

/* =========================
   STADIUM AND FIELD
========================= */

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x17252a })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.15;
ground.receiveShadow = true;
scene.add(ground);

const field = new THREE.Group();
scene.add(field);

const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(COLS, ROWS),
    new THREE.MeshStandardMaterial({ color: 0x287b43 })
);

grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
field.add(grass);

// Grass stripes
for (let i = 0; i < COLS; i += 2) {
    const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(2, ROWS),
        new THREE.MeshStandardMaterial({ color: 0x32864b })
    );

    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(-COLS / 2 + i + 1, 0.015, 0);
    field.add(stripe);
}

const white = new THREE.LineBasicMaterial({ color: 0xffffff });

function addLine(x1, z1, x2, z2) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, 0.04, z1),
        new THREE.Vector3(x2, 0.04, z2)
    ]);

    field.add(new THREE.Line(geometry, white));
}

// Field boundary
addLine(-18, -10, 18, -10);
addLine(-18, 10, 18, 10);
addLine(-18, -10, -18, 10);
addLine(18, -10, 18, 10);

// Halfway line
addLine(0, -10, 0, 10);

// Center circle
const circle = new THREE.Mesh(
    new THREE.RingGeometry(2.9, 3, 64),
    white
);

circle.rotation.x = -Math.PI / 2;
circle.position.y = 0.045;
field.add(circle);

// Penalty areas
addLine(-18, -5, -13, -5);
addLine(-13, -5, -13, 5);
addLine(-13, 5, -18, 5);

addLine(18, -5, 13, -5);
addLine(13, -5, 13, 5);
addLine(13, 5, 18, 5);

// Goal models
function createGoal(x) {
    const goal = new THREE.Group();

    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff
    });

    function post(xPos, yPos, zPos, height) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, height, 12),
            material
        );

        mesh.position.set(xPos, yPos, zPos);
        mesh.castShadow = true;
        goal.add(mesh);
    }

    post(x, 1.1, -1.5, 2.2);
    post(x, 1.1, 1.5, 2.2);

    const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 3, 12),
        material
    );

    bar.rotation.x = Math.PI / 2;
    bar.position.set(x, 2.2, 0);
    goal.add(bar);

    scene.add(goal);
}

createGoal(18.2);

/* =========================
   GRID HELPERS
========================= */

function cellToWorld(cell) {
    const [r, c] = cell;

    return new THREE.Vector3(
        -COLS / 2 + c + 0.5,
        0,
        -ROWS / 2 + r + 0.5
    );
}

function worldToCell(point) {
    const c = Math.floor(point.x + COLS / 2);
    const r = Math.floor(point.z + ROWS / 2);

    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) {
        return null;
    }

    return [r, c];
}

function key(cell) {
    return cell[0] + "," + cell[1];
}

function sameCell(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

/* =========================
   PLAYER MODELS
========================= */

function createPlayer(color) {
    const root = new THREE.Group();

    const model = new THREE.Group();
    root.add(model);

    const shirt = new THREE.MeshStandardMaterial({ color });
    const skin = new THREE.MeshStandardMaterial({ color: 0xc78b60 });
    const shorts = new THREE.MeshStandardMaterial({ color: 0x18202a });
    const shoes = new THREE.MeshStandardMaterial({ color: 0x111111 });

    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.27, 0.34, 0.85, 12),
        shirt
    );

    body.position.y = 1.25;
    body.castShadow = true;
    model.add(body);

    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 16, 16),
        skin
    );

    head.position.y = 1.95;
    head.castShadow = true;
    model.add(head);

    // Shorts
    const shortsMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.32, 0.35, 12),
        shorts
    );

    shortsMesh.position.y = 0.68;
    model.add(shortsMesh);

    const legs = [];
    const arms = [];

    // Arms
    for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.09, 0.48, 4, 8),
            shirt
        );

        arm.position.set(side * 0.36, 1.25, 0);
        model.add(arm);
        arms.push(arm);
    }

    // Legs and shoes
    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.105, 0.48, 4, 8),
            skin
        );

        leg.position.set(side * 0.15, 0.32, 0);
        model.add(leg);
        legs.push(leg);

        const shoe = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.11, 0.32),
            shoes
        );

        shoe.position.set(side * 0.15, 0.09, -0.06);
        model.add(shoe);
    }

    root.userData.legs = legs;
    root.userData.arms = arms;
    root.userData.phase = Math.random() * 4;
    root.userData.walking = false;

    root.traverse(obj => {
        if (obj.isMesh) obj.castShadow = true;
    });

    return root;
}

/* =========================
   FOOTBALL
========================= */

function createBall() {
    const group = new THREE.Group();

    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 24, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    ball.castShadow = true;
    group.add(ball);

    const black = new THREE.MeshStandardMaterial({ color: 0x151515 });

    for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 2 / 5;

        const patch = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 10, 8),
            black
        );

        patch.position.set(
            Math.cos(angle) * 0.18,
            Math.sin(angle) * 0.1,
            Math.sin(angle) * 0.18
        );

        group.add(patch);
    }

    return group;
}

const attacker = createPlayer(0x168bff);
scene.add(attacker);

const ball = createBall();
scene.add(ball);

let defenders = [];

/* =========================
   DEFENDERS
========================= */

function getDefenderCells() {
    return defenders
        .map(d => worldToCell(d.position))
        .filter(c => c !== null);
}

function addDefender(cell) {
    const defender = createPlayer(0xe83e45);

    defender.position.copy(cellToWorld(cell));
    scene.add(defender);
    defenders.push(defender);
}

function randomCell() {
    return [
        THREE.MathUtils.randInt(1, ROWS - 2),
        THREE.MathUtils.randInt(10, COLS - 5)
    ];
}

function randomizeDefenders(count = 12) {
    defenders.forEach(d => scene.remove(d));
    defenders = [];

    const used = new Set();

    while (used.size < count) {
        const cell = randomCell();
        const k = key(cell);

        if (
            !used.has(k) &&
            !sameCell(cell, START) &&
            !sameCell(cell, GOAL)
        ) {
            used.add(k);
            addDefender(cell);
        }
    }
}

function resetPlayer() {
    attacker.position.copy(cellToWorld(START));
    attacker.rotation.y = 0;

    ball.position.set(
        attacker.position.x + 0.65,
        0.23,
        attacker.position.z
    );
}

/* =========================
   A* ALGORITHM
========================= */

function heuristic(a, b) {
    const dx = Math.abs(a[0] - b[0]);
    const dy = Math.abs(a[1] - b[1]);

    return Math.max(dx, dy) +
        (Math.SQRT2 - 1) * Math.min(dx, dy);
}

const directions = [
    [-1, 0, 1],
    [1, 0, 1],
    [0, -1, 1],
    [0, 1, 1],
    [-1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [1, 1, Math.SQRT2]
];

function astar(start, goal, obstacles) {
    const startTime = performance.now();

    const open = [{ cell: start, f: 0 }];
    const cameFrom = new Map();
    const gScore = new Map();
    const closed = new Set();

    gScore.set(key(start), 0);

    while (open.length > 0) {
        open.sort((a, b) => a.f - b.f);

        const current = open.shift().cell;
        const currentKey = key(current);

        if (closed.has(currentKey)) continue;

        closed.add(currentKey);

        if (sameCell(current, goal)) {
            const path = [current];
            let currentKeyInPath = currentKey;

            while (cameFrom.has(currentKeyInPath)) {
                const previous = cameFrom.get(currentKeyInPath);
                path.unshift(previous);
                currentKeyInPath = key(previous);
            }

            return {
                path,
                explored: [...closed].map(
                    k => k.split(",").map(Number)
                ),
                cost: gScore.get(currentKey),
                time: performance.now() - startTime
            };
        }

        for (const [dr, dc, moveCost] of directions) {
            const next = [
                current[0] + dr,
                current[1] + dc
            ];

            const [nr, nc] = next;
            const nextKey = key(next);

            if (
                nr < 0 || nr >= ROWS ||
                nc < 0 || nc >= COLS
            ) continue;

            if (obstacles.has(nextKey)) continue;
            if (closed.has(nextKey)) continue;

            // Prevent diagonal corner cutting
            if (dr !== 0 && dc !== 0) {
                const side1 = key([current[0] + dr, current[1]]);
                const side2 = key([current[0], current[1] + dc]);

                if (obstacles.has(side1) || obstacles.has(side2)) {
                    continue;
                }
            }

            const newCost = gScore.get(currentKey) + moveCost;

            if (newCost < (gScore.get(nextKey) ?? Infinity)) {
                cameFrom.set(nextKey, current);
                gScore.set(nextKey, newCost);

                open.push({
                    cell: next,
                    f: newCost + heuristic(next, goal)
                });
            }
        }
    }

    return {
        path: [],
        explored: [...closed].map(
            k => k.split(",").map(Number)
        ),
        cost: 0,
        time: performance.now() - startTime
    };
}

/* =========================
   PATH VISUALIZATION
========================= */

let path = [];
let pathIndex = 0;
let isPlaying = false;

let pathGroup = new THREE.Group();
scene.add(pathGroup);

function clearPath() {
    scene.remove(pathGroup);

    pathGroup.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });

    pathGroup = new THREE.Group();
    scene.add(pathGroup);

    path = [];
    pathIndex = 0;
    isPlaying = false;

    updateStats(0, 0, 0, 0);
}

function addMarker(cell, color, radius) {
    const p = cellToWorld(cell);

    const marker = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 12),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.75
        })
    );

    marker.rotation.x = -Math.PI / 2;
    marker.position.set(p.x, 0.065, p.z);

    pathGroup.add(marker);
}

function drawPath(result) {
    clearPath();

    // Explored cells
    for (const cell of result.explored) {
        addMarker(cell, 0x3399dd, 0.09);
    }

    // Final path
    if (result.path.length > 1) {
        const points = result.path.map(cell => {
            const p = cellToWorld(cell);
            return new THREE.Vector3(p.x, 0.12, p.z);
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
                color: 0xffe34d
            })
        );

        pathGroup.add(line);

        for (const cell of result.path) {
            addMarker(cell, 0xffe34d, 0.055);
        }
    }

    path = result.path;

    updateStats(
        result.cost,
        Math.max(0, result.path.length - 1),
        result.explored.length,
        result.time
    );
}

/* =========================
   INTERFACE
========================= */

function setStatus(message) {
    document.getElementById("status").textContent = message;
}

function updateStats(cost, steps, nodes, time) {
    document.getElementById("cost").textContent =
        Number(cost).toFixed(2);

    document.getElementById("steps").textContent = steps;
    document.getElementById("nodes").textContent = nodes;

    document.getElementById("time").textContent =
        Number(time).toFixed(3) + " ms";
}

/* Add Defender */
document.getElementById("add").onclick = () => {
    if (defenders.length >= 35) {
        setStatus("Maximum defenders reached.");
        return;
    }

    const occupied = new Set(getDefenderCells().map(key));

    let cell;
    let attempts = 0;

    do {
        cell = randomCell();
        attempts++;
    } while (
        (
            occupied.has(key(cell)) ||
            sameCell(cell, START) ||
            sameCell(cell, GOAL)
        ) && attempts < 100
    );

    if (attempts < 100) {
        addDefender(cell);
        clearPath();
        setStatus("Defender added.");
    }
};

/* Remove Defender */
document.getElementById("remove").onclick = () => {
    if (defenders.length === 0) {
        setStatus("No defenders to remove.");
        return;
    }

    scene.remove(defenders.pop());
    clearPath();
    setStatus("Last defender removed.");
};

/* Randomize */
document.getElementById("random").onclick = () => {
    randomizeDefenders(12);
    resetPlayer();
    clearPath();
    setStatus("Defenders randomized.");
};

/* Find Path */
document.getElementById("find").onclick = () => {
    isPlaying = false;

    const obstacles = new Set(
        getDefenderCells().map(key)
    );

    const result = astar(START, GOAL, obstacles);

    drawPath(result);
    resetPlayer();

    if (result.path.length > 0) {
        setStatus("Path found! Press Play.");
    } else {
        setStatus("No path found. Move defenders.");
    }
};

/* Play */
document.getElementById("play").onclick = () => {
    if (path.length < 2) {
        setStatus("Find a path first.");
        return;
    }

    resetPlayer();
    pathIndex = 1;
    isPlaying = true;

    setStatus("Attacker is moving!");
};

/* Reset */
document.getElementById("reset").onclick = () => {
    isPlaying = false;
    resetPlayer();
    clearPath();
    setStatus("Reset complete.");
};

/* =========================
   DRAG DEFENDERS
========================= */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const groundPlane = new THREE.Plane(
    new THREE.Vector3(0, 1, 0),
    0
);

const hitPoint = new THREE.Vector3();

let selectedDefender = null;
let dragging = false;

function updatePointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointer.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

renderer.domElement.addEventListener("pointerdown", event => {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(defenders, true);

    if (hits.length === 0) return;

    let object = hits[0].object;

    while (object.parent && !defenders.includes(object)) {
        object = object.parent;
    }

    if (defenders.includes(object)) {
        selectedDefender = object;
        dragging = true;
        controls.enabled = false;
    }
});

renderer.domElement.addEventListener("pointermove", event => {
    if (!dragging || !selectedDefender) return;

    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);

    if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
        return;
    }

    const cell = worldToCell(hitPoint);
    if (!cell) return;

    const occupied = getDefenderCells()
        .filter(c => !sameCell(
            c,
            worldToCell(selectedDefender.position)
        ));

    const blocked = occupied.some(c => sameCell(c, cell));

    if (
        blocked ||
        sameCell(cell, START) ||
        sameCell(cell, GOAL)
    ) return;

    const position = cellToWorld(cell);

    selectedDefender.position.x = position.x;
    selectedDefender.position.z = position.z;

    clearPath();
    setStatus("Defender moved. Find the path again.");
});

function stopDragging() {
    dragging = false;
    selectedDefender = null;
    controls.enabled = true;
}

window.addEventListener("pointerup", stopDragging);

/* =========================
   ANIMATION
========================= */

const clock = new THREE.Clock();

function animatePlayers(delta) {
    for (const player of [attacker, ...defenders]) {
        if (player.userData.walking) {
            player.userData.phase += delta * 10;

            const swing = Math.sin(player.userData.phase) * 0.45;

            player.userData.legs[0].rotation.x = swing;
            player.userData.legs[1].rotation.x = -swing;

            player.userData.arms[0].rotation.x = -swing * 0.6;
            player.userData.arms[1].rotation.x = swing * 0.6;
        } else {
            player.userData.legs.forEach(leg => {
                leg.rotation.x = THREE.MathUtils.damp(
                    leg.rotation.x, 0, 8, delta
                );
            });

            player.userData.arms.forEach(arm => {
                arm.rotation.x = THREE.MathUtils.damp(
                    arm.rotation.x, 0, 8, delta
                );
            });
        }
    }
}

function moveAttacker(delta) {
    if (!isPlaying || path.length < 2) {
        attacker.userData.walking = false;
        return;
    }

    if (pathIndex >= path.length) {
        isPlaying = false;
        attacker.userData.walking = false;
        setStatus("GOAL! The attacker reached the goal.");
        return;
    }

    const target = cellToWorld(path[pathIndex]);

    const direction = new THREE.Vector3(
        target.x - attacker.position.x,
        0,
        target.z - attacker.position.z
    );

    const distance = direction.length();
    const step = 4.5 * delta;

    attacker.userData.walking = true;

    if (distance > 0.001) {
        attacker.rotation.y = Math.atan2(
            direction.x,
            direction.z
        );
    }

    if (distance <= step) {
        attacker.position.copy(target);
        pathIndex++;
    } else {
        direction.normalize();
        attacker.position.addScaledVector(direction, step);
    }

    // Ball follows the attacker
    const forward = new THREE.Vector3(
        Math.sin(attacker.rotation.y),
        0,
        Math.cos(attacker.rotation.y)
    );

    ball.position.set(
        attacker.position.x + forward.x * 0.65,
        0.23,
        attacker.position.z + forward.z * 0.65
    );

    ball.rotation.x += delta * 5;
    ball.rotation.z += delta * 5;
}

/* =========================
   INITIAL SETUP
========================= */

randomizeDefenders(12);
resetPlayer();

// Goal marker
const goalMarker = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 24),
    new THREE.MeshBasicMaterial({ color: 0xffdf55 })
);

goalMarker.rotation.x = -Math.PI / 2;
goalMarker.position.copy(cellToWorld(GOAL));
goalMarker.position.y = 0.06;
scene.add(goalMarker);

/* =========================
   MAIN LOOP
========================= */

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    animatePlayers(delta);
    moveAttacker(delta);

    controls.update();
    renderer.render(scene, camera);
}

animate();

/* =========================
   WINDOW RESIZE
========================= */

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});