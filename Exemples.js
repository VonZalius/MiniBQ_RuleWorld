// ================== Hexagonal Game of Life ==================
// An "off" cell becomes "on" if it has exactly 2 "on" neighbors
// An "on" cell stays "on" if it has 2 or 3 "on" neighbors

const { random } = require("lodash");

// Manually count "on" neighbors
let count = 0;
const dirs = [[1,0], [1,-1], [0,-1], [-1,0], [-1,1], [0,1]];
for (let [dq, dr] of dirs) {
    if (get(q + dq, r + dr) === "on") {
        count++;
    }
}

if (state === "off" && count === 2) {
    return "on";
}

if (state === "on" && (count === 2 || count === 3)) {
    return "on";
}

return "off";



// ================== Gravity simulation ==================
// An "on" cell falls if the cell below or diagonally below is "off"
// An "off" cell becomes "on" if an "on" cell is above it
// An "off" cell becomes "on" if an "on" cell is diagonally up-left or up-right,
// provided the intermediate cell is not "off"
var down = get(q, r + 1);
var down_left = get(q - 1, r + 1);
var down_right = get(q + 1, r);

if (state === "on") {
    if (down === "off") return "off";
    if (down_left === "off") return "off";
    if (down_right === "off") return "off";
    return "on";
}

if (state === "off") {
    if (get(q, r - 1) === "on") return "on";
    if (get(q - 1, r + 1) != "off" && get(q - 1, r) === "on") return "on";
    if (get(q + 1, r) != "off" && get(q + 1, r - 1) === "on") return "on";
    return "off";
}

return state;



// ================== Life diffusion ==================
// Simulates life growing, evolving, and declining in an organic way.
// Initial "on" cells are transformed into colored states based on neighbors.
// Cells evolve, can spread, be destroyed, or disappear.

const SPROUT = "green"; //young sprout
const MATURE = "blue";  //mature cell
const DECAY = "orange"; //decaying cell
const SPARK = "yellow"; //life-creating seed
const CHAOS = "red";    //destructive seed

const dirs = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];

// --- Initial "on" transformation ---
// Depending on the number of "on" neighbors, the cell is replaced by a simulation state
if(state === "on") {
    let onNeighbors = 0;
    for (let [dq, dr] of dirs) {
        if(get(q+dq, r+dr) === "on") onNeighbors++;
    }

    if(onNeighbors === 0) return "off";       // isolated → dies
    if(onNeighbors <= 2) return SPROUT;      // small cluster → sprout
    if(onNeighbors <= 4) return MATURE;       // medium cluster → mature
    return DECAY;                          // dense cluster → decay
}

// --- Neighbor count per state ---
let counts = { off:0, green:0, blue:0, orange:0, yellow:0, red:0 };
for (let [dq, dr] of dirs) {
    const n = get(q + dq, r + dr);
    if (counts[n] !== undefined) counts[n]++;
}

// --- Local density within a radius of 2 (to prevent overpopulation) ---
let localLife = 0;
for (let dq=-2; dq<=2; dq++) {
    for (let dr=-2; dr<=2; dr++) {
        if (dq===0 && dr===0) continue;
        const n = get(q+dq, r+dr);
        if ([SPROUT,MATURE].includes(n)) localLife++;
    }
}

// --- History for progressive maturation ---
const last = getHistory(-1, q, r);
const last2 = getHistory(-2, q, r);

// --- Parameters ---
const densityThreshold = 8;   // density limit before decline

switch(state) {
    case "off":
        // --- Deterministic creation of a seed (yellow) ---
        if (
            counts.blue === 1 && counts.green === 0 && counts.orange === 0 &&
            counts.red === 0 && counts.yellow === 0
        )
            return SPARK;

        // --- Random creation ---
        return "off";

    case SPROUT: // sprout
        if (counts.red > 0) return CHAOS;                       // destroyed by chaos
        if (localLife >= densityThreshold) return DECAY;     // too dense → decay
        if (counts.blue + counts.green === 0) return "off";     // isolated → off
        if (last===SPROUT && last2===SPROUT && getHistory(-3,q,r)===SPROUT) return MATURE; // maturation
        return SPROUT;

    case MATURE: // mature
        if (counts.red > 0) return CHAOS;                       // destroyed by chaos
        if (counts.green + counts.blue <= 1) return SPROUT;   // too few neighbors → revert to sprout
        if (localLife > densityThreshold + 6) return DECAY;  // overpopulation → decay
        return MATURE;

    case DECAY: // decay
        if (counts.red > 0 || counts.orange >= 3) return CHAOS; // massive decay or chaos → chaos
        return "off";                                           // otherwise disappears

    case SPARK: // spark
        if (counts.red > 0) return CHAOS;                       // destroyed by chaos
        for (let [dq, dr] of dirs) {
            const n = get(q+dq, r+dr);
            if (n==="off") return SPROUT;                     // spark creates a new sprout
        }
        return "off";

    case CHAOS: // chaos
        return "off";                                           // disappears after effect
}

