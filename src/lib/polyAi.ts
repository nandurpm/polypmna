/**
 * Public fallback for static hosting. Convex remains the preferred persistence
 * path, but a visitor should never lose a response because anonymous auth is
 * still starting or temporarily unavailable.
 */

const markdown = (...parts: string[]) => parts.join("\n\n");

export const POLY_AI_SCOPE_RESPONSE = `## POLY AI Scope
I’m POLY AI, a Kerala Polytechnic study assistant. I can help with Polytechnic subjects, engineering concepts, formulas, programming, practical topics, syllabus, question papers, and exam preparation.

Please ask a Polytechnic-related question.`;

const HARD_BLOCKED_SCOPE_PATTERN = /\b(politic|politician|election|news|current\s+affairs|celebrity|movie|film|entertainment|music|song|sport|cricket|football|porn|pornographic|pornography|sexual|sexually|nude|nudity|murder|terror|terrorism|offen[cs]e)\b/i;
// Words that block only when there is no clear Polytechnic context.
// "crime" / "weapon" can appear legitimately in cybersecurity or
// mechanical-engineering questions (e.g. "cybercrime detection in
// network engineering"), so they are vetoed only when the query
// does not also match a Polytechnic keyword.
const CONTEXTUAL_BLOCKED_SCOPE_PATTERN = /\b(history|geography|life\s+advice|crime|criminal|weapon)\b/i;
const GENERAL_KNOWLEDGE_PATTERN = /\b(?:who\s+is|who\s+was|what\s+is\s+the\s+(?:capital|currency|national\s+animal|national\s+flower)|which\s+(?:country|planet|state|ocean|river)|how\s+many\s+continents|largest\s+state|smallest\s+state|fastest\s+land\s+animal|highest\s+mountain|first\s+person\s+to\s+walk\s+on\s+the\s+moon|invented\s+the\s+telephone)\b/i;
const POLYTECHNIC_CONTEXT_PATTERN = /\b(kerala\s+polytechnic|polytechnic|diploma|curriculum|syllabus|revision\s*(?:2026|2021|2015)?|semester|subject|course|model\s*paper|question\s*paper|exam|laboratory|lab\s*work|engineering|technical|circuit|algorithm|programming|program|code|database|sql|data\s+structures?|binary\s+trees?|binary\s+search\s+tree|bst|tree\s+traversal|binary\s+search|stack|queue|linked\s+lists?|hash\s+tables?|sorting|searching|recursion|complexity|big\s*o|pointer|array|electronics?|electrical|mechanical|civil|automobile|instrumentation|communication|computer|physics|chemistry|mathematics|calculus|integral|derivative|trigonometry|matrix|formula|numerical|student\s+marks?|marks\s+calculator|average\s+calculation|grade|kirchhoff|voltage\s+law|current\s+law|resistor|resistance|series|parallel|equivalent\s+resistance|diode|transistor|mosfet|amplifier|op\s*-?amp|kcl|kvl|buck\s+converter|emi\s+filter|bending\s+moment|four\s*stroke|thermodynamics?|boiler|heat\s+exchanger|turbine|pump|compressor|refrigeration|hvac|fluid\s+mechanics?|hydraulics?|strength\s+of\s+materials?|materials?\s+science|manufacturing|workshop|machine\s+design|gear|bearing|casting|forging|nuclear|engineering\s+drawing|surveying|construction|statics|dynamics|kinematics|kinetics|force|torque|stress|strain|welding|lathe|cnc|cad|robotics|renewable\s+energy|solar|power\s+electronics|transformer|motor|generator|relay|plc|microprocessor|microcontroller|control\s+system|signals?\s+and\s+systems|digital\s+logic|analog|semiconductor|telecommunication|operating\s+system|computer\s+network|networking|cybersecurity|embedded|linux|object[-\s]+oriented|compiler|html|css|javascript|java|python|c\+\+|machine\s+learning|internet\s+of\s+things|iot)\b/i;
const GREETING_PATTERN = /^\s*(?:hi|hello|hey|namaste|good\s+(?:morning|afternoon|evening))[.!? ]*$/i;
const THANKS_PATTERN = /^\s*(?:thanks?|thank\s+you|thankyou)[.!? ]*$/i;
const BASIC_ARITHMETIC_PATTERN = /^\s*(?:what\s+is\s+)?(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\s*[?!. ]*$/i;

export function isPolyAiUtilityQuery(query: string): boolean {
  return GREETING_PATTERN.test(query) || THANKS_PATTERN.test(query) || BASIC_ARITHMETIC_PATTERN.test(query);
}

export function isPolyAiQueryInScope(query: string): boolean {
  const q = query.trim();
  if (!q || HARD_BLOCKED_SCOPE_PATTERN.test(q)) return false;
  if (isPolyAiUtilityQuery(q)) return true;

  // A clear Polytechnic context takes precedence over incidental words such as
  // “history” in “history of the transistor.” The server prompt remains the
  // final scope authority for ambiguous requests.
  if (POLYTECHNIC_CONTEXT_PATTERN.test(q)) return true;
  if (CONTEXTUAL_BLOCKED_SCOPE_PATTERN.test(q) || GENERAL_KNOWLEDGE_PATTERN.test(q)) return false;
  return true;
}

export function isPolyAiLocalFallbackAllowed(query: string): boolean {
  const q = query.trim();
  return isPolyAiUtilityQuery(q) || POLYTECHNIC_CONTEXT_PATTERN.test(q) || isFocusedPolyAiQuery(q);
}

export function isCurriculumDatabaseQuery(query: string): boolean {
  const q = query.toLowerCase();
  return /\b(curriculum|catalog(u)?e?|database|schema|index|aggregation|aggregate|department|semester|duplicate|model\s*paper|lesson|resource\s*link)\b/.test(q)
    && /\b(sql|query|database|schema|count|subject|revision|department|semester|resource|link|model\s*paper|lesson)\b/.test(q);
}

export function isLeakedPolyAiResponse(response: string): boolean {
  return /thinking\s+process|analyze\s+user\s+input|determine\s+response\s+style|let\s+(?:me\s+)?draft/i.test(response);
}

export function isGenericPolyAiResponse(response: string): boolean {
  return /poly ai scope|please ask a polytechnic-related question|exam preparation strategy|that's a great question|i can help (?:with|explain) kerala polytechnic|what specific topic would you like me to explain|please include the subject name or topic|i received (?:your )?question|i received [“"]|add the exact topic|add the subject or topic|i['’]?m ready to explain it|for example, ask ['“]why does|here is a focused study answer for/i.test(response);
}

export function isFocusedPolyAiQuery(query: string): boolean {
  const q = query.toLowerCase();
  return isCurriculumDatabaseQuery(query)
    || /\b(ohm|binary\s+tree|sql|nosql|transistor|bjt|mosfet|diode|pn\s*junction|zener|rectifier|led|amplifier|op\s*-?amp|capacitor|inductor|resistor|kcl|kvl|kirchhoff|bending\s+moment|shear\s+force|four\s+stroke|data\s+structure|stack|queue|linked\s+list)\b/.test(q);
}

export function sanitizePolyAiResponse(response: string): string {
  let cleaned = response.trim();
  const heading = /(?:^|\n|\*\*)\s*(?:let\s+(?:me\s+)?draft|final\s+answer|answer)\s*:\s*\**/im.exec(cleaned);
  const reasoningMarker = /^(?:here(?:'s| is)\s+)?(?:a\s+)?thinking\s+process\s*:/i.test(cleaned);
  if (heading?.index !== undefined) cleaned = cleaned.slice(heading.index + heading[0].length).trim();
  else if (reasoningMarker) return "";
  return cleaned
    .replace(/^\s*(?:user|response)\s+safety\s*:\s*(?:safe|unsafe|unknown)\s*$/gim, "")
    .replace(/^\s*safety\s*:\s*(?:safe|unsafe|unknown)\s*$/gim, "")
    .replace(/\\(?:\[|\]|\(|\))/g, "")
    .replace(/([A-Za-z])(?:_|\\*)\\{([^{}]+)\\}/g, "$1_$2")
    .replace(/\\+text\\{([^{}]+)\\}/g, "$1")
    .replace(/\\+sqrt\{([^{}]+)\}/g, "√($1)")
    .replace(/\\+frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)")
    .replace(/\\+(sin|cos|tan|log|ln)\b/g, "$1")
    .replace(/\^?\\+circ\b/g, "°")
    .replace(/\\+times/g, "×")
    .replace(/\\+cdot/g, "·")
    .replace(/\\+(?:dots|ldots)/g, "…")
    .replace(/\\_/g, "_")
    .replace(/\\,/g, " ")
    .replace(/\$\$?([\s\S]*?)\$\$?/g, "$1")
    .replace(/\b([A-Za-z])\*\{([A-Za-z0-9]+)\}/g, "$1_$2")
    .replace(/\b([A-Za-z])\*(\d+)\b/g, "$1_$2")
    .trim();
}

function localAnswerForUnknownQuery(query: string): string {
  const clean = query.trim().replace(/[?]+$/, "");
  const q = clean.toLowerCase();

  const sumMatch = q.match(/sum\s+of\s+(?:the\s+)?(?:first|1st)\s+(\d+)\s+numbers?/i);
  if (sumMatch) {
    const n = Number(sumMatch[1]);
    const total = n * (n + 1) / 2;
    return markdown(`## Sum of the first ${n} natural numbers`, `For the first **${n}** natural numbers, use **S = n(n + 1) / 2**.`, `| n | Calculation | Result |\n|---:|---|---:|\n| ${n} | ${n} × (${n} + 1) / 2 | ${total} |`, "```text\nS = n(n + 1) / 2\n```", "This formula assumes the sequence 1, 2, 3, …, n. If your sequence starts at another value, provide the first and last terms.");
  }
  if (/\btransformer\b/.test(q)) {
    return markdown(
      "## Transformer working principle",
      "A transformer is a static electrical device that transfers alternating-current power between windings through mutual electromagnetic induction. An alternating primary current creates a changing magnetic flux in the core, which induces an EMF in the secondary winding.",
      ["```text", "V₂ / V₁ = N₂ / N₁", "", "V₁, V₂ = primary and secondary RMS voltages", "N₁, N₂ = primary and secondary turns", "```"].join("\n"),
      "| Part | Function |\n|---|---|\n| Laminated iron core | Provides a low-reluctance magnetic path and reduces eddy-current loss |\n| Primary winding | Receives the AC input |\n| Secondary winding | Delivers the transformed AC output |\n| Insulation and tank | Provides electrical isolation, cooling, and safety |",
      "```mermaid\nflowchart LR\n  AC[AC supply] --> Primary[Primary winding N₁]\n  Primary --> Flux[Changing core flux Φ]\n  Flux --> Secondary[Secondary winding N₂]\n  Secondary --> Load[Electrical load]\n```",
      "A transformer requires changing flux, so ordinary DC cannot sustain transformer action after the switching transient. For a step-up transformer N₂ > N₁; for a step-down transformer N₂ < N₁. In practice, check insulation, frequency, VA rating, regulation, cooling, and protection.",
    );
  }
  if (/\bboiler\b/.test(q)) {
    return markdown(
      "## Boiler working principle",
      "A boiler converts the chemical or electrical energy supplied to a heat source into thermal energy in water, producing hot water or steam at a controlled pressure. The steam can drive a turbine, provide process heat, or support heating systems.",
      "| Main part | Function |\n|---|---|\n| Furnace or heating element | Supplies heat |\n| Water tubes or shell | Transfers heat to water |\n| Steam drum | Separates steam from water in drum-type boilers |\n| Safety valve | Releases pressure if it exceeds the safe limit |\n| Feed pump | Supplies treated water at the required pressure |",
      ["```mermaid", "flowchart LR", "  Fuel[Fuel or electrical heat] --> Furnace[Heat release]", "  Feed[Feed-water pump] --> Boiler[Boiler heat-transfer surfaces]", "  Furnace --> Boiler", "  Boiler --> Steam[Steam generation]", "  Steam --> Process[Process heat or turbine]", "```"].join("\n"),
      "Important checks include feed-water treatment, level control, pressure control, blowdown, combustion efficiency, and safety-valve testing. Never operate a pressurized boiler without approved protection and trained supervision.",
    );
  }
  if (/\bheat\s+exchanger\b/.test(q)) {
    return markdown(
      "## Heat exchanger",
      "A heat exchanger transfers thermal energy between two fluids at different temperatures, normally without allowing them to mix. Heat flows from the hot fluid to the cold fluid through a separating wall.",
      ["```text", "Q = U A ΔTₗₘ", "", "Q       = heat-transfer rate", "U       = overall heat-transfer coefficient", "A       = heat-transfer area", "ΔTₗₘ    = log-mean temperature difference", "```"].join("\n"),
      "| Type | Flow arrangement | Typical feature |\n|---|---|---|\n| Parallel flow | Both fluids enter from the same end | Large initial temperature difference |\n| Counterflow | Fluids move in opposite directions | Usually better temperature effectiveness |\n| Shell-and-tube | Tubes inside a shell | Common in industrial service |\n| Plate | Thin plates form alternating channels | Compact and easy to expand |",
      ["```mermaid", "flowchart LR", "  HotIn[Hot fluid in] --> Wall[Conducting wall] --> HotOut[Hot fluid out]", "  ColdIn[Cold fluid in] --> Wall --> ColdOut[Cold fluid out]", "```"].join("\n"),
      "Design checks include fouling resistance, pressure drop, material compatibility, leakage, thermal expansion, and the required outlet temperatures.",
    );
  }
  if (/\bemi\s*filter|electromagnetic\s+interference/.test(q)) {
    return markdown(
      "## EMI filter",
      "An EMI (electromagnetic-interference) filter reduces unwanted high-frequency electrical noise entering or leaving equipment through power or signal wires. It protects nearby circuits and helps equipment meet electromagnetic-compatibility requirements.",
      "| Part | Function |\n|---|---|\n| Common-mode choke | Attenuates noise shared by both conductors |\n| X capacitor | Filters differential noise across line and neutral |\n| Y capacitor | Diverts common-mode noise safely to earth |",
      "```mermaid\nflowchart LR\n  Noise[Noisy supply] --> Choke[Common-mode choke]\n  Choke --> Capacitors[X/Y capacitors]\n  Capacitors --> Clean[Cleaner power to equipment]\n```",
      "Select capacitor safety classes and voltage/current ratings carefully; Y capacitors must be approved for line-to-earth use."
    );
  }
  if (/\bsin\s*60(?:°|\s*degrees)?\b/.test(q)) {
    if (/\bintegral|integrate|integration\b/.test(q)) {
      return markdown("## Integral involving sin 60°", "If the question means the constant value **sin 60°**, then **sin 60° = √3/2** and integrating with respect to x gives:", "```text\n∫ sin(60°) dx = ∫ (√3/2) dx = (√3/2)x + C\n```", "> If you meant **∫ sin(x) dx**, the answer is **−cos(x) + C**. The variable of integration changes the result.");
    }
    return markdown("## sin 60°", "For the standard 30°–60°–90° triangle, **sin 60° = opposite / hypotenuse = √3/2 ≈ 0.8660**.", "| Expression | Exact value | Decimal value |\n|---|---:|---:|\n| sin 60° | √3/2 | 0.8660 |", "```mermaid\nflowchart TD\n  Angle[60° angle] --> Triangle[30°–60°–90° triangle]\n  Triangle --> Ratio[Opposite / Hypotenuse]\n  Ratio --> Result[√3 / 2 ≈ 0.8660]\n``` ");
  }
  if (/\bbuck\s+converter\b/.test(q)) {
    return markdown(
      "## Buck converter",
      "A buck converter is a step-down DC–DC converter. A high-frequency switch applies the input voltage to an inductor; the inductor, diode or synchronous MOSFET, capacitor, and load smooth the switched waveform into a lower DC output.",
      "### Ideal continuous-conduction derivation\nDuring the switch-on interval, the inductor voltage is **Vᵢₙ − Vₒ** for duty ratio **D**. During switch-off, it is **−Vₒ**. Volt-second balance gives:\n\n```text\nD(Vin − Vout) + (1 − D)(−Vout) = 0\nVout = D × Vin\n```\n\nTherefore, for an ideal buck converter, **D = Vout/Vin**.",
      "| Item | Continuous conduction (CCM) | Discontinuous conduction (DCM) |\n|---|---|---|\n| Inductor current | Never reaches zero | Reaches zero each cycle |\n| Ideal voltage relation | Vout ≈ D × Vin | Depends on D, load, L, and frequency |\n| Design assumption | Usually easier to model | Requires a second conduction interval |\n| Ripple control | Select L and C for limits | Check peak current and boundary condition |",
      "| Component | Selection check |\n|---|---|\n| Switch | Voltage, current, switching loss |\n| Inductor | Saturation current and ripple |\n| Diode/MOSFET | Reverse voltage or conduction loss |\n| Capacitor | Ripple current, ESR, voltage rating |",
      "```mermaid\nflowchart LR\n  Vin[DC input] --> Switch[High frequency switch]\n  Switch --> Inductor[Inductor]\n  Inductor --> Capacitor[Output capacitor]\n  Capacitor --> Load[Lower DC output]\n  Load --> Feedback[Measure Vout]\n  Feedback --> Control[Adjust duty ratio D]\n  Control --> Switch\n```",
      "```c\n#include <stdio.h>\n\nint main(void) {\n    double vin = 24.0, vout = 12.0;\n    double duty = vout / vin;\n    printf(\"Ideal duty ratio = %.3f (%.1f%%)\\n\", duty, duty * 100.0);\n    return 0;\n}\n```"
    );
  }
  if (/\bcad\b|computer\s*-?aided\s+design/.test(q)) {
    return markdown("## CAD software", "Computer-Aided Design (CAD) software is used to create, edit, analyse, and document precise 2D drawings and 3D models.", "| Use | Example output |\n|---|---|\n| Drafting | Plans, sections, dimensions |\n| 3D modelling | Parts, assemblies, surfaces |\n| Engineering analysis | Stress, fluid, thermal, or motion studies |\n| Manufacturing | CNC tool paths and technical drawings |", "```mermaid\nflowchart LR\n  Design[Design intent] --> Model[2D/3D CAD model]\n  Model --> Analyse[Analyse and revise]\n  Analyse --> Document[Drawing or manufacturing output]\n```");
  }
  const topic = clean.replace(/^(please\s+)?(explain|define|describe|what\s+is|what\s+are|how\s+does|how\s+do|why\s+does|why\s+is|why\s+are)\s+/i, "").trim();
  return markdown(
    `## ${topic || "Your question"}`,
    `Here is a focused study answer for **${clean}**. Start by identifying the definition, the working principle, the important parts or steps, and one practical example.`,
    "| Study lens | What to check |\n|---|---|\n| Definition | What the term means |\n| Working | The cause-and-effect sequence |\n| Formula or rule | The governing relationship |\n| Application | Where it is used |",
    "I can expand this into a derivation, worked numerical, comparison table, program, or flowchart when you specify the desired format."
  );
}

export function generatePolyAiResponse(query: string): string {
  const q = query.toLowerCase();
  const clean = query.trim();

  if (GREETING_PATTERN.test(clean)) {
    return markdown("## Hello from POLY AI", "I’m your Kerala Polytechnic study assistant. Ask about a subject concept, formula, diagram, program, curriculum record, or exam preparation topic.", "> Tip: Specific questions produce the best explanations—for example, *derive the RC charging equation* or *write a C program for binary search*.");
  }
  if (THANKS_PATTERN.test(clean)) {
    return markdown("## You’re welcome", "Keep revising from the syllabus, practise previous question papers, and use the curriculum directory to locate your subject resources. All the best for your exams!");
  }
  const arithmeticMatch = clean.match(BASIC_ARITHMETIC_PATTERN);
  if (arithmeticMatch) {
    const left = Number(arithmeticMatch[1]);
    const right = Number(arithmeticMatch[3]);
    const operator = arithmeticMatch[2];
    if (operator === "/" && right === 0) return markdown("## Arithmetic", "Division by zero is undefined. Please provide a non-zero divisor.");
    const result = operator === "+" ? left + right : operator === "-" ? left - right : operator === "*" ? left * right : left / right;
    return markdown("## Arithmetic result", `**${left} ${operator} ${right} = ${result}**`, "This quick calculation is handled locally so the chat responds immediately.");
  }
  if (!isPolyAiLocalFallbackAllowed(query)) return POLY_AI_SCOPE_RESPONSE;

  if (/\b(ohm'?s?\s*law|ohms?\s*law)\b/.test(q)) {
    const includeProgram = /\b(program|programming|code|c\s*language)\b/.test(q);
    return markdown(
      "## Ohm’s Law",
      "For a conductor at constant temperature, current is directly proportional to the potential difference across it. The relationship is **V = IR**.",
      "| Quantity | Symbol | SI unit | Rearrangement |\n|---|---:|---|---|\n| Voltage | V | volt (V) | V = IR |\n| Current | I | ampere (A) | I = V/R |\n| Resistance | R | ohm (Ω) | R = V/I |",
      "```mermaid\nflowchart LR\n  Voltage[Voltage V] --> Current[Current I]\n  Current --> Resistance[Resistance R]\n  Voltage --> Formula[V = I × R]\n```",
      ...(includeProgram ? ["```c\n#include <stdio.h>\n\nint main(void) {\n    float v = 12.0f, r = 4.0f;\n    printf(\"Current = %.2f A\\n\", v / r);\n    return 0;\n}\n```"] : []),
      "Electrical power follows from the same relationship: **P = VI = I²R = V²/R**. In a real circuit, check the resistor rating and the source polarity before connecting components."
    );
  }
  if (/\b(binary\s*tree|bst|binary\s*search\s*tree)\b/.test(q)) {
    return markdown(
      "## Binary tree properties",
      "A binary tree allows each node to have at most two children, conventionally called the left and right child. A binary search tree adds the ordering rule that smaller keys go left and larger keys go right.",
      "| Structure | Rule | Typical use |\n|---|---|---|\n| Full tree | Every node has 0 or 2 children | Structural analysis |\n| Complete tree | Levels are filled left to right | Heaps |\n| Balanced BST | Subtree heights stay close | Fast lookup |",
      "```mermaid\nflowchart TD\n  Root[Root node] --> Left[Smaller keys]\n  Root --> Right[Larger keys]\n  Left --> Leaf1[Continue recursively]\n  Right --> Leaf2[Continue recursively]\n```",
      "For a balanced BST, search, insertion, and deletion are typically **O(log n)**; in a badly skewed tree, the worst case becomes **O(n)**."
    );
  }
  if (/\b(sql\s*vs?\s*nosql|nosql\s*vs?\s*sql|difference.*sql.*nosql|sql.*nosql.*difference)\b/.test(q)) {
    return markdown(
      "## SQL versus NoSQL",
      "SQL systems organise related data in tables with a defined schema. NoSQL systems use models such as documents, key-value records, wide columns, or graphs and are useful when the data shape or scale changes quickly.",
      "| Feature | SQL | NoSQL |\n|---|---|---|\n| Data model | Tables and relations | Documents, key-value, graph, or wide-column |\n| Schema | Usually predefined | Often flexible |\n| Strength | Joins and transactions | Horizontal scale and flexible records |\n| Examples | PostgreSQL, MySQL | MongoDB, Redis |",
      "```sql\nSELECT department_id, semester, COUNT(*) AS subject_count\nFROM subjects\nGROUP BY department_id, semester;\n```",
      "Choose based on access patterns and consistency requirements, not on the label alone."
    );
  }
  if (/\b(transistor|bjt|mosfet)\b/.test(q)) {
    return markdown(
      "## How a transistor works",
      "A transistor uses a small control signal to regulate a larger current. In an NPN BJT, base current controls collector current; in a MOSFET, gate voltage controls the channel current between drain and source.",
      "| Device | Control variable | Common switching states |\n|---|---|---|\n| NPN BJT | Base current | Cutoff / saturation |\n| MOSFET | Gate-to-source voltage | Cutoff / ohmic |",
      "```mermaid\nflowchart TD\n  Input[Small control signal] --> Device[Transistor]\n  Device --> Output[Larger controlled current]\n  Device --> Use1[Switching]\n  Device --> Use2[Amplification]\n```",
      "For amplification, keep the device in its active region and check biasing, gain, bandwidth, heat dissipation, and maximum ratings."
    );
  }
  if (/\b(diode|pn\s*junction|zener|rectifier|led)\b/.test(q)) {
    return markdown(
      "## Diode and Zener diode",
      "A PN-junction diode conducts readily in forward bias because the applied voltage narrows the depletion region. In reverse bias it normally blocks current; a Zener diode is deliberately operated in controlled reverse breakdown to provide an approximately constant reference voltage.",
      "| Device/action | Bias | Main result |\n|---|---|---|\n| Silicon diode | Forward | Approximately 0.7 V drop and conduction |\n| Rectifier | Alternating forward/reverse | Converts AC to pulsating DC |\n| Zener | Reverse breakdown | Voltage reference or regulator |\n| LED | Forward | Light emission |",
      "```mermaid\nflowchart TD\n  Vin[Input voltage] --> R[Series resistor]\n  R --> Z[Zener in reverse bias]\n  Z --> Vout[Nearly constant VZ]\n```",
      "Always use a series resistor with a Zener regulator and verify its current and power ratings."
    );
  }
  if (/\b(amplifier|op\s*-?amp|operational\s+amplifier|gain|oscillator)\b/.test(q)) {
    return markdown(
      "## Amplifier fundamentals",
      "An amplifier transfers energy from its power supply to increase a signal’s voltage, current, or power. Its voltage gain is **Aᵥ = Vout/Vin**; with negative feedback, an op-amp’s closed-loop gain is mainly determined by its feedback network.",
      "| Check | Why it matters |\n|---|---|\n| Bias point | Prevents cutoff or saturation |\n| Gain | Sets signal amplification |\n| Bandwidth | Limits usable frequency range |\n| Output swing | Prevents clipping |\n| Feedback | Improves stability and accuracy |",
      "```text\nInput signal ──> [Amplifier + feedback] ──> Larger output signal\n                  Av = Vout / Vin\n```"
    );
  }
  if (/\b(kcl|kirchhoff'?s?\s*current|current\s*law)\b/.test(q)) {
    return markdown("## Kirchhoff’s Current Law (KCL)", "KCL follows conservation of charge: the algebraic sum of currents entering and leaving a node is zero.", "```text\nΣI = 0\nFor one entering current: I = I1 + I2 + I3\n```", "Use KCL at circuit nodes, choosing one current direction as positive and keeping the sign convention consistent.");
  }
  if (/\b(kvl|kirchhoff'?s?\s*voltage|voltage\s*law)\b/.test(q)) {
    return markdown("## Kirchhoff’s Voltage Law (KVL)", "KVL follows conservation of energy: the algebraic sum of all voltage rises and drops around a closed loop is zero.", "```text\n+V − IR1 − IR2 = 0\nTherefore: I = V / (R1 + R2)\n```", "Choose a loop direction, assign signs to each rise and drop, and keep the same direction while writing the complete equation.");
  }
  if (/\bbuck\s+converter\b/.test(q) && /\b(design|calculate|calculation|inductor|capacitance|capacitor|ripple|24\s*v|12\s*v|100\s*khz)\b/.test(q)) {
    return markdown(
      "## Buck converter design calculation",
      "Assume an ideal buck converter operating in continuous-conduction mode (CCM), with negligible switch and diode losses, fixed 100 kHz switching frequency, and triangular inductor current ripple.",
      "### 1. Duty cycle\n\nFor an ideal buck converter:\n\n```text\nD = Vout / Vin = 12 / 24 = 0.50\n```\n\nSo the nominal duty cycle is **50%**.",
      "### 2. Inductor value\n\nThe load current is 2 A and the specified ripple is 20%:\n\n```text\nΔIL = 0.20 × Iout = 0.20 × 2 = 0.40 A\nL = (Vin − Vout)D / (ΔIL × fs)\n  = (24 − 12) × 0.50 / (0.40 × 100000)\n  = 150 µH\n```\n\nChoose a practical inductor with a saturation-current rating above the peak current, **Ipeak = 2.0 + 0.40/2 = 2.20 A**.",
      "### 3. Minimum output capacitance\n\nIgnoring ESR, the capacitor ripple for triangular inductor current is approximately **ΔV = ΔIL / (8fsC)**. For a 50 mV limit:\n\n```text\nCmin = ΔIL / (8 × fs × ΔV)\n     = 0.40 / (8 × 100000 × 0.050)\n     = 10 µF\n```\n\nThe capacitor ESR should also be kept below approximately **ΔV/ΔIL = 0.050/0.40 = 0.125 Ω**. In practice, choose a higher-rated low-ESR capacitor after checking transient and tolerance margins.",
      "| Design quantity | Result | Design note |\n|---|---:|---|\n| Input voltage | 24 V | Source voltage |\n| Output voltage | 12 V | Ideal target |\n| Load current | 2 A | 24 W output |\n| Switching frequency | 100 kHz | Fixed assumption |\n| Duty cycle | 0.50 | 50% nominal |\n| Inductor ripple | 0.40 A peak-to-peak | 20% of load current |\n| Inductor | 150 µH minimum | Use saturation rating above 2.20 A |\n| Output capacitor | 10 µF minimum | Ignoring ESR; use low-ESR margin |",
      "```mermaid\nflowchart LR\n  Input[24 V input] --> Switch[50% duty switch]\n  Switch --> L[150 µH inductor]\n  L --> C[≥10 µF low-ESR capacitor]\n  C --> Load[12 V, 2 A load]\n  Load --> Feedback[Measure ripple and Vout]\n  Feedback --> Switch\n```",
      "These are ideal first-pass values. Real hardware must additionally check losses, inductor saturation, switch and diode ratings, capacitor RMS ripple current, control-loop stability, layout, temperature, and transient response."
    );
  }
  if (/\b(series|parallel)\b/.test(q) && /\b(resistor|resistance)\b/.test(q)) {
    return markdown(
      "## Series and parallel resistors",
      "In a **series circuit**, the same current flows through every resistor. In a **parallel circuit**, the same voltage appears across each branch.",
      "| Connection | Equivalent resistance | Key property |\n|---|---|---|\n| Series | **Rₑq = R₁ + R₂ + … + Rₙ** | Same current; resistances add |\n| Parallel | **1/Rₑq = 1/R₁ + 1/R₂ + … + 1/Rₙ** | Same voltage; conductances add |",
      "```text\nTwo parallel resistors:\nRₑq = (R₁ × R₂) / (R₁ + R₂)\n\nExample: R₁ = 4 Ω, R₂ = 6 Ω\nSeries:   Rₑq = 4 + 6 = 10 Ω\nParallel: Rₑq = (4 × 6)/(4 + 6) = 2.4 Ω\n```",
      "For more than two parallel resistors, use the reciprocal formula. The equivalent resistance of parallel resistors is always smaller than the smallest branch resistance."
    );
  }
  if (/\b(first\s+law|first\s+principle)\b/.test(q) && /\bthermodynamic|thermodynamics|heat|internal\s+energy|work\b/.test(q)) {
    return markdown(
      "## First law of thermodynamics",
      "The first law is conservation of energy applied to a thermodynamic system. Energy entering as heat increases the system’s internal energy or leaves as work.",
      "```text\nΔU = Q − W\n\nΔU = change in internal energy\nQ  = heat supplied to the system\nW  = work done by the system\n```",
      "| Quantity | Meaning | Sign convention used here |\n|---|---|---|\n| ΔU | Change in internal energy | Positive when internal energy increases |\n| Q | Heat transferred into the system | Positive when supplied to the system |\n| W | Work done by the system | Positive when the system expands and does work |",
      "### Engineering example\nIf a closed system receives **500 kJ** of heat and performs **200 kJ** of work, then **ΔU = Q − W = 500 − 200 = 300 kJ**. Its internal energy increases by 300 kJ, assuming changes in kinetic and potential energy are negligible.",
      "```mermaid\nflowchart LR\n  Heat[Heat supplied Q] --> Energy[System internal energy ΔU]\n  Energy --> Work[Work delivered W]\n  Balance[ΔU = Q − W] --> Energy\n```",
      "For an open-flow device such as a turbine, compressor, pump, or nozzle, use the steady-flow energy equation and include mass-flow, enthalpy, kinetic-energy, and potential-energy terms when they are significant."
    );
  }
  if (/\b(reynolds|fluid\s+mechanics|fluid\s+flow|viscosity|bernoulli)\b/.test(q)) {
    return markdown(
      "## Fluid-flow fundamentals",
      "Fluid mechanics studies fluids at rest and in motion. The Reynolds number compares inertial effects with viscous effects and helps predict whether internal flow is laminar or turbulent.",
      "```text\nRe = ρvD / μ = vD / ν\n\nρ = fluid density\nv = mean velocity\nD = characteristic diameter\nμ = dynamic viscosity\nν = kinematic viscosity\n```",
      "| Internal pipe flow | Approximate regime | Typical behaviour |\n|---:|---|---|\n| Re < 2,300 | Laminar | Smooth layers; viscous effects dominate |\n| 2,300–4,000 | Transition | Sensitive to disturbances |\n| Re > 4,000 | Turbulent | Mixing and fluctuating motion |",
      "Bernoulli’s equation for steady, incompressible, inviscid flow along a streamline is **p/ρg + v²/2g + z = constant**. Real pipe systems require head-loss terms for friction, valves, bends, and fittings.",
      "```mermaid\nflowchart LR\n  Properties[ρ, μ, v, D] --> Reynolds[Calculate Reynolds number]\n  Reynolds --> Regime{Flow regime}\n  Regime -->|Low Re| Laminar[Laminar model]\n  Regime -->|High Re| Turbulent[Turbulent model and losses]\n```"
    );
  }
  if (/\b(plc|programmable\s+logic\s+controller|ladder\s+logic)\b/.test(q)) {
    return markdown(
      "## PLC scan cycle",
      "A programmable logic controller repeatedly reads input devices, executes the control program, and updates output devices. This repeated loop is called the scan cycle.",
      "| Stage | Operation | Example |\n|---:|---|---|\n| 1 | Read inputs | Push buttons, sensors, limit switches |\n| 2 | Execute logic | Ladder rungs, timers, counters, comparisons |\n| 3 | Update outputs | Motors, relays, valves, indicators |\n| 4 | Housekeeping | Diagnostics and communication tasks |",
      "```mermaid\nflowchart LR\n  Inputs[Read inputs] --> Logic[Execute ladder logic]\n  Logic --> Outputs[Update outputs]\n  Outputs --> Diagnostics[Diagnostics and communication]\n  Diagnostics --> Inputs\n```",
      "A short scan time improves response, but input filtering, communication delays, timer resolution, and output device dynamics also affect the real control response. Use interlocks and a fail-safe design for hazardous machinery."
    );
  }
  if (/\b(capacitor|inductor|resistor|rc\s*circuit|rl\s*circuit)\b/.test(q)) {
    return markdown("## Basic circuit relationships", "Resistors relate voltage and current directly, capacitors store electric-field energy, and inductors store magnetic-field energy.", "| Component | Relationship | Time constant |\n|---|---|---|\n| Resistor | V = IR | — |\n| Capacitor | i = C dv/dt | RC |\n| Inductor | v = L di/dt | L/R |", "For an RC circuit, τ = RC; for an RL circuit, τ = L/R. The time constant describes how quickly the transient approaches its steady-state value.");
  }
  if (/\b(bending\s*moment|shear\s*force|bmd|sfd)\b/.test(q)) {
    return markdown("## Bending-moment diagram", "A bending-moment diagram plots internal bending moment along a beam. The slope of the diagram equals the shear force, **dM/dx = V**, while the change in shear is related to the distributed load.", "```mermaid\nflowchart LR\n  Load[Beam load] --> Shear[Shear-force diagram]\n  Shear --> Moment[Bending-moment diagram]\n  Moment --> Stress[Beam stress calculation]\n```", "For a simply supported beam with a central point load W and span L, the maximum bending moment is **WL/4**. State the sign convention before drawing the diagram.");
  }
  if (/\b(4\s*-?\s*stroke|four\s*stroke|internal\s*combustion|ic\s*engine)\b/.test(q)) {
    return markdown("## Four-stroke engine cycle", "A four-stroke engine completes one cycle through intake, compression, power, and exhaust. The piston makes four strokes and the crankshaft turns twice.", "| Stroke | Piston movement | Main event |\n|---|---|---|\n| Intake | TDC → BDC | Fresh charge enters |\n| Compression | BDC → TDC | Charge is compressed |\n| Power | TDC → BDC | Combustion drives piston down |\n| Exhaust | BDC → TDC | Burnt gases leave |", "```mermaid\nflowchart TD\n  Intake --> Compression\n  Compression --> Power\n  Power --> Exhaust\n  Exhaust --> Intake\n```");
  }
  if (/\bstudent\s+marks?|marks\s+calculator|average\s+calculation/.test(q)) {
    return markdown(
      "## Student marks calculator",
      "Read each mark, validate that it is numeric and within the allowed range (0–100), then accumulate the total and divide by the number of subjects. The examples below use a list of marks and reject invalid input.",
      "| Step | Rule |\n|---|---|\n| Validate | Every mark must be a finite number between 0 and 100 |\n| Accumulate | Add each valid mark to `total` |\n| Average | `average = total / count` |\n| Complexity | O(n) time and O(1) extra space for a streaming calculation |",
      "```c\n#include <stdio.h>\n\nint main(void) {\n    double marks[] = {78, 84, 91, 67};\n    int n = sizeof(marks) / sizeof(marks[0]);\n    double total = 0.0;\n\n    for (int i = 0; i < n; ++i) {\n        if (marks[i] < 0 || marks[i] > 100) {\n            printf(\"Invalid mark: %.2f\\n\", marks[i]);\n            return 1;\n        }\n        total += marks[i];\n    }\n    printf(\"Average = %.2f\\n\", total / n);\n    return 0;\n}\n```",
      "```python\ndef average_marks(marks):\n    if not marks:\n        raise ValueError(\"at least one mark is required\")\n    if any(not isinstance(mark, (int, float)) or not 0 <= mark <= 100 for mark in marks):\n        raise ValueError(\"each mark must be between 0 and 100\")\n    return sum(marks) / len(marks)\n\nprint(f\"Average = {average_marks([78, 84, 91, 67]):.2f}\")\n```",
      "```javascript\nfunction averageMarks(marks) {\n  if (!Array.isArray(marks) || marks.length === 0) {\n    throw new Error(\"at least one mark is required\");\n  }\n  if (marks.some((mark) => !Number.isFinite(mark) || mark < 0 || mark > 100)) {\n    throw new Error(\"each mark must be between 0 and 100\");\n  }\n  return marks.reduce((total, mark) => total + mark, 0) / marks.length;\n}\n\nconsole.log(averageMarks([78, 84, 91, 67]).toFixed(2));\n```",
      "```sql\nSELECT student_id,\n       AVG(mark) AS average_mark,\n       COUNT(*) AS subject_count\nFROM student_marks\nWHERE mark BETWEEN 0 AND 100\nGROUP BY student_id;\n```",
      "For `n` marks, validation and accumulation each scan the input once, so the time complexity is **O(n)**. The streaming versions use **O(1)** extra space; the list itself requires **O(n)** storage."
    );
  }
  if (/\b(programming|c\s*language|pointer|array|function|for\s*loop|while)\b/.test(q)) {
    return markdown("## Programming fundamentals", "Use variables for named data, functions for reusable logic, arrays for indexed collections, and loops for repetition. A `for` loop is useful when the iteration pattern is known; a `while` loop is useful when repetition depends on a condition.", "```c\n#include <stdio.h>\n\nint main(void) {\n    for (int i = 0; i < 5; i++) {\n        printf(\"%d\\n\", i);\n    }\n    return 0;\n}\n```", "Compile with warnings enabled, test boundary cases, and explain the time and space complexity of non-trivial programs.");
  }
  if (/\b(data\s*structure|stack|queue|linked\s*list|hash|sorting|searching)\b/.test(q)) {
    return markdown("## Data structures at a glance", "Choose a data structure according to the operations that must be fast and the way the data changes.", "| Structure | Rule | Typical operation |\n|---|---|---|\n| Array | Contiguous indexed values | O(1) access |\n| Stack | LIFO | O(1) push/pop |\n| Queue | FIFO | O(1) enqueue/dequeue |\n| Hash table | Key-based lookup | O(1) average search |\n| Linked list | Node links | Flexible insertion |", "```mermaid\nflowchart TD\n  Need[Required operation] --> Access[Fast indexed access?]\n  Access -->|Yes| Array[Array]\n  Access -->|No| Order[Need FIFO or LIFO?]\n  Order -->|FIFO| Queue[Queue]\n  Order -->|LIFO| Stack[Stack]\n```", "Binary search is O(log n) on sorted data; linear search is O(n). State assumptions when comparing algorithms.");
  }
  if (isCurriculumDatabaseQuery(query)) {
    return markdown(
      "## Revision-aware curriculum SQL design",
      "Keep revision, department, subject, and resource records separate. Do not make a course code globally unique because the same code may appear in different departments or revisions.",
      "```sql\nCREATE TABLE subjects (\n  id BIGINT PRIMARY KEY,\n  revision_code VARCHAR(16) NOT NULL,\n  department_code VARCHAR(32) NOT NULL,\n  course_code VARCHAR(32) NOT NULL,\n  semester SMALLINT NOT NULL,\n  name TEXT NOT NULL,\n  UNIQUE (revision_code, department_code, course_code, semester)\n);\n\nCREATE TABLE subject_resources (\n  subject_id BIGINT NOT NULL,\n  resource_type VARCHAR(24) NOT NULL,\n  url TEXT NULL,\n  status VARCHAR(16) NOT NULL,\n  PRIMARY KEY (subject_id, resource_type)\n);\n```",
      "```sql\nSELECT revision_code, department_code, semester, COUNT(*) AS subject_count\nFROM subjects\nWHERE revision_code IN ('REV2026', 'REV2021', 'REV2015')\nGROUP BY revision_code, department_code, semester\nORDER BY revision_code, department_code, semester;\n```",
      "| Resource status | URL | UI behavior |\n|---|---|---|\n| published | Required | Show the link/download action |\n| missing | NULL | Show “Lesson unavailable” |\n| unavailable | NULL or archived URL | Show an honest status, never a broken link |",
      "```mermaid\nflowchart LR\n  Subject --> Resource{Resource status}\n  Resource -->|published| Link[Render safe link]\n  Resource -->|missing| Notice[Show unavailable notice]\n  Resource -->|unavailable| Notice\n```"
    );
  }
  if (/\bbuck\s+converter\b/.test(q)) {
    return localAnswerForUnknownQuery(query);
  }
  if (/\b(exam|prepare|preparation|revision|study\s*plan|how\s*to\s*study|tips)\b/.test(q)) {
    return markdown("## Exam preparation plan", "Start with the syllabus, divide it into weekly topics, and make short notes while studying. Practise diagrams, derivations, numericals, and previous question papers.", "| Stage | Focus |\n|---|---|\n| Early preparation | Understand concepts and mark high-weight topics |\n| Middle phase | Solve problems and previous papers |\n| Final week | Revise formulas and take timed mocks |", "> Avoid starting large new topics immediately before the exam; revise the material you can recall accurately.");
  }
  if (/\b(formula|formulae|equation|derive|derivation)\b/.test(q)) {
    return markdown("## Useful engineering formulas", "| Topic | Formula |\n|---|---|\n| Newton’s second law | F = ma |\n| Ohm’s law | V = IR |\n| Electrical power | P = VI |\n| Stress | σ = F/A |\n| Young’s modulus | E = σ/ε |", "Tell me the subject and exact formula if you want a step-by-step derivation or worked numerical.");
  }
  if (/^\s*(why|what|how|when|where|who)\s*[?!.,…]*$/i.test(query)) {
    return "I’m ready to explain it, but I need the topic after that question word. For example, ask **“Why does a diode conduct in forward bias?”**, **“How does an amplifier work?”**, or **“What is KVL?”**";
  }
  return localAnswerForUnknownQuery(query);
}
