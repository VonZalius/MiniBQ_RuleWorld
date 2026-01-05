// ================== Hexagonal Game of Life ==================
// An "off" cell becomes "on" if it has exactly 2 "on" neighbors
// An "on" cell stays "on" if it has 2 or 3 "on" neighbors

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
/*Simulates life growing, evolving, and declining in an organic way.
- Initial "on" cells are transformed into colored states based on neighbors.
- Cells evolve, can spread, be destroyed, or disappear.

Color meaning:
- green   : young sprout
- blue    : mature cell
- orange  : decaying cell
- yellow  : spark, life-creating seed
- red     : chaos, destructive seed
- off     : empty / dead cell
*/

const dirs = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];

// --- Initial "on" transformation ---
// Depending on the number of "on" neighbors, the cell is replaced by a simulation state
if(state === "on") {
    let onNeighbors = 0;
    for (let [dq, dr] of dirs) {
        if(get(q+dq, r+dr) === "on") onNeighbors++;
    }

    if(onNeighbors === 0) return "off";       // isolated → dies
    if(onNeighbors <= 2) return "green";      // small cluster → sprout
    if(onNeighbors <= 4) return "blue";       // medium cluster → mature
    return "orange";                          // dense cluster → decay
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
        if (["green","blue"].includes(n)) localLife++;
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
            return "yellow";

        // --- Random creation ---
        return "off";

    case "green": // sprout
        if (counts.red > 0) return "red";                       // destroyed by chaos
        if (localLife >= densityThreshold) return "orange";     // too dense → decay
        if (counts.blue + counts.green === 0) return "off";     // isolated → off
        if (last==="green" && last2==="green" && getHistory(-3,q,r)==="green") return "blue"; // maturation
        return "green";

    case "blue": // mature
        if (counts.red > 0) return "red";                       // destroyed by chaos
        if (counts.green + counts.blue <= 1) return "green";   // too few neighbors → revert to sprout
        if (localLife > densityThreshold + 6) return "orange";  // overpopulation → decay
        return "blue";

    case "orange": // decay
        if (counts.red > 0 || counts.orange >= 3) return "red"; // massive decay or chaos → chaos
        return "off";                                           // otherwise disappears

    case "yellow": // spark
        if (counts.red > 0) return "red";                       // destroyed by chaos
        for (let [dq, dr] of dirs) {
            const n = get(q+dq, r+dr);
            if (n==="off") return "green";                     // spark creates a new sprout
        }
        return "off";

    case "red": // chaos
        return "off";                                           // disappears after effect
}

return state;
