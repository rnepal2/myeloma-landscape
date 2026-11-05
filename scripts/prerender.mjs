import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "vite";

const pages = [
  ["/", "Myeloma Landscape — trials and research updates", "Explore multiple myeloma studies by therapy and target, with weekly registry changes and public source links."],
  ["/pipeline", "Therapies and targets | Myeloma Landscape", "Explore myeloma therapies, targets and their linked active studies."],
  ["/trials", "Clinical studies | Myeloma Landscape", "Search multiple myeloma clinical studies by therapy, target, phase, status and country."],
  ["/evidence", "Literature and funding | Myeloma Landscape", "Browse PubMed citation metadata and title-matched NIH funding records."],
  ["/regulatory", "Regulatory sources | Myeloma Landscape", "Review selected FDA notices, DailyMed labels, EMA medicine status and FDA shortage records."],
  ["/methodology", "Sources and limitations | Myeloma Landscape", "Source retrieval status, definitions and coverage limitations for Myeloma Landscape."],
];
const files = {summary:"summary", trials:"trials", assets:"assets", changes:"changes", regulatory:"regulatory", evidence:"evidence", market:"market-context", strategic:"strategic", sources:"sources"};
const data = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key,name]) => [key,JSON.parse(await readFile(`public/data/${name}.json`,"utf8"))])));
const template = await readFile("dist/index.html","utf8");
const server = await createServer({server:{middlewareMode:true},appType:"custom"});
const escape = value => value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;");
try {
 const {render} = await server.ssrLoadModule("/src/prerender.tsx");
 for (const [path,title,description] of pages) {
  const url=`https://myeloma-landscape.pages.dev${path}`;
  let html = template.replace(/<title>.*?<\/title>/s,`<title>${escape(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(description)}">`)
    .replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${url}">`)
    .replace('<div id="root"></div>',`<div id="root" data-prerendered="true">${render(path,data)}</div>`)
    .replace("</head>",`<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}"><meta property="og:type" content="website"></head>`);
  const folder = path === "/" ? "dist" : `dist${path}`;
  if (!html.includes("<h1") || html.includes('aria-live="polite"') || !html.includes(`href="${url}"`)) {
    throw new Error(`Incomplete pre-rendered route: ${path}`);
  }
  await mkdir(folder,{recursive:true});
  await writeFile(`${folder}/index.html`,html);
 }
 console.log(`Pre-rendered ${pages.length} public routes.`);
} finally {await server.close();}
