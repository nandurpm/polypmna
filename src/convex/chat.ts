import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getHistory = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit)
      .then((msgs) => msgs.reverse());
  },
});

function generateResponse(query: string): string {
  const q = query.toLowerCase();

  // Greetings
  if (/\b(hello|hi|hey|namaste|good\s*(morning|afternoon|evening))\b/.test(q)) {
    return "Hello! I'm POLY AI, your personal study assistant for Kerala Polytechnic students. I can help you with:\n\n- Subject concepts and explanations\n- Formula derivations\n- Exam preparation tips\n- Engineering fundamentals\n- Revision 2026 & 2021 syllabus topics\n\nWhat would you like to learn about today?";
  }

  // Thank you
  if (/\b(thank|thanks|thankyou)\b/.test(q)) {
    return "You're welcome! Remember to:\n- Revise regularly using the study notes on this platform\n- Practice with mock exams\n- Download previous year question papers\n\nAll the best for your exams! 📚";
  }

  // Ohm's Law
  if (/\b(ohm'?s?\s*law|ohms?\s*law)\b/.test(q)) {
    return "⚡ Ohm's Law states that the current flowing through a conductor is directly proportional to the voltage across it, provided temperature remains constant.\n\n**Formula:** V = IR\n- V = Voltage (Volts)\n- I = Current (Amperes)\n- R = Resistance (Ohms)\n\n**Key Points:**\n- R = V/I\n- I = V/R\n- P = VI = I²R = V²/R\n\n**Applications:**\n- Circuit analysis\n- Power calculations\n- Resistance measurement\n\nThis is a fundamental concept covered in Basic Electrical Engineering (Course 1031/2031).";
  }

  // Binary tree
  if (/\b(binary\s*tree|bst|binary\s*search\s*tree)\b/.test(q)) {
    return "🌳 **Binary Tree Properties:**\n\n1. **Each node has at most 2 children** (left and right)\n2. **Height** = longest path from root to leaf\n3. **Complete Binary Tree** — all levels filled except possibly last\n4. **Full Binary Tree** — every node has 0 or 2 children\n5. **Balanced BST** — left and right subtree heights differ by at most 1\n\n**Traversals:**\n- **Inorder (Left, Root, Right)** — gives sorted order in BST\n- **Preorder (Root, Left, Right)** — used for tree copy\n- **Postorder (Left, Right, Root)** — used for deletion\n\n**Time Complexity:**\n- Search/Insert/Delete: O(log n) average, O(n) worst\n- BST property: left < root < right\n\nThis is covered in Data Structures (Computer Engineering, Semester 4).";
  }

  // SQL vs NoSQL
  if (/\b(sql\s*vs?\s*nosql|nosql\s*vs?\s*sql|difference.*sql.*nosql)\b/.test(q)) {
    return "📊 **SQL vs NoSQL Databases:**\n\n| Feature | SQL | NoSQL |\n|---------|-----|-------|\n| Structure | Tables with rows/columns | Documents, key-value, graph |\n| Schema | Fixed schema | Dynamic schema |\n| Scaling | Vertical (bigger server) | Horizontal (more servers) |\n| Transactions | ACID compliant | Eventual consistency |\n| Examples | MySQL, PostgreSQL | MongoDB, Redis |\n\n**When to use SQL:**\n- Complex queries with JOINs\n- Data integrity is critical\n- Structured, predictable data\n\n**When to use NoSQL:**\n- Rapid development\n- Large-scale distributed systems\n- Flexible data models\n\nThis is covered in Database Management Systems (Computer Engineering, Semester 3).";
  }

  // Transistor
  if (/\b(transistor|bjt|mosfet)\b/.test(q)) {
    return "🔌 **Transistor — Working Principle:**\n\nA transistor is a semiconductor device used for amplification and switching.\n\n**Types:**\n1. **BJT (Bipolar Junction Transistor)**\n   - NPN and PNP types\n   - Three terminals: Emitter, Base, Collector\n   - Current-controlled device\n\n2. **MOSFET (Metal-Oxide-Semiconductor FET)**\n   - Enhancement and Depletion types\n   - Three terminals: Source, Gate, Drain\n   - Voltage-controlled device\n\n**Working (NPN BJT):**\n- Small current into Base → Large current flows from Collector to Emitter\n- Acts as switch: Cutoff (OFF) and Saturation (ON)\n- Amplification: IC = β × IB (β = current gain)\n\n**Applications:**\n- Amplifiers, switches, digital logic gates, microprocessors\n\nThis is covered in Basic Electrical & Electronics Engineering.";
  }

  // Bending moment
  if (/\b(bending\s*moment|shear\s*force|bmd|sfd)\b/.test(q)) {
    return "📐 **Bending Moment Diagram (BMD):**\n\n**Shear Force (SF):** Algebraic sum of all vertical forces on one side of a section.\n\n**Bending Moment (BM):** Algebraic sum of moments of all forces on one side of a section.\n\n**Sign Convention:**\n- Sagging BM → Positive (+)\n- Hogging BM → Negative (-)\n\n**Key Relations:**\n- dM/dx = V (slope of BM = Shear Force)\n- dV/dx = -w (slope of SF = -load intensity)\n\n**For Simply Supported Beam:**\n- Point load W at center: M_max = WL/4\n- UDL w over length L: M_max = wL²/8\n\n**For Cantilever:**\n- Point load W at free end: M_max = WL\n- UDL w over length L: M_max = wL²/2\n\nThis is covered in Strength of Materials (Mechanical, Semester 3) and Theory of Structures (Civil, Semester 3).";
  }

  // 4-stroke engine
  if (/\b(4\s*-?\s*stroke|four\s*stroke|ic\s*engine|internal\s*combustion)\b/.test(q)) {
    return "🔧 **4-Stroke Engine Working:**\n\nThe four strokes of a petrol (SI) engine cycle:\n\n**1. Suction Stroke** 🟢\n- Piston moves down (TDC → BDC)\n- Inlet valve opens, exhaust valve closes\n- Air-fuel mixture drawn into cylinder\n\n**2. Compression Stroke** 🔴\n- Piston moves up (BDC → TDC)\n- Both valves closed\n- Mixture compressed (compression ratio 6:1 to 10:1)\n\n**3. Power (Expansion) Stroke** ⚡\n- Spark plug fires at TDC\n- High-pressure gases push piston down\n- Only stroke that produces power\n\n**4. Exhaust Stroke** 🟠\n- Piston moves up (BDC → TDC)\n- Exhaust valve opens\n- Burnt gases expelled\n\n**Key Formulae:**\n- Power = (PLAN × n) / (2 × 60) kW\n- where P=MEP, L=stroke, A=bore area, N=RPM, n=cylinders\n\nThis is covered in Automobile Engineering and Basic Mechanical Engineering.";
  }

  // Programming / C
  if (/\b(programming|c\s*language|c\s*program|pointer|array|function|loop|for\s*loop|while)\b/.test(q)) {
    return "💻 **C Programming Fundamentals:**\n\n**Data Types:** int, float, char, double, void\n\n**Control Structures:**\n```c\n// For loop\nfor (int i = 0; i < n; i++) { ... }\n\n// While loop\nwhile (condition) { ... }\n\n// If-else\nif (condition) { ... } else { ... }\n\n// Switch\nswitch(value) { case 1: ... break; }\n```\n\n**Arrays:**\n```c\nint arr[5] = {1, 2, 3, 4, 5};\narr[0] = 10; // First element\n```\n\n**Pointers:**\n```c\nint x = 5;\nint *p = &x; // p points to x\nprintf(\"%d\", *p); // Prints 5\n```\n\n**Functions:**\n```c\nint add(int a, int b) { return a + b; }\n```\n\nThis is covered in Programming in C (CSE, Semester 3) and Problem Solving & Python Programming (1131).";
  }

  // Data structures
  if (/\b(data\s*structure|stack|queue|linked\s*list|hash|sorting|searching)\b/.test(q)) {
    return "📊 **Essential Data Structures:**\n\n**1. Array** — Contiguous memory, O(1) access\n**2. Linked List** — Dynamic, O(n) search\n**3. Stack** — LIFO, push/pop/peek\n**4. Queue** — FIFO, enqueue/dequeue\n**5. Hash Table** — O(1) average lookup\n\n**Sorting Algorithms:**\n| Algorithm | Best | Average | Worst | Space |\n|-----------|------|---------|-------|-------|\n| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |\n| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |\n| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |\n| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |\n\n**Searching:**\n- Linear Search: O(n)\n- Binary Search: O(log n) — requires sorted array\n\nThis is covered in Data Structures (CSE, Semester 4).";
  }

  // Exam preparation
  if (/\b(exam|prepare|preparation|revision|study\s*plan|how\s*to\s*study|tips)\b/.test(q)) {
    return "📝 **Exam Preparation Strategy:**\n\n**1. Plan (2-3 months before):**\n- Get the complete syllabus and mark weightage\n- Identify high-weightage topics\n- Create a daily study schedule\n\n**2. Study Method:**\n- Read textbook → Make short notes → Revise weekly\n- Focus on diagrams, derivations, and numericals\n- Practice previous year papers\n\n**3. Last Month:**\n- Revise from short notes only\n- Take mock tests daily\n- Focus on weak areas\n\n**4. Last Week:**\n- Quick revision of formula sheets\n- No new topics\n- Sleep well and stay calm\n\n**5. Exam Day:**\n- Read all questions first\n- Start with what you know best\n- Manage time: don't spend too long on one question\n\n**Resources on this platform:**\n- Study Notes (PDF download)\n- Mock Exams\n- Previous Year Question Papers\n- Ask POLY AI for doubts";
  }

  // Formula requests
  if (/\b(formula|formulae|equation|derive|derivation)\b/.test(q)) {
    return "📐 **Important Formula Collections:**\n\n**Engineering Mechanics:**\n- Force: F = ma\n- Moment: M = F × d\n- Friction: F = μN\n- Work: W = F × d × cos θ\n\n**Strength of Materials:**\n- Stress: σ = F/A\n- Strain: ε = ΔL/L\n- Young's Modulus: E = σ/ε\n- Bending Stress: σ = My/I\n\n**Electrical:**\n- Ohm's Law: V = IR\n- Power: P = VI = I²R\n- Energy: E = Pt\n\n**Thermodynamics:**\n- First Law: Q = ΔU + W\n- Efficiency: η = W/Q₁\n- Carnot: η = 1 - T₂/T₁\n\n**Fluid Mechanics:**\n- Bernoulli: P/ρg + v²/2g + z = const\n- Reynolds Number: Re = ρvD/μ\n\nFor subject-specific formulas, tell me which subject you're studying!";
  }

  // Default / General
  if (/\b(what|how|why|when|where|who|explain|tell|describe)\b/.test(q)) {
    return "That's a great question! Let me help you understand this topic.\n\nI can provide explanations for most polytechnic engineering subjects. Could you be more specific about which subject or topic you're asking about? For example:\n\n- **Engineering subjects:** Mechanical, Civil, Electrical, Computer, Electronics, Automobile\n- **Specific topics:** Formulas, concepts, diagrams, numericals\n- **Exam help:** Preparation tips, paper patterns\n\nI can also:\n- Explain concepts in simple language\n- Provide formula collections\n- Suggest study strategies\n- Help with numerical problem-solving\n\nWhat specific topic would you like me to explain?";
  }

  return "I'm here to help you with Kerala Polytechnic studies! I can explain concepts from any of the 6 departments (CSE, CE, ME, ECE, EEE, AE) across all semesters.\n\nTry asking me about:\n- Specific subjects or topics\n- Formulas and derivations\n- Exam preparation strategies\n- Programming concepts\n- Engineering fundamentals\n\nWhat would you like to learn?";
}

export const sendMessage = mutation({
  args: { userId: v.id("users"), content: v.string() },
  handler: async (ctx, args) => {
    // Store user message
    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      role: "user",
      content: args.content,
      timestamp: Date.now(),
    });

    const response = generateResponse(args.content);

    // Store assistant response
    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    });

    return response;
  },
});

export const clearHistory = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});
