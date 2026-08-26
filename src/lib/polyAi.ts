/**
 * Public fallback for static hosting. Convex remains the preferred persistence
 * path, but a visitor should never lose a response because anonymous auth is
 * still starting or temporarily unavailable.
 */
export function isCurriculumDatabaseQuery(query: string): boolean {
  const q = query.toLowerCase();
  return /\b(curriculum|catalog(u)?e?|database|schema|index|aggregation|aggregate|department|semester|duplicate|model\s*paper|lesson|resource\s*link)\b/.test(q)
    && /\b(sql|query|database|schema|count|subject|revision|department|semester|resource|link|model\s*paper|lesson)\b/.test(q);
}

export function isLeakedPolyAiResponse(response: string): boolean {
  return /thinking\s+process|analyze\s+user\s+input|determine\s+response\s+style|let\s+(?:me\s+)?draft/i.test(response);
}

export function isGenericPolyAiResponse(response: string): boolean {
  return /exam preparation strategy|that's a great question|i can help (?:with|explain) kerala polytechnic|what specific topic would you like me to explain|please include the subject name or topic/i.test(response);
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
  if (heading?.index !== undefined) {
    cleaned = cleaned.slice(heading.index + heading[0].length).trim();
  } else if (reasoningMarker) {
    return "";
  }
  return cleaned;
}

