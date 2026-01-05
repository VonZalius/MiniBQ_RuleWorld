// ================== Jeu de la vie hexagonal ==================
// Une cellule "off" devient "on" si elle a exactement 2 voisins "on"
// Une cellule "on" reste "on" si elle a 2 ou 3 voisins "on"

// Compter les voisins "on" manuellement
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



// ================== Simulation de gravité ==================
// Une cellule "on" tombe si la cellule en dessous ou en diagonal en dessous est "off"
// Une cellule "off" devient "on" si une cellule "on" est au dessus
// Une cellule "off" devient "on" si une cellule "on" est en diagonal en haut-gauche ou en diagonal en haut-droit, si la cellule intermédiaire n'est pas "off"
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



// ================== Diffusion de vie ==================
/*Simule la vie qui pousse, évolue et décline de façon organique.
- Les "on" initiaux sont transformés en états colorés selon leurs voisins.
- Les cellules évoluent, peuvent se propager, se détruire ou disparaître.
- Sur une grille vide, des clusters peuvent très rarement apparaitre après beaucoup de generations.

Signification des couleurs :
- green   : jeune pousse
- blue    : cellule mature
- orange  : cellule en déclin (decay)
- yellow  : spark, foyer créateur de nouvelle vie
- red     : chaos, foyer destructeur
- off     : cellule vide / morte
*/

const dirs = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];

// --- Transformation des "on" initiaux ---
// Selon le nombre de voisins "on", on remplace la cellule par un état de la simulation
if(state === "on") {
    let onNeighbors = 0;
    for (let [dq, dr] of dirs) {
        if(get(q+dq, r+dr) === "on") onNeighbors++;
    }

    if(onNeighbors === 0) return "off";       // isolé → éteint
    if(onNeighbors <= 2) return "green";      // petit cluster → pousse
    if(onNeighbors <= 4) return "blue";       // cluster moyen → mature
    return "orange";                          // cluster dense → decay
}

// --- Comptage des voisins par état ---
let counts = { off:0, green:0, blue:0, orange:0, yellow:0, red:0 };
for (let [dq, dr] of dirs) {
    const n = get(q + dq, r + dr);
    if (counts[n] !== undefined) counts[n]++;
}

// --- Densité locale sur un rayon de 2 (pour éviter surpopulation) ---
let localLife = 0;
for (let dq=-2; dq<=2; dq++) {
    for (let dr=-2; dr<=2; dr++) {
        if (dq===0 && dr===0) continue;
        const n = get(q+dq, r+dr);
        if (["green","blue"].includes(n)) localLife++;
    }
}

// --- Historique pour maturation progressive ---
const last = getHistory(-1, q, r);
const last2 = getHistory(-2, q, r);

// --- Paramètres ---
const densityThreshold = 8;   // limite de densité avant déclin
const chaosChance = 0.0005;   // chance de foyer destructeur aléatoire
const sparkChance = 0.001;    // chance de foyer de vie aléatoire

switch(state) {
    case "off":
        // --- Création déterministe de foyer (yellow) ---
        if ( counts.blue === 1 && counts.green === 0 && counts.orange === 0 && counts.red === 0 && counts.yellow === 0)
            return "yellow";

        // --- Création aléatoire ---
        if (Math.random() < sparkChance) return "yellow"; 
        if (Math.random() < chaosChance) return "red";
        return "off";

    case "green": // pousse
        if (counts.red > 0) return "red";                       // destruction par chaos
        if (localLife >= densityThreshold) return "orange";     // trop dense → decay
        if (counts.blue + counts.green === 0) return "off";     // isolé → off
        if (last==="green" && last2==="green" && getHistory(-3,q,r)==="green") return "blue"; // maturation
        return "green";

    case "blue": // mature
        if (counts.red > 0) return "red";                       // destruction par chaos
        if (last==="blue" && last2==="blue") return "orange";  // vieillissement → decay
        if (counts.green + counts.blue <= 1) return "green";   // trop peu de voisins → redevenir pousse
        if (localLife > densityThreshold + 3) return "orange";  // surpopulation → decay
        return "blue";

    case "orange": // decay
        if (counts.red > 0 || counts.orange >= 3) return "red"; // decay massif ou chaos → chaos
        return "off";                                           // sinon disparaît

    case "yellow": // spark
        if (counts.red > 0) return "red";                       // destruction par chaos
        for (let [dq, dr] of dirs) {
            const n = get(q+dq, r+dr);
            if (n==="off") return "green";                     // spark crée une nouvelle pousse
        }
        return "off";

    case "red": // chaos
        return "off";                                           // disparaît après effet
}

return state;
