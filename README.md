# 🔷 RULEWORLD — by MadeByQwerty

**RuleWorld** is a hexagonal cellular automata simulator inspired by the Game of Life.
Create your own rules using JavaScript and watch colorful patterns evolve on a hex grid!

---

## ▶️ How to Play

**Controls**

| Action              | Control              |
| :------------------ | :------------------- |
| Start / Pause       | ▶ / ⏸ button         |
| Step one generation | +1 Génération button |
| Randomize grid      | 🎲 Aléatoire button  |
| Clear grid          | 🗑 Vider button      |
| Change brush        | Brush dropdown       |
| Adjust speed        | Speed slider         |
| Rotate grid         | Rotation slider      |
| Zoom in/out         | Zoom slider          |

**Goal**
Experiment with custom rules and paint cells manually to see them evolve.
Each generation updates the grid according to your rule logic.

---

## 💻 Installation & Run

**Requirements**

* Any modern browser (Chrome, Firefox, Edge, etc.)

**How to launch**

1. Open `RuleWorld.html` in your browser.
2. The simulation starts with a random grid.
3. Edit rules in the CodeMirror editor and click **✓ Appliquer la règle** to apply them.

No server or dependencies required — pure HTML, CSS, and JS.

---

## 🗺️ Grid

* The grid is **hexagonal** with a default radius of 17 hexes.
* Click a cell to toggle its state using the brush.
* Each cell can have multiple states, dynamically created by your rules.

**Default states**

| State | Color |
| :---- | :---- |
| `off` | White |
| `on`  | Black |

New states discovered in rules automatically get unique colors.

---

## 📝 Writing Rules

Rules are JavaScript functions:

```js
function(state, q, r, get, getHistory) {
    // state = current cell state
    // q, r = hex coordinates
    // get(q, r) = read state of a cell
    // getHistory(offset, q, r) = read previous generation
    return "newState"; // must return a string
}
```

**Tips**

* Returning a valid HTML color (e.g., `"red"`, `"#ff0000"`) will paint the cell in that color.
* Check neighbors manually with `get(q + dq, r + dr)`.
* Use `getHistory(-1, q, r)` to reference previous generations.

**Example: Hexagonal Game of Life**

```js
let count = 0;
const dirs = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
for (let [dq, dr] of dirs) if (get(q + dq, r + dr) === "on") count++;

if (state === "off" && count === 2) return "on";
if (state === "on" && (count === 2 || count === 3)) return "on";
return "off";
```

---

## 🧰 Presets

A separate file named **`Exemples.js`** provides ready-to-use rule presets.
You can copy rules from this file into the editor to quickly test interesting behaviors, like multi-state automata or custom Game of Life variations.

---

## ⚙️ Customization

* **Brush:** choose a state to paint manually.
* **Speed:** adjust the simulation speed.
* **Rule editor:** create and test your own rules.
* **Colors:** new states get unique HSL colors automatically.
* **Grid rotation & zoom:** rotate the entire grid or zoom in/out for better view.

---

## 🧠 Author

**MadeByQwerty** — solo indie developer.

Find more projects on [itch.io](https://madebyqwerty.itch.io)

---

## 🪄 License

Released under the **MIT License**.
Please credit **MadeByQwerty** if you use or modify the project.
