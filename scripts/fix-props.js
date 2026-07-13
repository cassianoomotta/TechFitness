const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src/app/student/dashboard/components');
const files = fs.readdirSync(targetDir).map(f => path.join(targetDir, f));
files.push(path.join(__dirname, '..', 'src/app/student/dashboard/page.tsx'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/submittingWeight,\s*handleAddWeight,\s*handleDeleteMeasurement/g, 'savingWeight, handleSaveWeight');
  content = content.replace(/weightGoal, setWeightGoal, handleUpdateWeightGoal, weightError/g, ''); // cleanup any extra
  
  // Actually, we NEED weightGoal etc in WeightTab and page.tsx, so let's just replace submittingWeight
  // Wait, let's just make it consistent everywhere:
  const oldProps = 'savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,\n    selectedTier, setSelectedTier, achievementFilter, setAchievementFilter';
  const newProps = 'savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,\n    selectedTier, setSelectedTier, achievementFilter, setAchievementFilter, weightGoal, setWeightGoal, handleUpdateWeightGoal, weightError';
  
  content = content.replace(/submittingWeight,\s*handleAddWeight,\s*handleDeleteMeasurement,\s*selectedPhotoForZoom,\s*setSelectedPhotoForZoom,\n\s*selectedTier,\s*setSelectedTier,\s*achievementFilter,\s*setAchievementFilter/g, newProps);
  
  fs.writeFileSync(file, content);
}
console.log("Done");
