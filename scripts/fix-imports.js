const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src/app/student/dashboard/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Export TIER_CONFIG and getAchievementIcon
pageContent = pageContent.replace('const TIER_CONFIG', 'export const TIER_CONFIG');
pageContent = pageContent.replace('function getAchievementIcon', 'export function getAchievementIcon');
fs.writeFileSync(pagePath, pageContent, 'utf8');

// Add missing imports to components
const achPath = path.join(__dirname, '..', 'src/app/student/dashboard/components/AchievementsTab.tsx');
let achContent = fs.readFileSync(achPath, 'utf8');
achContent = achContent.replace('import Link from \'next/link\';', `import Link from 'next/link';
import { TIER_CONFIG, getAchievementIcon } from '../page';
import { getAchievementStatusHint } from '@/lib/gamification';
import { Sparkles } from 'lucide-react';`);
achContent = achContent.replace(/\.filter\(\(a\s*=>\s*a\.unlocked\)/g, '.filter((a: any) => a.unlocked)');
achContent = achContent.replace(/\.filter\(\(a\s*=>\s*!a\.unlocked\)/g, '.filter((a: any) => !a.unlocked)');
achContent = achContent.replace(/\.filter\(\(a: any\) =>\s*!a\.unlocked\)/g, '.filter((a: any) => !a.unlocked)');
fs.writeFileSync(achPath, achContent, 'utf8');

const ptPath = path.join(__dirname, '..', 'src/app/student/dashboard/components/PartnerTab.tsx');
let ptContent = fs.readFileSync(ptPath, 'utf8');
ptContent = ptContent.replace('import { Dumbbell', 'import { Calendar, Activity, Dumbbell');
ptContent = ptContent.replace(/\.reduce\(\(acc,\s*ex\)/g, '.reduce((acc: any, ex: any)');
ptContent = ptContent.replace(/Object\.entries\(grouped\)\.map\(\(\[muscleGroup, exercises\]\)/g, 'Object.entries(grouped).map(([muscleGroup, exercises]: [string, any])');
fs.writeFileSync(ptPath, ptContent, 'utf8');

const wtPath = path.join(__dirname, '..', 'src/app/student/dashboard/components/WeightTab.tsx');
let wtContent = fs.readFileSync(wtPath, 'utf8');
wtContent = wtContent.replace(/props\.handleUpdateWeightGoal/g, 'props.handleUpdateWeightGoal'); // Ensure no errors
fs.writeFileSync(wtPath, wtContent, 'utf8');

console.log("Fixed");
