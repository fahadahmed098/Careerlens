// Har skill ka naam + uske alternate naam (aliases)
const SKILLS = {
  JavaScript: ['javascript', 'es6'], TypeScript: ['typescript'], Python: ['python'],
  Java: ['java'], 'C++': ['c++'], 'C#': ['c#'], PHP: ['php'], SQL: ['sql'],
  React: ['react', 'react.js', 'reactjs'], 'Next.js': ['next.js', 'nextjs'],
  'Node.js': ['node.js', 'nodejs', 'node js'], 'Express.js': ['express', 'express.js'],
  FastAPI: ['fastapi', 'fast api'], Django: ['django'], Flask: ['flask'], '.NET': ['.net', 'asp.net'],
  MongoDB: ['mongodb', 'mongo'], PostgreSQL: ['postgresql', 'postgres'], MySQL: ['mysql'],
  Redis: ['redis'], GraphQL: ['graphql'], 'REST API': ['rest api', 'restful', 'rest apis'],
  HTML: ['html', 'html5'], CSS: ['css', 'css3'], Tailwind: ['tailwind', 'tailwindcss'],
  Redux: ['redux'], WordPress: ['wordpress'], WooCommerce: ['woocommerce'], Shopify: ['shopify'],
  Git: ['git', 'github', 'gitlab'], Docker: ['docker'], Kubernetes: ['kubernetes', 'k8s'],
  AWS: ['aws', 'amazon web services'], Azure: ['azure'], 'CI/CD': ['ci/cd', 'cicd'],
  Linux: ['linux'], Testing: ['jest', 'unit testing', 'cypress', 'pytest'],
  'Machine Learning': ['machine learning', 'xgboost', 'scikit-learn'],
  'Data Analysis': ['pandas', 'numpy', 'data analysis'], 'Power BI': ['power bi'],
  Figma: ['figma'], Agile: ['agile', 'scrum'], SEO: ['seo'],
  'Digital Marketing': ['digital marketing', 'facebook ads', 'google ads'],
  'Problem Solving': ['problem solving', 'problem-solving'], Communication: ['communication'],
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
// "java" ko "javascript" ke andar match hone se rokta hai
const compact = (s) => s.toLowerCase().replace(/[^a-z0-9+#]/g, '');
const has = (text, term) => {
  const exact = new RegExp(`(^|[^a-z0-9+#])${escape(term)}($|[^a-z0-9+#])`, 'i');
  if (exact.test(text)) return true;
  // PDF kabhi "Node. js" ya "REST API" ko tor deta hai: multi-word naamon ke liye spaces/dots hata kar bhi dekhte hain
  return /[\s.\/-]/.test(term) && compact(term).length >= 5 && compact(text).includes(compact(term));
};

const findSkills = (text) =>
  Object.keys(SKILLS).filter((skill) => SKILLS[skill].some((alias) => has(text, alias)));

export function matchResume(resumeText, jobText) {
  const jobSkills = findSkills(jobText);
  const resumeSkills = findSkills(resumeText);
  const matched = jobSkills.filter((s) => resumeSkills.includes(s));
  const missing = jobSkills.filter((s) => !resumeSkills.includes(s));
  const extra = resumeSkills.filter((s) => !jobSkills.includes(s));
  const score = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : null;
  return { score, matched, missing, extra, jobSkillCount: jobSkills.length };
}
