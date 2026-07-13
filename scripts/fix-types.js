const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src/app/student/dashboard/components');
const files = fs.readdirSync(targetDir).map(f => path.join(targetDir, f));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\.map\(\(p\)/g, '.map((p: any)');
  content = content.replace(/\.map\(\(n\)/g, '.map((n: any)');
  content = content.replace(/\.map\(\(plan\)/g, '.map((plan: any)');
  content = content.replace(/\.map\(\(day\)/g, '.map((day: any)');
  content = content.replace(/\.map\(\(ex\)/g, '.map((ex: any)');
  content = content.replace(/\.map\(\(pr\)/g, '.map((pr: any)');
  content = content.replace(/\.map\(\(user, idx\)/g, '.map((user: any, idx: any)');
  content = content.replace(/\.map\(\(achievement\)/g, '.map((achievement: any)');
  content = content.replace(/\.map\(\(m\)/g, '.map((m: any)');
  content = content.replace(/\.map\(\(photo, pIdx\)/g, '.map((photo: any, pIdx: any)');
  content = content.replace(/\.map\(\(m, idx\)/g, '.map((m: any, idx: any)');
  content = content.replace(/\.filter\(\(a\)/g, '.filter((a: any)');
  content = content.replace(/\.filter\(\(a\s*=>\s*a\.unlocked\)/g, '.filter((a: any) => a.unlocked)');
  content = content.replace(/\.filter\(\(a\s*=>\s*!a\.unlocked\)/g, '.filter((a: any) => !a.unlocked)');
  
  content = content.replace(/expandedMeasurementId/g, 'props.expandedMeasurementId');
  content = content.replace(/setExpandedMeasurementId/g, 'props.setExpandedMeasurementId');
  content = content.replace(/weightError/g, 'props.weightError');
  content = content.replace(/weightGoal/g, 'props.weightGoal');

  fs.writeFileSync(file, content);
}
console.log("Done");
