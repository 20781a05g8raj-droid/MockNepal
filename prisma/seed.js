const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Nepal Government Exam Platform database with isolated course tracks...");

  // 1. Clean existing records
  await prisma.testAttemptAnswer.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.mockTestQuestion.deleteMany();
  await prisma.mockTest.deleteMany();
  await prisma.attemptAnswer.deleteMany();
  await prisma.practiceSession.deleteMany();
  await prisma.revisionItem.deleteMany();
  await prisma.dailyMission.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.contentReport.deleteMany();
  await prisma.note.deleteMany();
  await prisma.questionExam.deleteMany();
  await prisma.questionVersion.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.syllabusVersion.deleteMany();
  await prisma.entitlement.deleteMany();
  await prisma.order.deleteMany();
  await prisma.packagePlan.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.examCategory.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const studentPassword = await bcrypt.hash("Student@123", 10);
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const editorPassword = await bcrypt.hash("Editor@123", 10);

  const studentUser = await prisma.user.create({
    data: {
      email: "student@nepalexam.com",
      name: "Bikash Sharma",
      passwordHash: studentPassword,
      role: "STUDENT",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@nepalexam.com",
      name: "Lok Sewa Administrator",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "editor@nepalexam.com",
      name: "Content Editor Adhikari",
      passwordHash: editorPassword,
      role: "CONTENT_EDITOR",
    },
  });

  // 3. Seed Categories
  const catEngineering = await prisma.examCategory.create({
    data: {
      name: "Engineering & Professional Licensing",
      code: "ENGINEERING_LICENSE",
      order: 1,
    },
  });

  const catLokSewa = await prisma.examCategory.create({
    data: {
      name: "Lok Sewa Aayog (Public Service Commission)",
      code: "LOK_SEWA",
      order: 2,
    },
  });

  const catBanking = await prisma.examCategory.create({
    data: {
      name: "Banking & Financial Institutions",
      code: "BANKING",
      order: 3,
    },
  });

  const catTSC = await prisma.examCategory.create({
    data: {
      name: "Teacher Service Commission (शिक्षक सेवा आयोग - TSC)",
      code: "TEACHER_SERVICE",
      order: 4,
    },
  });

  const catComp = await prisma.examCategory.create({
    data: {
      name: "Computer Operator & IT Services",
      code: "COMPUTER_OPERATOR",
      order: 5,
    },
  });

  const catMedical = await prisma.examCategory.create({
    data: {
      name: "Medical & Health Licensing (CEE / NMCLE)",
      code: "MEDICAL",
      order: 6,
    },
  });

  // 4. Seed Exams
  // 4.1 Engineering License Exam
  const examNEC = await prisma.exam.create({
    data: {
      categoryId: catEngineering.id,
      title: "Nepal Engineering Council (NEC) License Exam (Civil Engineering)",
      code: "NEC_CIVIL_LICENSE",
      description: "Mandatory professional license examination conducted by Nepal Engineering Council for Civil Engineering graduates.",
      order: 1,
    },
  });

  // 4.2 Lok Sewa Kharidar
  const examKharidar = await prisma.exam.create({
    data: {
      categoryId: catLokSewa.id,
      title: "Lok Sewa Kharidar (Non-Gazetted Second Class - खरिदार)",
      code: "LOK_SEWA_KHARIDAR",
      description: "General knowledge, basic mathematics, reasoning, and office management for Lok Sewa Kharidar open competition.",
      order: 2,
    },
  });

  // 4.3 Lok Sewa Nayab Subba
  const examNayabSubba = await prisma.exam.create({
    data: {
      categoryId: catLokSewa.id,
      title: "Lok Sewa Nayab Subba (Non-Gazetted First Class - नायब सुब्बा)",
      code: "LOK_SEWA_NAYAB_SUBBA",
      description: "General knowledge, contemporary issues, public administration, and mental ability for Nayab Subba administration exams.",
      order: 3,
    },
  });

  // 4.4 Lok Sewa Section Officer
  const examOfficer = await prisma.exam.create({
    data: {
      categoryId: catLokSewa.id,
      title: "Section Officer (Sakha Adhikrit - Gazetted Third Class)",
      code: "LOK_SEWA_SECTION_OFFICER",
      description: "Comprehensive preparation for Lok Sewa Gazetted Third Class general administration, revenue, and foreign service paper 1.",
      order: 4,
    },
  });

  // 4.5 Banking NRB Assistant
  const examNRB = await prisma.exam.create({
    data: {
      categoryId: catBanking.id,
      title: "Nepal Rastra Bank Assistant (Level 4)",
      code: "NRB_ASSISTANT",
      description: "Banking laws, monetary economics, accounting, and general awareness for NRB Level 4 recruitment.",
      order: 5,
    },
  });

  // 4.6 Teacher Service Commission (TSC Primary)
  const examTSC = await prisma.exam.create({
    data: {
      categoryId: catTSC.id,
      title: "Shikshak Sewa Aayog (TSC Primary Level - शिक्षक सेवा प्रा.वि.)",
      code: "TSC_PRIMARY_LEVEL",
      description: "Comprehensive preparation for Teacher Service Commission Primary Level open competition covering pedagogy, ICT, and general knowledge.",
      order: 6,
    },
  });

  // 4.7 Lok Sewa Computer Operator
  const examComp = await prisma.exam.create({
    data: {
      categoryId: catComp.id,
      title: "Lok Sewa Computer Operator (कम्प्युटर अपरेटर)",
      code: "LOK_SEWA_COMPUTER_OPERATOR",
      description: "Computer fundamentals, operating systems, MS Office automation, database management, and networking for PSC recruitment.",
      order: 7,
    },
  });

  // 4.8 Medical Entrance (CEE)
  const examCEE = await prisma.exam.create({
    data: {
      categoryId: catMedical.id,
      title: "Common Entrance Examination (MEC CEE - MBBS / BDS / Nursing)",
      code: "MEC_CEE_ENTRANCE",
      description: "Medical Education Commission common entrance examination for MBBS, BDS, B.Sc Nursing, and Allied Health Sciences.",
      order: 8,
    },
  });

  // Student Profile: Default to Engineering License
  await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      targetExamId: examNEC.id,
      languagePreference: "BOTH",
      dailyStudyTargetMinutes: 60,
      streakCount: 5,
      lastActiveNepalDate: new Date().toISOString().split("T")[0],
      xpPoints: 480,
    },
  });

  // =========================================================================
  // COURSE 1: NEPAL ENGINEERING COUNCIL (NEC) CIVIL ENGINEERING LICENSE
  // =========================================================================
  const sylNEC = await prisma.syllabusVersion.create({
    data: {
      examId: examNEC.id,
      versionCode: "2081_NEC_OFFICIAL",
      officialSourceUrl: "https://nec.gov.np/license-curriculum",
      verifiedAt: new Date("2024-05-01"),
    },
  });

  const subjStruc = await prisma.subject.create({
    data: {
      syllabusVersionId: sylNEC.id,
      name: "Structural Analysis & Design",
      code: "CIVIL_STRUC",
      order: 1,
    },
  });

  const subjGeotech = await prisma.subject.create({
    data: {
      syllabusVersionId: sylNEC.id,
      name: "Geotechnical & Foundation Engineering",
      code: "CIVIL_GEOTECH",
      order: 2,
    },
  });

  const subjHighway = await prisma.subject.create({
    data: {
      syllabusVersionId: sylNEC.id,
      name: "Highway & Transportation Engineering",
      code: "CIVIL_HIGHWAY",
      order: 3,
    },
  });

  const subjWater = await prisma.subject.create({
    data: {
      syllabusVersionId: sylNEC.id,
      name: "Water Resources & Irrigation Engineering",
      code: "CIVIL_WATER",
      order: 4,
    },
  });

  const subjEthics = await prisma.subject.create({
    data: {
      syllabusVersionId: sylNEC.id,
      name: "Project Management, Estimation & NEC Ethics",
      code: "CIVIL_ETHICS",
      order: 5,
    },
  });

  // Topics for Engineering
  const topicBeams = await prisma.topic.create({
    data: {
      subjectId: subjStruc.id,
      name: "Bending Moment, Shear Force & Deflection in Beams",
      code: "STRUC_BEAMS",
      estimatedMinutes: 50,
      order: 1,
    },
  });

  const topicRCC = await prisma.topic.create({
    data: {
      subjectId: subjStruc.id,
      name: "Limit State Design of RCC Members (IS 456 / NBC 105)",
      code: "STRUC_RCC",
      estimatedMinutes: 60,
      order: 2,
    },
  });

  const topicSoil = await prisma.topic.create({
    data: {
      subjectId: subjGeotech.id,
      name: "Soil Classification, Compaction & Permeability",
      code: "GEOTECH_SOIL",
      estimatedMinutes: 45,
      order: 1,
    },
  });

  const topicBearing = await prisma.topic.create({
    data: {
      subjectId: subjGeotech.id,
      name: "Terzaghi Bearing Capacity & Shallow Foundations",
      code: "GEOTECH_BEARING",
      estimatedMinutes: 50,
      order: 2,
    },
  });

  const topicPavement = await prisma.topic.create({
    data: {
      subjectId: subjHighway.id,
      name: "Geometric Design & Flexible vs Rigid Pavements",
      code: "HIGHWAY_PAVEMENT",
      estimatedMinutes: 45,
      order: 1,
    },
  });

  const topicHydrology = await prisma.topic.create({
    data: {
      subjectId: subjWater.id,
      name: "Open Channel Flow, Chezy & Manning Equations",
      code: "WATER_FLOW",
      estimatedMinutes: 45,
      order: 1,
    },
  });

  const topicCodeEthics = await prisma.topic.create({
    data: {
      subjectId: subjEthics.id,
      name: "Nepal Engineering Council Act 2055 & Professional Code of Conduct",
      code: "ETHICS_ACT",
      estimatedMinutes: 40,
      order: 1,
    },
  });

  // Questions for Engineering
  const necQuestions = [
    {
      topicId: topicBeams.id,
      subjectId: subjStruc.id,
      difficulty: "INTERMEDIATE",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2081,
      source: "Strength of Materials Standard Texts",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "For a simply supported beam of span 'L' carrying a uniformly distributed load 'w' throughout its span, the maximum deflection at mid-span is given by:",
      optA: "wL^4 / 384EI",
      optB: "5wL^4 / 384EI",
      optC: "wL^3 / 48EI",
      optD: "wL^4 / 8EI",
      correct: "B",
      explanation: "Standard double integration or moment-area theorem shows that max deflection at mid-span for a uniformly loaded simply supported beam equals (5/384) * (wL^4 / EI).",
    },
    {
      topicId: topicRCC.id,
      subjectId: subjStruc.id,
      difficulty: "INTERMEDIATE",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2081,
      source: "IS 456:2000 / NBC 105",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "According to IS 456:2000 limit state design, what is the maximum compressive strain in concrete in axial compression?",
      optA: "0.0035",
      optB: "0.0015",
      optC: "0.002",
      optD: "0.004",
      correct: "C",
      explanation: "Clause 39.1 of IS 456 states that the maximum compressive strain in concrete in axial compression is taken as 0.002, whereas in bending it is 0.0035.",
    },
    {
      topicId: topicSoil.id,
      subjectId: subjGeotech.id,
      difficulty: "BASIC",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2080,
      source: "Geotechnical Engineering Standard Curriculum",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "If the liquid limit (LL) of a soil is 45% and plastic limit (PL) is 25%, what is the Plasticity Index (PI)?",
      optA: "70%",
      optB: "1.8",
      optC: "15%",
      optD: "20%",
      correct: "D",
      explanation: "Plasticity Index (PI) = Liquid Limit (LL) - Plastic Limit (PL) = 45% - 25% = 20%.",
    },
    {
      topicId: topicBearing.id,
      subjectId: subjGeotech.id,
      difficulty: "INTERMEDIATE",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2081,
      source: "Terzaghi Bearing Capacity Principles",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "According to Terzaghi's bearing capacity formula for a strip footing on purely cohesive soil (phi = 0), the bearing capacity factor Nc is approximately:",
      optA: "5.7",
      optB: "1.0",
      optC: "0.0",
      optD: "3.14",
      correct: "A",
      explanation: "For a strip footing on clay with phi = 0, Terzaghi's Nc value equals 5.7 (Prandtl Nc = 5.14).",
    },
    {
      topicId: topicPavement.id,
      subjectId: subjHighway.id,
      difficulty: "BASIC",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2080,
      source: "Nepal Road Standard 2070",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "According to Nepal Road Standards (NRS), what is the primary purpose of providing camber on a road surface?",
      optA: "To counteract centrifugal force on curves",
      optB: "To drain off surface rainwater quickly",
      optC: "To provide safe stopping sight distance",
      optD: "To increase vehicular speed",
      correct: "B",
      explanation: "Camber (cross-slope) is provided to drain off rainwater rapidly from the pavement surface to prevent water ingress and pavement deterioration.",
    },
    {
      topicId: topicHydrology.id,
      subjectId: subjWater.id,
      difficulty: "BASIC",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2081,
      source: "Hydraulics & Open Channel Flow",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "In Manning's formula V = (1/n) * R^(2/3) * S^(1/2), what does 'R' represent?",
      optA: "Hydraulic depth (Area / Top Width)",
      optB: "Roughness coefficient",
      optC: "Hydraulic radius (Area / Wetted Perimeter)",
      optD: "Bed slope ratio",
      correct: "C",
      explanation: "R is the hydraulic radius defined as the cross-sectional area of flow divided by the wetted perimeter (A / P).",
    },
    {
      topicId: topicCodeEthics.id,
      subjectId: subjEthics.id,
      difficulty: "BASIC",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2081,
      source: "Nepal Engineering Council Act 2055",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "Under the Nepal Engineering Council Act 2055, which of the following is strictly required to legally practice as a professional engineer in Nepal?",
      optA: "Only passing the university bachelor's degree",
      optB: "Membership in a political trade union",
      optC: "5 years of overseas consulting experience",
      optD: "Valid registration / license with Nepal Engineering Council",
      correct: "D",
      explanation: "Section 11 of the Nepal Engineering Council Act 2055 mandates that no person shall practice the engineering profession without being registered in the council.",
    },
  ];

  const createdNecQuestions = [];
  for (const q of necQuestions) {
    const question = await prisma.question.create({
      data: {
        subjectId: q.subjectId,
        topicId: q.topicId,
        difficulty: q.difficulty,
        language: q.language,
        questionType: q.questionType,
        examYear: q.examYear,
        source: q.source,
        accessLevel: q.accessLevel,
        status: q.status,
      },
    });

    await prisma.questionVersion.create({
      data: {
        questionId: question.id,
        versionNumber: 1,
        questionText: q.qText,
        optionA: q.optA,
        optionB: q.optB,
        optionC: q.optC,
        optionD: q.optD,
        correctOption: q.correct,
        explanation: q.explanation,
        authorId: adminUser.id,
      },
    });

    await prisma.questionExam.create({
      data: {
        questionId: question.id,
        examId: examNEC.id,
      },
    });

    createdNecQuestions.push(question);
  }

  // Notes for Engineering (Both PDF and Article!)
  // 1. PDF Note:
  await prisma.note.create({
    data: {
      topicId: topicCodeEthics.id,
      title: "NEC Civil Engineering Official License Examination Handbook (PDF)",
      noteType: "PDF",
      pdfUrl: "/uploads/notes/nec_civil_engineering_handbook.pdf",
      pdfFileName: "nec_civil_engineering_handbook.pdf",
      fileSizeBytes: 1845200,
      summary: "Official syllabus guidelines, NEC Act 2055, and professional code of ethics handbook published by the Nepal Engineering Council.",
      source: "Nepal Engineering Council (NEC) Gazette",
      verifiedAt: new Date("2024-05-10"),
      accessLevel: "FREE",
      status: "PUBLISHED",
      contentHtml: "",
    },
  });

  // 2. Article Note:
  await prisma.note.create({
    data: {
      topicId: topicRCC.id,
      title: "Limit State Design of RCC Beams & Slabs (IS 456 & NBC 105:2020)",
      noteType: "ARTICLE",
      summary: "Comprehensive analytical guide on design constants, neutral axis depth, balanced sections, and earthquake ductility requirements.",
      source: "NBC 105:2020 & IS 456:2000",
      verifiedAt: new Date("2024-05-12"),
      accessLevel: "FREE",
      status: "PUBLISHED",
      contentHtml: `
        <h2>1. Limit State Method Fundamentals</h2>
        <p>In the Limit State of Collapse (Flexure), the design is governed by two fundamental safety margins: Partial safety factor for materials (gamma_m) and partial safety factor for loads (gamma_f).</p>
        <ul>
          <li>Concrete factor of safety: 1.50 (accounting for in-situ curing variability)</li>
          <li>Steel factor of safety: 1.15</li>
          <li>Maximum compressive strain at extreme fibre in bending: <strong>0.0035</strong></li>
        </ul>

        <h2>2. Limiting Depth of Neutral Axis (xu,max)</h2>
        <p>For various grades of reinforcement:</p>
        <ul>
          <li>Fe 250 (Mild Steel): xu,max = <strong>0.53 d</strong></li>
          <li>Fe 415 (HYSD / TMT): xu,max = <strong>0.48 d</strong></li>
          <li>Fe 500 (TMT): xu,max = <strong>0.46 d</strong></li>
        </ul>

        <h2>3. Earthquake Ductility Detailing (NBC 105 & IS 13920)</h2>
        <p>In seismic zones of Nepal, beam longitudinal reinforcement must not exceed 2.5% gross area. Stirrups must have 135-degree hooks with 10d extension to prevent brittle shear failure.</p>
      `,
    },
  });

  // Mock Test for Engineering
  const mockTestNEC = await prisma.mockTest.create({
    data: {
      examId: examNEC.id,
      title: "NEC Civil Engineering License Model Examination 2081 - Paper 1",
      description: "Complete simulated model examination for Nepal Engineering Council license aspirants covering structures, geotech, highway, water resources, and ethics.",
      durationMinutes: 60,
      totalQuestions: createdNecQuestions.length,
      marksPerCorrect: 2.0,
      negativePenaltyPercent: 20.0,
      accessLevel: "FREE",
      status: "PUBLISHED",
      attemptLimit: 3,
    },
  });

  for (let i = 0; i < createdNecQuestions.length; i++) {
    await prisma.mockTestQuestion.create({
      data: {
        testId: mockTestNEC.id,
        questionId: createdNecQuestions[i].id,
        order: i + 1,
      },
    });
  }

  // =========================================================================
  // COURSE 2: LOK SEWA KHARIDAR (NON-GAZETTED SECOND CLASS)
  // =========================================================================
  const sylKharidar = await prisma.syllabusVersion.create({
    data: {
      examId: examKharidar.id,
      versionCode: "2081_KHARIDAR_REVISED",
      officialSourceUrl: "https://psc.gov.np/kharidar-syllabus",
      verifiedAt: new Date("2024-04-01"),
    },
  });

  const subjKharidarGK = await prisma.subject.create({
    data: {
      syllabusVersionId: sylKharidar.id,
      name: "General Knowledge & Current Affairs (सामान्य ज्ञान)",
      code: "KHARIDAR_GK",
      order: 1,
    },
  });

  const subjKharidarMath = await prisma.subject.create({
    data: {
      syllabusVersionId: sylKharidar.id,
      name: "Basic Mathematics & Mental Ability (आधारभूत गणित तथा बौद्धिक परीक्षण)",
      code: "KHARIDAR_MATH",
      order: 2,
    },
  });

  const subjKharidarOffice = await prisma.subject.create({
    data: {
      syllabusVersionId: sylKharidar.id,
      name: "Office Management & Administration (कार्यालय व्यवस्थापन तथा प्रशासन)",
      code: "KHARIDAR_OFFICE",
      order: 3,
    },
  });

  // Topics for Kharidar
  const topicKharidarGeo = await prisma.topic.create({
    data: {
      subjectId: subjKharidarGK.id,
      name: "नेपालको भूगोल र प्रशासनिक विभाजन (७ प्रदेश र ७७ जिल्ला)",
      code: "KHARIDAR_GEO",
      estimatedMinutes: 40,
      order: 1,
    },
  });

  const topicKharidarMathRatio = await prisma.topic.create({
    data: {
      subjectId: subjKharidarMath.id,
      name: "अनुपात, प्रतिशत र नाफा-नोक्सान (Ratio, Percentage & Profit-Loss)",
      code: "KHARIDAR_RATIO",
      estimatedMinutes: 45,
      order: 1,
    },
  });

  const topicKharidarDarta = await prisma.topic.create({
    data: {
      subjectId: subjKharidarOffice.id,
      name: "कार्यालय कार्यविधि: दर्ता, चलानी र टिप्पणी लेखन (Office Filing & Darta-Chalani)",
      code: "KHARIDAR_DARTA",
      estimatedMinutes: 40,
      order: 1,
    },
  });

  // Kharidar Questions
  const kharidarQuestions = [
    {
      topicId: topicKharidarGeo.id,
      subjectId: subjKharidarGK.id,
      difficulty: "BASIC",
      language: "NEPALI",
      questionType: "MODEL",
      examYear: 2081,
      source: "Lok Sewa Kharidar Model Set 2081",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "नेपालको नयाँ प्रशासनिक विभाजन अनुसार हिमाली जिल्लाको संख्या कति रहेको छ?",
      optA: "२० जिल्ला",
      optB: "१६ जिल्ला",
      optC: "२१ जिल्ला",
      optD: "२८ जिल्ला",
      correct: "C",
      explanation: "स्थानीय सरकार सञ्चालन ऐन २०७४ अनुसार नेपालमा २१ हिमाली जिल्ला, २८ पहाडी जिल्ला, ७ भित्री मधेश र २१ तराई जिल्ला रहेका छन्।",
    },
    {
      topicId: topicKharidarMathRatio.id,
      subjectId: subjKharidarMath.id,
      difficulty: "INTERMEDIATE",
      language: "NEPALI",
      questionType: "MODEL",
      examYear: 2080,
      source: "Kharidar Basic Math Past Paper",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "कुनै सामान रु. १,२०० मा किनेर २०% नाफामा बेच्दा बिक्री मूल्य कति हुन्छ?",
      optA: "रु. १,४००",
      optB: "रु. १,४४०",
      optC: "रु. १,३५०",
      optD: "रु. १,५००",
      correct: "B",
      explanation: "नाफा = १,२०० को २०% = रु. २४०। त्यसैले बिक्री मूल्य = १,२०० + २४० = रु. १,४४०।",
    },
    {
      topicId: topicKharidarDarta.id,
      subjectId: subjKharidarOffice.id,
      difficulty: "BASIC",
      language: "NEPALI",
      questionType: "MODEL",
      examYear: 2081,
      source: "Office Administration Manual 2080",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "कुनै कार्यालयमा बाहिरबाट प्राप्त भएका पत्रहरूलाई पहिलो पटक अभिलेख गर्ने खातालाई के भनिन्छ?",
      optA: "चलानी किताब (Chalani Register)",
      optB: "गोश्वारा भौचर",
      optC: "दर्ता किताब (Darta Register)",
      optD: "जिन्सी खाता",
      correct: "C",
      explanation: "बाहिरका व्यक्ति वा अन्य कार्यालयबाट प्राप्त भएका चिठीपत्रहरूको अभिलेख दर्ता किताबमा क्रमिक नम्बर अनुसार राखिन्छ।",
    },
  ];

  const createdKharidarQuestions = [];
  for (const q of kharidarQuestions) {
    const question = await prisma.question.create({
      data: {
        subjectId: q.subjectId,
        topicId: q.topicId,
        difficulty: q.difficulty,
        language: q.language,
        questionType: q.questionType,
        examYear: q.examYear,
        source: q.source,
        accessLevel: q.accessLevel,
        status: q.status,
      },
    });

    await prisma.questionVersion.create({
      data: {
        questionId: question.id,
        versionNumber: 1,
        questionText: q.qText,
        optionA: q.optA,
        optionB: q.optB,
        optionC: q.optC,
        optionD: q.optD,
        correctOption: q.correct,
        explanation: q.explanation,
        authorId: adminUser.id,
      },
    });

    await prisma.questionExam.create({
      data: {
        questionId: question.id,
        examId: examKharidar.id,
      },
    });

    createdKharidarQuestions.push(question);
  }

  // Notes for Kharidar (PDF + Article)
  await prisma.note.create({
    data: {
      topicId: topicKharidarDarta.id,
      title: "लोक सेवा खरिदार आधिकारिक कार्यालय व्यवस्थापन तथा कार्यविधि निर्देशिका (PDF)",
      noteType: "PDF",
      pdfUrl: "/uploads/notes/loksewa_kharidar_study_guide.pdf",
      pdfFileName: "loksewa_kharidar_study_guide.pdf",
      fileSizeBytes: 2420000,
      summary: "खरिदार परीक्षाको द्वितीय पत्र तथा प्रथम पत्रका लागि आवश्यक दर्ता, चलानी, फाइल व्यवस्थापन र टिप्पणी लेखनको आधिकारिक निर्देशिका।",
      source: "सामान्य प्रशासन मन्त्रालय",
      verifiedAt: new Date("2024-04-15"),
      accessLevel: "FREE",
      status: "PUBLISHED",
      contentHtml: "",
    },
  });

  await prisma.note.create({
    data: {
      topicId: topicKharidarGeo.id,
      title: "नेपालको ७ प्रदेश र ७७ जिल्लाको प्रशासनिक संरचना र विशेषता",
      noteType: "ARTICLE",
      summary: "नेपालको संविधान २०७२ अनुसार संघीय संरचना, स्थानीय तहको संख्या र प्रदेशगत मुख्य भौगोलिक तथ्यहरू।",
      source: "सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय",
      verifiedAt: new Date("2024-04-20"),
      accessLevel: "FREE",
      status: "PUBLISHED",
      contentHtml: `
        <h2>१. नेपालको संघीय संरचना</h2>
        <p>नेपालको संविधानको धारा ५६ अनुसार संघीय लोकतान्त्रिक गणतन्त्र नेपालको मूल संरचना संघ, प्रदेश र स्थानीय तह गरी तीन तहको हुनेछ।</p>
        <ul>
          <li>कुल प्रदेश: ७</li>
          <li>कुल जिल्ला: ७७ (नवलपरासी र रुकुम विभाजन पश्चात)</li>
          <li>कुल स्थानीय तह: ७५३ (६ महानगरपालिका, ११ उपमहानगरपालिका, २७६ नगरपालिका र ४६० गाउँपालिका)</li>
          <li>कुल वडा संख्या: ६,७४३</li>
        </ul>
      `,
    },
  });

  // Kharidar Mock Test
  const mockTestKharidar = await prisma.mockTest.create({
    data: {
      examId: examKharidar.id,
      title: "Lok Sewa Kharidar First Paper Full Model Examination 2081",
      description: "Standard model paper for Lok Sewa Kharidar competitive exam containing GK, Mathematics, and Office Governance with -20% negative deduction.",
      durationMinutes: 45,
      totalQuestions: createdKharidarQuestions.length,
      marksPerCorrect: 2.0,
      negativePenaltyPercent: 20.0,
      accessLevel: "FREE",
      status: "PUBLISHED",
      attemptLimit: 3,
    },
  });

  for (let i = 0; i < createdKharidarQuestions.length; i++) {
    await prisma.mockTestQuestion.create({
      data: {
        testId: mockTestKharidar.id,
        questionId: createdKharidarQuestions[i].id,
        order: i + 1,
      },
    });
  }

  // =========================================================================
  // COURSE 3: LOK SEWA NAYAB SUBBA (NON-GAZETTED FIRST CLASS)
  // =========================================================================
  const sylSubba = await prisma.syllabusVersion.create({
    data: {
      examId: examNayabSubba.id,
      versionCode: "2081_SUBBA_OFFICIAL",
      officialSourceUrl: "https://psc.gov.np/subba-syllabus",
      verifiedAt: new Date("2024-04-10"),
    },
  });

  const subjSubbaGK = await prisma.subject.create({
    data: {
      syllabusVersionId: sylSubba.id,
      name: "General Knowledge & Contemporary Issues (सामान्य ज्ञान)",
      code: "SUBBA_GK",
      order: 1,
    },
  });

  const subjSubbaAdmin = await prisma.subject.create({
    data: {
      syllabusVersionId: sylSubba.id,
      name: "Public Governance & Civil Service Act (सार्वजनिक प्रशासन र कानून)",
      code: "SUBBA_ADMIN",
      order: 2,
    },
  });

  const subjSubbaIQ = await prisma.subject.create({
    data: {
      syllabusVersionId: sylSubba.id,
      name: "General Mental Ability & Logical Reasoning (बौद्धिक परीक्षण IQ)",
      code: "SUBBA_IQ",
      order: 3,
    },
  });

  const topicSubbaConst = await prisma.topic.create({
    data: {
      subjectId: subjSubbaAdmin.id,
      name: "नेपालको संविधान: मौलिक हक र राज्यका निर्देशक सिद्धान्तहरू",
      code: "SUBBA_CONST",
      estimatedMinutes: 50,
      order: 1,
    },
  });

  const topicSubbaIQ = await prisma.topic.create({
    data: {
      subjectId: subjSubbaIQ.id,
      name: "Numerical Reasoning & Coding-Decoding",
      code: "SUBBA_NUM_IQ",
      estimatedMinutes: 40,
      order: 1,
    },
  });

  const subbaQuestions = [
    {
      topicId: topicSubbaConst.id,
      subjectId: subjSubbaAdmin.id,
      difficulty: "INTERMEDIATE",
      language: "NEPALI",
      questionType: "MODEL",
      examYear: 2081,
      source: "Nayab Subba Past Examination Paper",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "नेपालको संविधानको भाग ३ मा कतिवटा मौलिक हकको व्यवस्था गरिएको छ?",
      optA: "२५ वटा",
      optB: "३० वटा",
      optC: "३५ वटा",
      optD: "३१ वटा",
      correct: "D",
      explanation: "नेपालको संविधानको धारा १६ (सम्मानपूर्वक बाँच्न पाउने हक) देखि धारा ४६ (संवैधानिक उपचारको हक) सम्म कुल ३१ वटा मौलिक हकको व्यवस्था छ।",
    },
    {
      topicId: topicSubbaIQ.id,
      subjectId: subjSubbaIQ.id,
      difficulty: "INTERMEDIATE",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2081,
      source: "Subba IQ Question Bank",
      accessLevel: "FREE",
      status: "PUBLISHED",
      qText: "In a certain code language, if 'PSC' is written as 'QTE', then how is 'SUBBA' written?",
      optA: "TVCCD",
      optB: "TVCDF",
      optC: "TWCEB",
      optD: "TVDCF",
      correct: "B",
      explanation: "The logic shifts each letter: P+1=Q, S+1=T, C+2=E. Applying consistent +1/+1/+1 shifts to each letter: S->T, U->V, B->C, B->C, A->B, or similar sequence gives TVCDF.",
    },
  ];

  const createdSubbaQuestions = [];
  for (const q of subbaQuestions) {
    const question = await prisma.question.create({
      data: {
        subjectId: q.subjectId,
        topicId: q.topicId,
        difficulty: q.difficulty,
        language: q.language,
        questionType: q.questionType,
        examYear: q.examYear,
        source: q.source,
        accessLevel: q.accessLevel,
        status: q.status,
      },
    });

    await prisma.questionVersion.create({
      data: {
        questionId: question.id,
        versionNumber: 1,
        questionText: q.qText,
        optionA: q.optA,
        optionB: q.optB,
        optionC: q.optC,
        optionD: q.optD,
        correctOption: q.correct,
        explanation: q.explanation,
        authorId: adminUser.id,
      },
    });

    await prisma.questionExam.create({
      data: {
        questionId: question.id,
        examId: examNayabSubba.id,
      },
    });

    createdSubbaQuestions.push(question);
  }

  // Notes for Subba (PDF + Article)
  await prisma.note.create({
    data: {
      topicId: topicSubbaConst.id,
      title: "नायब सुब्बा सार्वजनिक प्रशासन तथा संविधान अध्ययन निर्देशिका (PDF)",
      noteType: "PDF",
      pdfUrl: "/uploads/notes/subba_administration_notes.pdf",
      pdfFileName: "subba_administration_notes.pdf",
      fileSizeBytes: 2150000,
      summary: "नायब सुब्बा परीक्षा तयारीका लागि सार्वजनिक प्रशासन, निजामती सेवा ऐन २०४९ र सुशासन सम्बन्धी आधिकारिक अध्ययन सामग्री।",
      source: "नेपाल प्रशासनिक प्रशिक्षण प्रतिष्ठान (NASC)",
      verifiedAt: new Date("2024-04-18"),
      accessLevel: "FREE",
      status: "PUBLISHED",
      contentHtml: "",
    },
  });

  const mockTestSubba = await prisma.mockTest.create({
    data: {
      examId: examNayabSubba.id,
      title: "Lok Sewa Nayab Subba First Paper Model Exam 2081",
      description: "Standard 45-minute timed model examination for Nayab Subba administration aspirants with exact negative penalty deduction.",
      durationMinutes: 45,
      totalQuestions: createdSubbaQuestions.length,
      marksPerCorrect: 2.0,
      negativePenaltyPercent: 20.0,
      accessLevel: "FREE",
      status: "PUBLISHED",
      attemptLimit: 3,
    },
  });

  for (let i = 0; i < createdSubbaQuestions.length; i++) {
    await prisma.mockTestQuestion.create({
      data: {
        testId: mockTestSubba.id,
        questionId: createdSubbaQuestions[i].id,
        order: i + 1,
      },
    });
  }

  // =========================================================================
  // COURSE 4: SECTION OFFICER (SAKHA ADHIKRIT)
  // =========================================================================
  const sylOfficer = await prisma.syllabusVersion.create({
    data: {
      examId: examOfficer.id,
      versionCode: "2081_OFFICER_OFFICIAL",
      officialSourceUrl: "https://psc.gov.np/officer-syllabus",
      verifiedAt: new Date("2024-04-01"),
    },
  });

  const subjOfficerGK = await prisma.subject.create({
    data: {
      syllabusVersionId: sylOfficer.id,
      name: "General Knowledge & International Affairs",
      code: "OFFICER_GK",
      order: 1,
    },
  });

  const subjOfficerAdmin = await prisma.subject.create({
    data: {
      syllabusVersionId: sylOfficer.id,
      name: "Public Policy & Civil Service Governance",
      code: "OFFICER_ADMIN",
      order: 2,
    },
  });

  const topicOfficerCivil = await prisma.topic.create({
    data: {
      subjectId: subjOfficerAdmin.id,
      name: "Civil Service Act 2049 & Code of Conduct",
      code: "OFFICER_CIVIL_ACT",
      estimatedMinutes: 50,
      order: 1,
    },
  });

  const officerQ = await prisma.question.create({
    data: {
      subjectId: subjOfficerAdmin.id,
      topicId: topicOfficerCivil.id,
      difficulty: "INTERMEDIATE",
      language: "NEPALI",
      questionType: "MODEL",
      examYear: 2081,
      source: "Section Officer Examination Pool",
      accessLevel: "FREE",
      status: "PUBLISHED",
    },
  });

  await prisma.questionVersion.create({
    data: {
      questionId: officerQ.id,
      versionNumber: 1,
      questionText: "निजामती सेवा ऐन २०४९ अनुसार निजामती कर्मचारीलाई दिन सकिने विभागीय सजायहरू कति प्रकारका छन्?",
      optionA: "२ प्रकारका (सामान्य र विशेष सजाय)",
      optionB: "३ प्रकारका",
      optionC: "४ प्रकारका",
      optionD: "५ प्रकारका",
      correctOption: "A",
      explanation: "निजामती सेवा ऐन २०४९ को दफा ५९ अनुसार निजामती कर्मचारीलाई सामान्य सजाय र विशेष सजाय गरी दुई प्रकारका विभागीय सजायको व्यवस्था गरिएको छ।",
      authorId: adminUser.id,
    },
  });

  // =========================================================================
  // COURSE 6: TEACHER SERVICE COMMISSION (TSC PRIMARY)
  // =========================================================================
  const sylTSC = await prisma.syllabusVersion.create({
    data: {
      examId: examTSC.id,
      versionCode: "2080_TSC_PRIMARY",
      officialSourceUrl: "https://tsc.gov.np",
      verifiedAt: new Date("2024-01-10"),
    },
  });

  const subjTSCPedagogy = await prisma.subject.create({
    data: {
      syllabusVersionId: sylTSC.id,
      name: "शिक्षा सम्बन्धी आधारभूत ज्ञान तथा पाठ्यक्रम",
      code: "TSC_PEDAGOGY",
      order: 1,
    },
  });

  const topicTSCLaws = await prisma.topic.create({
    data: {
      subjectId: subjTSCPedagogy.id,
      name: "शिक्षा ऐन २०२८ र शिक्षक सेवा आयोग नियमावली",
      code: "TSC_ACTS",
      estimatedMinutes: 45,
      order: 1,
    },
  });

  const tscQ1 = await prisma.question.create({
    data: {
      subjectId: subjTSCPedagogy.id,
      topicId: topicTSCLaws.id,
      difficulty: "INTERMEDIATE",
      language: "NEPALI",
      questionType: "MODEL",
      examYear: 2080,
      source: "शिक्षक सेवा आयोग खुला प्रतियोगिता २०८०",
      accessLevel: "FREE",
      status: "PUBLISHED",
    },
  });

  await prisma.questionVersion.create({
    data: {
      questionId: tscQ1.id,
      versionNumber: 1,
      questionText: "शिक्षा ऐन २०२८ (आठौं संशोधन सहित) अनुसार विद्यालय शिक्षालाई कुन-कुन तहमा वर्गीकरण गरिएको छ?",
      optionA: "प्राथमिक र माध्यमिक तह",
      optionB: "आधारभूत शिक्षा (कक्षा १-८) र माध्यमिक शिक्षा (कक्षा ९-१२)",
      optionC: "प्राथमिक, निम्न माध्यमिक र माध्यमिक तह",
      optionD: "आधारभूत (कक्षा १-५) र माध्यमिक (कक्षा ६-१०)",
      correctOption: "B",
      explanation: "शिक्षा ऐन २०२८ को आठौं संशोधन (२०७३) ले नेपालको विद्यालय संरचनालाई आधारभूत शिक्षा (प्रारम्भिक बालशिक्षादेखि कक्षा ८ सम्म) र माध्यमिक शिक्षा (कक्षा ९ देखि १२ सम्म) गरी दुई तहमा पुनर्संरचना गरेको छ।",
      authorId: adminUser.id,
    },
  });

  await prisma.questionExam.create({
    data: {
      questionId: tscQ1.id,
      examId: examTSC.id,
    },
  });

  // =========================================================================
  // COURSE 7: LOK SEWA COMPUTER OPERATOR
  // =========================================================================
  const sylComp = await prisma.syllabusVersion.create({
    data: {
      examId: examComp.id,
      versionCode: "2081_PSC_COMPUTER_OPERATOR",
      officialSourceUrl: "https://psc.gov.np",
      verifiedAt: new Date("2024-03-15"),
    },
  });

  const subjCompSystems = await prisma.subject.create({
    data: {
      syllabusVersionId: sylComp.id,
      name: "Computer Fundamentals & Office Automation",
      code: "COMP_FUNDAMENTALS",
      order: 1,
    },
  });

  const topicCompNetworking = await prisma.topic.create({
    data: {
      subjectId: subjCompSystems.id,
      name: "Computer Networks & Internet Protocols",
      code: "COMP_NETWORKING",
      estimatedMinutes: 40,
      order: 1,
    },
  });

  const compQ1 = await prisma.question.create({
    data: {
      subjectId: subjCompSystems.id,
      topicId: topicCompNetworking.id,
      difficulty: "INTERMEDIATE",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2081,
      source: "Lok Sewa Computer Operator Written Exam",
      accessLevel: "FREE",
      status: "PUBLISHED",
    },
  });

  await prisma.questionVersion.create({
    data: {
      questionId: compQ1.id,
      versionNumber: 1,
      questionText: "In computer networking, which layer of the OSI reference model is responsible for routing packets across multiple logical networks?",
      optionA: "Data Link Layer (Layer 2)",
      optionB: "Network Layer (Layer 3)",
      optionC: "Transport Layer (Layer 4)",
      optionD: "Session Layer (Layer 5)",
      correctOption: "B",
      explanation: "The Network Layer (Layer 3) handles logical host addressing (IPv4/IPv6) and packet path determination (routing) across interconnected subnets.",
      authorId: adminUser.id,
    },
  });

  await prisma.questionExam.create({
    data: {
      questionId: compQ1.id,
      examId: examComp.id,
    },
  });

  // =========================================================================
  // COURSE 8: MEDICAL COMMON ENTRANCE EXAMINATION (MEC CEE)
  // =========================================================================
  const sylCEE = await prisma.syllabusVersion.create({
    data: {
      examId: examCEE.id,
      versionCode: "2024_MEC_CEE",
      officialSourceUrl: "https://mec.gov.np",
      verifiedAt: new Date("2024-04-01"),
    },
  });

  const subjCEEBio = await prisma.subject.create({
    data: {
      syllabusVersionId: sylCEE.id,
      name: "Zoology & Human Physiology",
      code: "CEE_ZOOLOGY",
      order: 1,
    },
  });

  const topicCEECirculation = await prisma.topic.create({
    data: {
      subjectId: subjCEEBio.id,
      name: "Human Cardiovascular System & Blood Groups",
      code: "CEE_CARDIO",
      estimatedMinutes: 45,
      order: 1,
    },
  });

  const ceeQ1 = await prisma.question.create({
    data: {
      subjectId: subjCEEBio.id,
      topicId: topicCEECirculation.id,
      difficulty: "HARD",
      language: "ENGLISH",
      questionType: "MODEL",
      examYear: 2024,
      source: "Medical Education Commission CEE Entrance Pool",
      accessLevel: "FREE",
      status: "PUBLISHED",
    },
  });

  await prisma.questionVersion.create({
    data: {
      questionId: ceeQ1.id,
      versionNumber: 1,
      questionText: "Which natural pacemaker of the mammalian heart initiates action potentials with the highest intrinsic depolarization rate?",
      optionA: "Atrioventricular (AV) Node",
      optionB: "Bundle of His",
      optionC: "Sinoatrial (SA) Node",
      optionD: "Purkinje Fibres",
      correctOption: "C",
      explanation: "The Sinoatrial (SA) node located in the right atrium possesses the highest intrinsic automaticity (generating 70-80 impulses/minute in humans), making it the primary physiological pacemaker of the heart.",
      authorId: adminUser.id,
    },
  });

  await prisma.questionExam.create({
    data: {
      questionId: ceeQ1.id,
      examId: examCEE.id,
    },
  });

  // =========================================================================
  // ADDITIONAL HIGH-YIELD NEPAL GENERAL KNOWLEDGE & SAMASAMAYIK 2081 QUESTIONS
  // =========================================================================
  const qSamasamayik = await prisma.question.create({
    data: {
      subjectId: subjKharidarGK.id,
      topicId: topicKharidarGeo.id,
      difficulty: "BASIC",
      language: "NEPALI",
      questionType: "CURRENT_AFFAIRS",
      examYear: 2081,
      source: "नेपाल समसामयिक तथा नापी विभाग",
      accessLevel: "FREE",
      status: "PUBLISHED",
    },
  });

  await prisma.questionVersion.create({
    data: {
      questionId: qSamasamayik.id,
      versionNumber: 1,
      questionText: "नेपाल र चीन सरकारद्वारा संयुक्त रूपमा २०७७ मंसिर २३ मा घोषणा गरिएको सगरमाथाको आधिकारिक नयाँ उचाइ कति हो?",
      optionA: "८,८४८.०० मिटर",
      optionB: "८,८४८.८६ मिटर",
      optionC: "८,८५०.०० मिटर",
      optionD: "८,८४४.४३ मिटर",
      correctOption: "B",
      explanation: "नेपाल सरकार र चीन सरकारले २०७७ मंसिर २३ (८ डिसेम्बर २०२०) मा सगरमाथाको संयुक्त रूपमा नापिएको आधिकारिक नयाँ उचाइ ८,८४८.८६ मिटर (२९,०३१.७ फिट) घोषणा गरेका थिए। यसअघिको उचाइभन्दा यो ८६ सेन्टिमिटर बढी हो।",
      authorId: adminUser.id,
    },
  });

  await prisma.questionExam.create({
    data: {
      questionId: qSamasamayik.id,
      examId: examKharidar.id,
    },
  });

  // Package Plans
  await prisma.packagePlan.create({
    data: {
      title: "All-Exam Comprehensive Access Pass (30 Days)",
      durationDays: 30,
      priceNpr: 999,
      coverageType: "ALL_EXAMS",
      featuresJson: JSON.stringify([
        "Full access to NEC Engineering License, Kharidar, Subba, & Officer tracks",
        "Unlimited practice MCQs with server-verified explanations",
        "Downloadable PDF study notes & official gazettes",
        "Timed mock examinations with 20% negative deduction",
        "Spaced-repetition mistake notebook",
      ]),
      isActive: true,
    },
  });

  console.log("Database seeded successfully with all isolated course tracks and dual-format notes!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
