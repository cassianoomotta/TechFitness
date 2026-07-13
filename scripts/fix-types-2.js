const fs = require('fs');
const path = require('path');

const wtPath = path.join(__dirname, '..', 'src/app/student/dashboard/components/WeightTab.tsx');
let wt = fs.readFileSync(wtPath, 'utf8');
wt = wt.replace(/props\.handleUpdateWeightGoal/g, 'props.handleUpdateWeightGoal'); // Wait, the error says 'Cannot find name handleUpdateWeightGoal'. So it was used WITHOUT props.
wt = wt.replace(/handleUpdateWeightGoal\(/g, 'props.handleUpdateWeightGoal(');
fs.writeFileSync(wtPath, wt);

const ptPath = path.join(__dirname, '..', 'src/app/student/dashboard/components/PartnerTab.tsx');
let pt = fs.readFileSync(ptPath, 'utf8');
pt = pt.replace(/\(exercises as any\)/g, 'exercises'); // to prevent double
pt = pt.replace(/exercises\.length/g, '(exercises as any[]).length');
pt = pt.replace(/exercises\.map/g, '(exercises as any[]).map');
pt = pt.replace(/\(ex\)/g, '(ex: any)');
fs.writeFileSync(ptPath, pt);

const achPath = path.join(__dirname, '..', 'src/app/student/dashboard/components/AchievementsTab.tsx');
let ach = fs.readFileSync(achPath, 'utf8');
ach = ach.replace(/\.filter\(\(a\s*=>/g, '.filter((a: any) =>');
ach = ach.replace(/\(a\)/g, '(a: any)');
fs.writeFileSync(achPath, ach);

const woPath = path.join(__dirname, '..', 'src/app/student/dashboard/components/WorkoutTab.tsx');
let wo = fs.readFileSync(woPath, 'utf8');
wo = wo.replace(/\.filter\(\(a\)/g, '.filter((a: any)');
wo = wo.replace(/\.filter\(\(a =>/g, '.filter((a: any) =>');
fs.writeFileSync(woPath, wo);

console.log("Fixed more");
