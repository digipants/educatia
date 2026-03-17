export type ProgramSubcategory = {
  slug: string;
  title: string;
  highlight: string;
  summary: string[];
  image: string;
  details: string[];
};

export const academicsSubcategories: ProgramSubcategory[] = [
  {
    slug: "study-on-screen",
    title: "Study On Screen Program",
    highlight: "Structured digital classes, revision, and board-focused support for Class 9 to 12 students.",
    summary: [
      "Educatia Welfare Trust provides completely free academic support to students of Class 9 to 12 from economically weaker backgrounds. This initiative is created to ensure that no deserving student is left behind due to financial challenges. The program focuses on strengthening subject knowledge, clearing doubts, and improving overall academic performance, especially for board examinations.",
      "Through our well-planned Study On Screen sessions, students receive structured lessons, regular practice, revision support, and exam-oriented guidance that complements their school education. We also encourage disciplined study habits, time management, and self-confidence. Our goal is not only to help students achieve better marks but also to build a strong foundation for higher education and future career opportunities — all without placing any financial burden on their families.",
    ],
    image:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1400&q=80",
    details: [
      "Scheduled lessons for core subjects with focused doubt-solving support.",
      "Weekly revision cycles and practice routines aligned with board exam expectations.",
      "Mentoring on discipline, time management, and confidence in assessments.",
    ],
  },
];

export const softSkillsSubcategories: ProgramSubcategory[] = [
  {
    slug: "spoken-english",
    title: "Spoken English",
    highlight: "Build fluency, pronunciation, and confidence for everyday and professional communication.",
    summary: [
      "In today’s competitive world, effective communication skills are essential not only for students but for individuals of all age groups. Whether for higher education, career advancement, business growth, or personal development, the ability to speak English confidently opens many opportunities. Many individuals do not get the right platform to improve their spoken English, which often leads to hesitation and lack of confidence.",
      "Our Spoken English Program is designed for learners from all backgrounds who wish to improve their communication skills. We focus on vocabulary building, correct pronunciation, sentence formation, and practical conversation skills. Through structured sessions, interactive activities, and regular practice, participants gradually overcome fear and develop fluency.",
      "This program helps individuals express their ideas clearly, participate confidently in discussions, and perform better in interviews, professional meetings, and social interactions. Our goal is to empower every learner with strong communication skills that support personal growth and professional success.",
    ],
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Vocabulary and sentence construction exercises for clarity and confidence.",
      "Pronunciation practice and guided conversations for real-life scenarios.",
      "Interview and professional communication drills for career readiness.",
    ],
  },
  {
    slug: "personality-enhancement",
    title: "Personality Enhancement",
    highlight: "Develop self-confidence, leadership habits, and stronger personal presence.",
    summary: [
      "Success is not defined only by academic knowledge or professional qualifications; it is equally shaped by one’s personality, attitude, and character. Our Personality Enhancement Program is designed to develop confident, responsible, and well-balanced individuals who can perform effectively in every area of life. We believe that strong values, positive thinking, and disciplined habits are the foundation of long-term success.",
      "Through this program, participants are guided to build leadership qualities, improve self-confidence, develop a positive attitude, and strengthen teamwork and communication skills. We focus on improving body language, behavior, decision-making ability, emotional balance, and time management. Regular interactive sessions, practical activities, and motivational guidance help individuals understand their strengths and overcome their weaknesses.",
      "Our clear motto is to shape individuals who are not only academically or professionally capable, but also morally strong, socially responsible, and mentally prepared to face real-life challenges. By nurturing inner confidence and encouraging continuous self-improvement, we aim to create self-reliant, disciplined, and inspiring personalities who can contribute positively to society.",
    ],
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Modules on attitude, emotional balance, and responsible decision-making.",
      "Body language and behavior coaching for stronger social and professional presence.",
      "Teamwork and leadership routines through interactive workshops.",
    ],
  },
  {
    slug: "public-speaking-program",
    title: "Public Speaking Program",
    highlight: "Turn stage fear into clear, persuasive speaking through guided practice.",
    summary: [
      "Public speaking is an essential skill that builds confidence, leadership, and effective communication. Many individuals have strong knowledge and valuable ideas but hesitate to express themselves in front of others due to fear or lack of practice. Our Public Speaking Program is designed to remove stage fear, improve clarity of speech, and develop strong presentation and communication skills.",
      "Through guided practice, structured activities, speech exercises, and continuous encouragement, participants learn how to organize their thoughts, frame meaningful content, and deliver their message with confidence. We focus on voice modulation, body language, eye contact, and audience engagement techniques to help individuals become impactful speakers.",
      "This training not only supports students in school and college presentations but also prepares individuals for debates, seminars, interviews, meetings, leadership roles, and professional responsibilities. Our aim is to transform hesitation into confidence and help every participant become a clear, persuasive, and inspiring speaker who can confidently express ideas in any environment.",
    ],
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Speech planning frameworks to organize ideas clearly.",
      "Voice, pace, and posture training for impactful delivery.",
      "Presentation practice for debates, seminars, interviews, and leadership contexts.",
    ],
  },
];

