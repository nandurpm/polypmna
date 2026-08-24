import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingDept = await ctx.db.query("departments").first();
    if (existingDept) return "already_seeded";

    // Seed departments
    const departments = [
      { name: "Computer Engineering", abbr: "CSE", icon: "layers", color: "from-blue-500 to-indigo-600", sortOrder: 1 },
      { name: "Civil Engineering", abbr: "CE", icon: "building2", color: "from-emerald-500 to-teal-600", sortOrder: 2 },
      { name: "Mechanical Engineering", abbr: "ME", icon: "compass", color: "from-orange-500 to-red-500", sortOrder: 3 },
      { name: "Electronics Engineering", abbr: "ECE", icon: "sparkles", color: "from-violet-500 to-purple-600", sortOrder: 4 },
      { name: "Electrical & Electronics", abbr: "EEE", icon: "barChart3", color: "from-amber-500 to-yellow-500", sortOrder: 5 },
      { name: "Automobile Engineering", abbr: "AE", icon: "graduationCap", color: "from-rose-500 to-pink-600", sortOrder: 6 },
    ];

    const deptIds = new Map<string, Id<"departments">>();
    for (const dept of departments) {
      const id = await ctx.db.insert("departments", dept);
      deptIds.set(dept.abbr, id);
    }

    // Seed subjects
    const subjectsByDept: Record<string, Record<number, string[]>> = {
      CSE: {
        2: ["Problem Solving & Programming", "Fundamentals of Electrical & Electronics Engg"],
        3: ["Computer Organisation", "Programming in C", "Database Management Systems", "Digital Computer Fundamentals", "Web Technology Lab"],
        4: ["Object Oriented Programming", "Computer Communication and Networks", "Data Structures"],
        5: ["Project Management & Software Engineering", "Embedded System & Real-time OS", "Operating System", "Virtualization & Cloud Computing"],
        6: ["Introduction to IoT", "Machine Learning", "Cyber Security", "Web Application Development", "Mobile App Development"],
      },
      CE: {
        2: ["Engineering Mechanics", "Basic Survey"],
        3: ["Advanced Surveying", "Concrete Technology", "Building Construction & Materials", "Theory of Structures"],
        4: ["Geotechnical Engineering", "Hydraulics & Irrigation Engineering", "Estimating & Costing"],
        5: ["Transportation Engineering", "Design of Steel & RCC Structures", "Construction Management & Safety", "Habitat Technology"],
        6: ["Public Health Engineering", "Environmental Engineering", "Quantity Surveying", "Construction Planning", "Remote Sensing & GIS"],
      },
      ME: {
        2: ["Manufacturing Technology", "Engineering Mechanics"],
        3: ["Strength of Materials", "Material Science & Metrology", "Machine Tools", "Fundamentals of Electrical Engineering"],
        4: ["Thermal Engineering", "Fluid Mechanics & Hydraulic Machines", "Automobile Engineering", "Industrial Engineering"],
        5: ["Industrial Management & Safety", "Design of Machine Elements", "Refrigeration & Air Conditioning", "Modern Production Processes"],
        6: ["Mechatronics", "CNC Programming", "Composite Materials", "Energy Conservation", "Total Quality Management"],
      },
      ECE: {
        2: ["Engineering Mechanics", "Fundamentals of Electrical Engg"],
        3: ["Electric Circuits & Networks", "Principles of Electronic Communication", "Electronic Circuits", "Digital Electronics", "Fundamentals of C Programming"],
        4: ["Microcontroller & Applications", "Electronic Measurements & Instrumentation", "Linear Integrated Circuits"],
        5: ["Industrial Management & Safety", "Embedded Systems", "Industrial Automation", "Digital Communication"],
        6: ["Verilog HDL & PLC", "VLSI Design", "Robotics & Automation", "IoT & Edge Computing", "Advanced Communication Systems"],
      },
      EEE: {
        2: ["Elementary Concepts of Electrical System"],
        3: ["Analog & Digital Circuits", "DC Machines & Traction Motors", "Fundamentals of Electric Circuits", "Electrical & Electronics Measuring Instruments"],
        4: ["Power Electronics Devices & Circuits", "Electrical Installation Design & Estimation", "Induction Machines"],
        5: ["Industrial Management & Safety", "Synchronous Machines & FHP Motors", "Electricity Generation, Transmission & Distribution", "Switchgear & Protection"],
        6: ["Microcontroller & PLC", "Renewable Energy Systems", "Electric Drives", "Power System Analysis", "Smart Grid Technology"],
      },
      AE: {
        2: ["Engineering Mechanics"],
        3: ["Fundamentals of Fluid Mechanics", "Manufacturing Technology for Automobile Components", "Automobile Electrical & Electronics Systems", "Internal Combustion Engines"],
        4: ["Heat Power Engineering", "Material Science & Strength of Materials", "Automobile Chassis & Transmission"],
        5: ["Industrial Management & Safety", "Design of Automotive Components", "Vehicle Diagnostics & Service", "Two & Three Wheeler Technology"],
        6: ["Electric & Hybrid Vehicles", "Automobile Fault Diagnosis", "Emission Control & Testing", "Two Wheeler Technology", "Advanced Engine Technology"],
      },
    };

    const subjectIds: Id<"subjects">[] = [];
    for (const [abbr, semesters] of Object.entries(subjectsByDept)) {
      const deptId = deptIds.get(abbr);
      if (!deptId) continue;
      for (const [semStr, subjects] of Object.entries(semesters)) {
        const semester = parseInt(semStr);
        for (const name of subjects) {
          const id = await ctx.db.insert("subjects", { name, departmentId: deptId, semester });
          subjectIds.push(id);
        }
      }
    }

    // Seed materials (2 per subject)
    const materialTypes = ["notes", "syllabus"] as const;
    for (const subId of subjectIds) {
      for (const type of materialTypes) {
        const subject = await ctx.db.get(subId);
        if (!subject) continue;
        const suffix = type === "notes" ? "— Complete Study Notes" : "Syllabus — Revision 2026";
        await ctx.db.insert("materials", {
          title: `${subject.name} ${suffix}`,
          subjectId: subId,
          type,
          description: `Study material for ${subject.name}`,
          pageCount: Math.floor(Math.random() * 40) + 15,
          stars: 50 + Math.floor(Math.random() * 70),
          createdAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    // Seed question papers (for first 25 subjects)
    const years = [2023, 2024, 2025];
    const examTypes = ["mid", "end", "supply"] as const;
    for (const subId of subjectIds.slice(0, 25)) {
      const subject = await ctx.db.get(subId);
      if (!subject) continue;
      for (const year of years) {
        for (const examType of examTypes) {
          if (Math.random() > 0.4) {
            const label = examType === "mid" ? "Mid Semester" : examType === "end" ? "End Semester" : "Supplementary";
            await ctx.db.insert("questionPapers", {
              title: `${subject.name} — ${label} ${year}`,
              subjectId: subId,
              year,
              examType,
              createdAt: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
            });
          }
        }
      }
    }

    // Seed mock exams (1 per subject for first 15 subjects)
    const sampleQuestions = [
      { question: "Which data structure uses FIFO (First In, First Out) principle?", options: ["Stack", "Queue", "Tree", "Graph"], correctIndex: 1, explanation: "A Queue follows FIFO." },
      { question: "What is the time complexity of binary search?", options: ["O(n)", "O(n\u00b2)", "O(log n)", "O(1)"], correctIndex: 2, explanation: "Binary search halves the space each step." },
      { question: "What does DDL stand for in databases?", options: ["Data Definition Language", "Data Delivery Language", "Data Design Logic", "Database Design"], correctIndex: 0, explanation: "DDL defines database schemas." },
      { question: "Which gate outputs true only when both inputs are true?", options: ["OR", "AND", "NOT", "XOR"], correctIndex: 1, explanation: "AND gate: true only when both inputs are true." },
      { question: "What is the purpose of a compiler?", options: ["Run code directly", "Translate high-level code to machine code", "Manage memory", "Handle network requests"], correctIndex: 1, explanation: "A compiler translates source code to machine code." },
    ];

    for (const subId of subjectIds.slice(0, 15)) {
      const subject = await ctx.db.get(subId);
      if (!subject) continue;
      await ctx.db.insert("mockExams", {
        title: `Practice Test`,
        subjectId: subId,
        semester: subject.semester,
        questionCount: 5,
        durationMinutes: 15,
        questions: sampleQuestions,
      });
    }

    return "seeded_all";
  },
});