return state;
return "green";
return "blue";
return "orange";
return "yellow";
return "red";



// ================== Laser Shooter ==================
// A blue button shoots a laser (green) when pressed (yellow)
// The laser propagates to the right
// A meteor generator (orange) randomly creates meteors (red)
// Meteors fall down and disappear when a laser hits them

const BUTTON = "blue";
const BUTTON_PRESSED = "yellow";
const LASER = "green";
const METEOR_GENERATOR = "orange";
const METEOR = "red";

// --- button behavior ---
if (state === BUTTON)
  return BUTTON;

if (state === BUTTON_PRESSED)
  return getHistory(-1, q, r);

// --- laser behavior ---
if (state === LASER)
  return "off";

if (get(q-1, r) === BUTTON_PRESSED &&
    getHistory(-1, q-1, r) === BUTTON)
  return LASER;

if (get(q-1, r) === LASER)
  return LASER;

// --- meteor behavior ---
if (get(q+1, r-1) === METEOR_GENERATOR)
    if (Math.random() < 0.02)
        return METEOR;

if (get(q+1, r-1) === METEOR)
    return METEOR;

if (state === METEOR)
    return "off";

return state;
return "blue";
return "yellow";
return "orange";
// User never need to place a laser (green) cell or a meteor (red)cell manually



// ================== Auto-pathing with obstacles ==================
// An orange cell propagates toward a yellow spark
// Propagation follows the closest path to the spark
// "on" cells are impassable obstacles
// The yellow spark is absorbed when reached by orange

const PLAYER = "orange";
const DIRECTION = "yellow";

const dirs = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];

const GRID_RADIUS = 17;

// --- hexagonal distance (used to move toward the spark) ---
function hexDistance(q1, r1, q2, r2) {
    return (Math.abs(q1 - q2)
          + Math.abs(q1 + r1 - q2 - r2)
          + Math.abs(r1 - r2)) / 2;
}

// --- global search for yellow sparks ---
let sparks = [];
for (let qq = -GRID_RADIUS; qq <= GRID_RADIUS; qq++) {
    for (let rr = -GRID_RADIUS; rr <= GRID_RADIUS; rr++) {
        if (get(qq, rr) === DIRECTION) {
            sparks.push({ q: qq, r: rr });
        }
    }
}

// --- spark absorption ---
// If a yellow cell is adjacent to an orange cell,
// the spark is absorbed and becomes orange
if (state === DIRECTION) {
    for (let [dq, dr] of dirs) {
        if (get(q + dq, r + dr) === PLAYER) {
            return PLAYER;
        }
    }
}

// --- yellow cell behavior ---
// Only one spark can exist at a time
if (state === DIRECTION) {
    if (sparks.length > 1) return "off";
    return DIRECTION;
}

// --- orange cell behavior ---
// If a spark exists elsewhere, the orange cell disappears
if (state === PLAYER) {
    if (sparks.length > 0) return "off";
    return PLAYER;
}

// --- orange propagation toward the spark ---
// A cell adjacent to an orange can become orange
// if it is the closest one to the spark
let adjacentOrange = null;
for (let [dq, dr] of dirs) {
    if (get(q + dq, r + dr) === PLAYER) {
        adjacentOrange = { q: q + dq, r: r + dr };
        break;
    }
}

if (adjacentOrange && sparks.length > 0) {
    const spark = sparks[0]; // only one can remain

    let minDist = Infinity;
    let bestCell = null;

    // Test all cells around the orange
    for (let [dq, dr] of dirs) {
        const cq = adjacentOrange.q + dq;
        const cr = adjacentOrange.r + dr;

        // "on" cells are strict obstacles
        if (get(cq, cr) === "on") continue;

        // Choose the cell closest to the spark
        const d = hexDistance(cq, cr, spark.q, spark.r);

        if (d < minDist) {
            minDist = d;
            bestCell = { q: cq, r: cr };
        }
    }

    // If the current cell is the best candidate,
    // it becomes orange
    if (bestCell && bestCell.q === q && bestCell.r === r) {
        return PLAYER;
    }
}

return state;
return "orange";
return "yellow";