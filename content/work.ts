export type WorkEntry = {
  role: string;
  company: string;
  period: string;
  description: string;
};

export const work: WorkEntry[] = [
  {
    role: "Senior UI Designer",
    company: "Wisetech Global",
    period: "2025 - Present",
    description:
      "Leading the newest chapter of WTG's design system, underpinning the web framework and future product direction. Setting the visual and system strategy for a multi-brand, multi-product platform, from foundations and token architecture through to patterns, templates, and governance. Partnering closely with engineering and product to ship production-ready standards, with accessibility and theming treated as non-negotiables and AI-ready documentation built in from day one.",
  },
  {
    role: "Design Consultant",
    company: "Brand and Product",
    period: "2020 - Present",
    description:
      "Partnering with teams from early concept through to shipped UI, providing advisory and hands-on delivery across product design, UI direction, and design systems. Helping businesses define a clear vision and visual language, then translating that into practical standards teams can build with. Especially in AI-accelerated workflows, I focus on reducing “slop” output by setting a strong quality bar, cohesive patterns, and production-ready guidance.",
  },
  {
    role: "UI/UX Manager",
    company: "Derivco Sports",
    period: "2019 - 2024",
    description:
      "Led end-to-end product design for global betting and casino experiences, aligning product and engineering across time zones and coaching a team of designers. Drove measurable improvement in customer satisfaction (CSAT reaching 4.28), introduced scalable workflows and design system patterns, and improved design-to-development handoff efficiency by 66% to support faster, more consistent delivery.",
  },
  {
    role: "UI/UX Designer",
    company: "KPMG (prev. Love Agency)",
    period: "2017 - 2019",
    description:
      "Designed and tested digital products across client engagements, partnering in workshops to shape bespoke solutions from early concept through to validated outcomes. Built and introduced design system foundations from scratch to improve consistency and reduce design-to-development friction. Facilitated usability testing and translated qualitative insights into product improvements, strengthening the business case through research-backed decision making.",
  },
  {
    role: "Digital and Motion Designer",
    company: "Mobiddiction",
    period: "2015 - 2017",
    description:
      "Designed mobile and web experiences and motion assets for blue-chip clients, collaborating in a lean team to take concepts through to launch with polished UI and interactions.",
  },
];

export type EducationEntry = {
  institution: string;
  period: string;
  qualification: string;
};

export const education: EducationEntry[] = [
  {
    institution: "Billy Blue College of Design",
    period: "2013-2015",
    qualification: "Bachelors in Applied Design (Motion and UX)",
  },
];
