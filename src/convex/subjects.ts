import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByDepartment = query({
  args: { departmentId: v.id("departments"), semester: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.semester !== undefined) {
      return await ctx.db
        .query("subjects")
        .withIndex("by_department", (q) =>
          q.eq("departmentId", args.departmentId).eq("semester", args.semester!)
        )
        .collect();
    }
    return await ctx.db
      .query("subjects")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subjects").collect();
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.toLowerCase();
    const all = await ctx.db.query("subjects").collect();
    return all.filter((s) => s.name.toLowerCase().includes(q));
  },
});

export const get = query({
  args: { id: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Seed subjects
export const seedSubjects = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("subjects").first();
    if (existing) return "already_seeded";

    const depts = await ctx.db.query("departments").collect();
    const deptMap = new Map(depts.map((d) => [d.abbr, d._id]));

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

    let count = 0;
    for (const [abbr, semesters] of Object.entries(subjectsByDept)) {
      const deptId = deptMap.get(abbr);
      if (!deptId) continue;
      for (const [semStr, subjects] of Object.entries(semesters)) {
        const semester = parseInt(semStr);
        for (const name of subjects) {
          await ctx.db.insert("subjects", { name, departmentId: deptId, semester });
          count++;
        }
      }
    }
    return `seeded_${count}_subjects`;
  },
});