export function generatePolyAiResponse(query: string): string {
  const q = query.toLowerCase();

  if (/\b(hello|hi|hey|namaste|good\s*(morning|afternoon|evening))\b/.test(q)) {
    return "Hello! I'm POLY AI, your study assistant for Kerala Polytechnic. Ask me about subject concepts, formulas, engineering fundamentals, or exam preparation, and I will explain them in simple language.";
  }
  if (/\b(thank|thanks|thankyou)\b/.test(q)) {
    return "You're welcome! Keep revising with the study notes, practise previous question papers, and use the curriculum directory to find your subject resources. All the best for your exams!";
  }
  if (/\b(ohm'?s?\s*law|ohms?\s*law)\b/.test(q)) {
    return "Ohm's Law states that current is directly proportional to voltage when temperature is constant. The relationship is **V = IR**, where V is voltage, I is current, and R is resistance. Therefore, I = V/R and R = V/I. Electrical power can also be written as P = VI = I²R = V²/R.";
  }
  if (/\b(binary\s*tree|bst|binary\s*search\s*tree)\b/.test(q)) {
    return "A binary tree has at most two children per node: left and right. Its height is the longest root-to-leaf path. A full tree has zero or two children at every node, while a complete tree fills every level except possibly the last. In a binary search tree, values smaller than a node go left and larger values go right; average search, insertion, and deletion are O(log n), with O(n) worst case.";
  }
  if (/\b(sql\s*vs?\s*nosql|nosql\s*vs?\s*sql|difference.*sql.*nosql|sql.*nosql.*difference)\b/.test(q)) {
    return "SQL databases store structured data in tables and normally use a fixed schema, joins, and strong ACID transactions. NoSQL databases use flexible models such as documents, key-value pairs, or graphs and are often easier to scale horizontally. Choose SQL for structured data and complex relational queries; choose NoSQL when the data model changes rapidly or the system needs distributed scale.";
  }
  if (/\b(transistor|bjt|mosfet)\b/.test(q)) {
    return "A transistor is a semiconductor device used as a switch or amplifier. In an NPN BJT, a small base current controls a larger collector-to-emitter current. A MOSFET is voltage-controlled: the gate voltage controls current between source and drain. Cutoff and saturation are useful switching states, while the active region is used for amplification.";
  }
  if (/\b(diode|pn\s*junction|zener|rectifier|led)\b/.test(q)) {
    return "A diode is a two-terminal semiconductor device that normally conducts current from its anode to its cathode in forward bias and blocks current in reverse bias. A silicon diode has an approximate forward drop of 0.7 V. In a PN junction, forward bias reduces the depletion region while reverse bias widens it. Rectifier diodes convert AC to pulsating DC, Zener diodes regulate voltage in reverse breakdown, and LEDs emit light when forward biased. Check polarity before connecting a diode in a circuit.";
  }
  if (/\b(amplifier|op\s*-?amp|operational\s+amplifier|gain|oscillator)\b/.test(q)) {
    return "An amplifier uses a small input signal to control a larger output signal. Its voltage gain is Aᵥ = Vout/Vin, usually expressed in decibels as 20 log₁₀|Aᵥ|. An op-amp has very high open-loop gain, high input impedance, and low output impedance; with negative feedback, the closed-loop gain is set mainly by the feedback network. Always check bandwidth, saturation, phase shift, and distortion when analysing an amplifier.";
  }
  if (/\b(capacitor|inductor|resistor|kcl|kvl|kirchhoff|rc\s*circuit|rl\s*circuit)\b/.test(q)) {
    return "For basic circuit analysis, a resistor obeys V = IR, a capacitor obeys i = C dv/dt, and an inductor obeys v = L di/dt. Kirchhoff's Current Law states that algebraic current at a node sums to zero; Kirchhoff's Voltage Law states that algebraic voltage around a closed loop sums to zero. In an RC circuit, the time constant is τ = RC; in an RL circuit, τ = L/R.";
  }
  if (/\b(bending\s*moment|shear\s*force|bmd|sfd)\b/.test(q)) {
    return "A bending-moment diagram plots the internal bending moment along a beam. The slope of the bending-moment diagram equals the shear force, dM/dx = V, and the change in shear is related to load intensity. Sagging moment is conventionally positive and hogging moment negative. For a simply supported beam with a central point load W, the maximum moment is WL/4.";
  }
  if (/\b(4\s*-?\s*stroke|four\s*stroke|internal\s*combustion|ic\s*engine)\b/.test(q)) {
    return "A four-stroke engine completes one cycle in four piston strokes: intake draws in the charge, compression raises its pressure, power follows ignition and expansion, and exhaust expels the burnt gases. The piston travels from top dead centre to bottom dead centre and back during each stroke, so the cycle requires two crankshaft revolutions.";
  }
  if (/\b(programming|c\s*language|pointer|array|function|for\s*loop|while)\b/.test(q)) {
    return "In C programming, variables have declared data types such as int, float, char, and double. Arrays store same-type values in contiguous indexed memory, functions organise reusable logic, and pointers store addresses. A for loop is useful when the iteration count is known; a while loop repeats while its condition remains true.";
  }
  if (/\b(data\s*structure|stack|queue|linked\s*list|hash|sorting|searching)\b/.test(q)) {
    return "Common data structures include arrays for fast indexed access, linked lists for flexible insertion, stacks with LIFO order, queues with FIFO order, and hash tables for average O(1) lookup. Binary search runs in O(log n) on sorted data, while linear search runs in O(n).";
  }
  if (/\b(curriculum|catalog(u)?e?|database|schema|index|aggregation|aggregate|department|semester|duplicate|model\s*paper|lesson|resource\s*link)\b/.test(q) && /\b(sql|query|database|schema|count|subject|revision|department|semester|resource|link|model\s*paper|lesson)\b/.test(q)) {
    return "A revision-aware curriculum database should separate revisions, departments, subjects, and resources. Use revisions(id, code), departments(id, revision_id, code, name), subjects(id, department_id, course_code, name, semester, subject_type), and subject_resources(subject_id, resource_type, url, status). Add indexes on subjects(department_id, semester), subjects(course_code), and subject_resources(subject_id, resource_type, status). Aggregate with SELECT r.code, d.name, s.semester, COUNT(*) FROM revisions r JOIN departments d ON d.revision_id = r.id JOIN subjects s ON s.department_id = d.id WHERE r.code IN ('REV2026','REV2021','REV2015') GROUP BY r.code, d.name, s.semester. Do not make course_code globally unique: the same code can occur in multiple departments or revisions, so use a composite identity including revision, department, code, and semester. Store nullable URLs with published, missing, or unavailable status, and render resource actions only for published records.";
  }
  if (/\b(exam|prepare|preparation|revision|study\s*plan|how\s*to\s*study|tips)\b/.test(q)) {
    return "For exam preparation, start with the syllabus, divide it into weekly topics, and make short notes while studying. Practise diagrams, derivations, numericals, and previous question papers. Reserve the final week for formula revision and timed mock tests, and avoid starting large new topics immediately before the exam.";
  }
  if (/\b(formula|formulae|equation|derive|derivation)\b/.test(q)) {
    return "Useful fundamentals include F = ma, moment M = F × d, stress σ = F/A, strain ε = ΔL/L, Young's modulus E = σ/ε, Ohm's Law V = IR, electrical power P = VI, and the first-law relation Q = ΔU + W. Tell me the subject or exact formula you need and I can explain its derivation.";
  }
  if (/^\s*(why|what|how|when|where|who)\s*[?!.,…]*\s*$/i.test(query)) {
    return "I’m ready to explain it, but I need the topic after that question word. For example, ask ‘Why does a diode conduct in forward bias?’, ‘How does an amplifier work?’, or ‘What is KVL?’";
  }
  if (/\b(what|how|why|when|where|who|explain|tell|describe)\b/.test(q)) {
    return `I received your question: “${query.trim()}”\n\nI can explain Kerala Polytechnic subjects, formulas, diagrams, programming, and engineering fundamentals. Add the exact topic or subject—for example, diode, amplifier, KVL, data structures, bending moments, database systems, or four-stroke engines—and I’ll give a focused explanation.`;
  }
  return `I received “${query.trim()}”. I can help with Kerala Polytechnic concepts, formulas, subject resources, and exam preparation. Add the subject or topic, such as Ohm's Law, diode, amplifier, data structures, database systems, or four-stroke engines.`;
}