export const skillDevelopmentSubcategories: ProgramSubcategory[] = [
  {
    slug: "digital-and-it-skills",
    title: "Digital and IT Skills",
    highlight: "Hands-on computer and digital literacy training for modern education and work.",
    summary: [
      "Digital literacy is now an essential skill in our technology-driven world. Our Digital and IT Skills program offers practical, hands-on training in basic to advanced computer applications, covering fundamentals, MS Office, internet use, email, digital documentation, and online safety. This understanding of digital tools is vital for accessing information, improving productivity, applying for jobs, and managing online services in a world shaped by technology.",
      "We also introduce participants to emerging areas such as basic coding, web design fundamentals, digital marketing, data entry operations, and social media management. These skills open doors to freelancing, remote work, and corporate job opportunities. Special focus is given to practical assignments and real-world applications to ensure learners can confidently use their knowledge in professional settings.",
      "Our goal is to bridge the digital divide and ensure that individuals from all backgrounds are not left behind in the modern economy. By building digital confidence and technical competence, we prepare participants to adapt to evolving technologies and secure better career prospects in a competitive job market.",
    ],
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Computer fundamentals, office tools, internet usage, and email workflows.",
      "Intro exposure to coding, web basics, and digital operations tasks.",
      "Hands-on assignments for job-ready digital confidence.",
    ],
  },
  {
    slug: "employment-oriented-vocational-courses",
    title: "Employment Oriented Vocational Courses",
    highlight: "Practical trade-focused training designed to move learners toward jobs quickly.",
    summary: [
      "Our Employment Oriented Vocational Courses are designed to provide practical skills that directly lead to job opportunities. These programs focus on hands-on training in various trades and service sectors based on current market demand. The objective is to help individuals become job-ready in a shorter time frame with specialized, skill-based education.",
      "Training areas may include electrical work, plumbing, tailoring, retail management, office assistance, hospitality support, and other locally relevant trades. Emphasis is placed on practical exposure, safety standards, workplace discipline, and customer service. Participants are guided to understand industry expectations and develop professional work habits.",
      "By offering structured training aligned with employment needs, we aim to reduce unemployment and increase self-reliance. Our vocational courses empower individuals to secure stable jobs, support their families, and contribute positively to the economic development of their communities.",
    ],
    image:
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Skill tracks such as electrical, retail, hospitality, and support services.",
      "Workplace discipline, safety standards, and service quality training.",
      "Fast-track readiness for stable employment opportunities.",
    ],
  },
  {
    slug: "entrepreneurship-and-business-skills",
    title: "Entrepreneurship and Business Skills",
    highlight: "Build business planning, market understanding, and execution skills for self-employment.",
    summary: [
      "Entrepreneurship creates opportunities not only for individuals but also for society as a whole. Our Entrepreneurship and Business Skills program is designed to inspire and equip aspiring entrepreneurs with the knowledge and confidence needed to start and manage their own ventures. We focus on developing innovative thinking, risk assessment abilities, and leadership qualities.",
      "Participants learn the fundamentals of business planning, market research, budgeting, financial management, branding, and customer engagement. The program also covers legal basics, digital promotion strategies, and practical problem-solving techniques. Through case studies and interactive sessions, learners understand how to convert ideas into sustainable enterprises.",
      "Our motto is to promote self-employment and economic independence. By nurturing entrepreneurial spirit and practical business knowledge, we encourage individuals to create job opportunities for themselves and others, contributing to long-term economic growth.",
    ],
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Business planning, market research, and financial basics.",
      "Branding, customer engagement, and digital promotion strategies.",
      "Case-based learning for converting ideas into sustainable ventures.",
    ],
  },
  {
    slug: "green-jobs-and-sustainability",
    title: "Green Jobs and Sustainability",
    highlight: "Prepare for sustainability-driven careers with practical environmental awareness.",
    summary: [
      "Sustainable development is the need of the hour, and green jobs are becoming increasingly important. Our Green Jobs and Sustainability program focuses on environmental awareness and eco-friendly career opportunities. We aim to educate individuals about renewable energy, waste management, water conservation, and sustainable practices.",
      "Participants gain knowledge about solar energy systems, recycling processes, organic waste handling, and environmentally responsible business models. The program promotes sustainable thinking and encourages eco-conscious habits in daily life and professional work.",
      "By building skills in sustainability-related fields, we prepare individuals for emerging green career opportunities while contributing to environmental protection. Our vision is to create responsible citizens who support both economic progress and environmental balance.",
    ],
    image:
      "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Training on renewable energy basics, waste management, and conservation.",
      "Sustainability-first thinking for personal and professional decisions.",
      "Preparation for emerging eco-focused job opportunities.",
    ],
  },
  {
    slug: "agriculture-and-rural-skills",
    title: "Agriculture and Rural Skills",
    highlight: "Modernize rural livelihoods through sustainable farming and agri-business practices.",
    summary: [
      "Agriculture remains a vital sector, especially in rural areas. Our Agriculture and Rural Skills program focuses on improving traditional farming methods with modern techniques. Training includes sustainable farming practices, organic cultivation, livestock management, irrigation methods, and basic agri-business skills.",
      "We also introduce participants to value addition techniques such as food processing, packaging, and local market linkage strategies. By combining practical knowledge with innovation, we help rural communities increase productivity and income.",
      "Our aim is to strengthen rural livelihoods, promote self-sufficiency, and enhance economic stability in agricultural communities. Through skill-based guidance, we encourage sustainable growth and rural empowerment.",
    ],
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Sustainable farming, irrigation methods, and livestock basics.",
      "Value-addition methods such as processing and market linkage.",
      "Rural income growth through practical and scalable techniques.",
    ],
  },
  {
    slug: "food-industry-and-culinary-skills",
    title: "Food Industry and Culinary Skills",
    highlight: "Learn kitchen operations, food safety, and culinary basics for hospitality careers.",
    summary: [
      "The food industry offers diverse career and business opportunities. Our Food Industry and Culinary program provides practical training in cooking techniques, food safety, hygiene standards, kitchen management, and basic baking skills. Participants learn both traditional and modern culinary practices.",
      "We also guide learners on food presentation, menu planning, cost control, and small food business management. This program prepares individuals for employment in restaurants, catering services, hotels, or even starting their own food ventures. By focusing on quality, creativity, and safety standards, we aim to develop skilled culinary professionals who can succeed in the growing hospitality sector.",
    ],
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Cooking methods, food safety, and kitchen workflow fundamentals.",
      "Menu planning, presentation, and cost-control basics.",
      "Career readiness for catering, restaurants, and independent food ventures.",
    ],
  },
  {
    slug: "financial-and-corporate-skills",
    title: "Financial and Corporate Skills",
    highlight: "Gain workplace-ready financial literacy and corporate communication skills.",
    summary: [
      "Understanding financial systems and corporate culture is essential in today’s professional environment. Our Financial and Corporate Skills program covers basic accounting, budgeting, financial literacy, banking procedures, and workplace ethics.",
      "Participants are trained in office communication, documentation, professional conduct, and teamwork. Knowledge of financial planning, taxation basics, and digital financial tools helps individuals manage both personal and organizational finances effectively. Our objective is to prepare participants for corporate roles and responsible financial decision-making, enabling them to grow confidently in professional environments.",
    ],
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Budgeting, accounting basics, and digital finance practices.",
      "Office communication, documentation, and professional etiquette.",
      "Foundational readiness for corporate roles and responsible finance decisions.",
    ],
  },
  {
    slug: "law-and-public-service-support",
    title: "Law and Public Service Support",
    highlight: "Understand legal rights, civic processes, and access to public services.",
    summary: [
      "Awareness of legal rights and public service systems is crucial for responsible citizenship. Our Law and Public Service Support program introduces individuals to basic legal knowledge, government schemes, documentation procedures, and public service structures. Training includes understanding legal rights, civic responsibilities, and procedures related to public services. This knowledge helps individuals access benefits, resolve issues, and participate actively in community development. Our mission is to promote legal awareness and empower individuals to engage responsibly with public institutions.",
    ],
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Basic legal rights and civic responsibility awareness.",
      "Guidance on documentation and government service procedures.",
      "Support for accessing schemes and services responsibly.",
    ],
  },
  {
    slug: "tourism-and-tour-guide-training",
    title: "Tourism and Tour Guide Training",
    highlight: "Train for tourism roles with communication, heritage, and hospitality skills.",
    summary: [
      "Tourism is a rapidly growing sector with vast employment potential. Our Tourism and Tour Guide Training program focuses on communication skills, cultural knowledge, customer service, and local heritage awareness. Participants learn guiding techniques, travel coordination, safety measures, and hospitality etiquette. The program also includes basic foreign language support and digital booking knowledge. By developing professional guiding skills, we aim to create confident tourism professionals who can represent local culture and contribute to economic growth through responsible tourism.",
    ],
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Guide communication, hospitality etiquette, and safety practices.",
      "Local heritage orientation and customer service standards.",
      "Career pathways in travel operations and guided tourism.",
    ],
  },
  {
    slug: "beauty-and-wellness",
    title: "Beauty and Wellness",
    highlight: "Practical beauty and wellness training for employment or independent practice.",
    summary: [
      "The beauty and wellness industry offers promising career opportunities. Our Beauty and Wellness program provides practical training in skincare, hair care, basic cosmetology, hygiene practices, and client service management. Participants also learn about salon setup basics, product knowledge, and small business management in the wellness sector. Emphasis is placed on professionalism, cleanliness, and customer satisfaction. Through skill-based training and confidence building, we aim to create self-reliant professionals who can secure employment or establish their own beauty and wellness ventures successfully.",
    ],
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    details: [
      "Basics of skin care, hair care, hygiene, and client interaction.",
      "Salon setup and product usage fundamentals for beginners.",
      "Employment and self-employment readiness in wellness services.",
    ],
  },
];

export function findSubcategory(list: ProgramSubcategory[], slug: string) {
  return list.find((item) => item.slug === slug);
}
