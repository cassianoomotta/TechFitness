const fs = require('fs');
const path = require('path');

function getBalancedBlock(content, startString) {
  const startIndex = content.indexOf(startString);
  if (startIndex === -1) return null;

  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    
    // Ignore braces inside strings
    if ((char === '"' || char === "'" || char === "\`") && content[i-1] !== '\\\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (stringChar === char) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }

    if (braceCount === 0 && i > startIndex + startString.length) {
      return {
        block: content.substring(startIndex, i + 1),
        startIndex,
        endIndex: i + 1
      };
    }
  }
  return null;
}

const pagePath = path.join(__dirname, '..', 'src/app/student/dashboard/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf-8');

const fichasTab = getBalancedBlock(pageContent, '{activeTab === "fichas" && (');
const duplaTab = getBalancedBlock(pageContent, '{activeTab === "dupla" && (');
const pesoTab = getBalancedBlock(pageContent, '{activeTab === "peso" && (');
const conquistasTab = getBalancedBlock(pageContent, '{activeTab === "conquistas" && (');

if (!fichasTab || !duplaTab || !pesoTab || !conquistasTab) {
  console.log("Could not find all tabs!");
  process.exit(1);
}

const outDir = path.join(__dirname, '..', 'src/app/student/dashboard/components');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const createComponent = (name, block, startString) => {
  let innerJsx = block.substring(startString.length);
  innerJsx = innerJsx.substring(0, innerJsx.length - 2); // remove )} at the end
  
  return `import React from 'react';
import { Dumbbell, Loader2, Award, Trophy, Users, Edit, Eye, Play, Zap, Scale, Flame, Shield, ArrowRight, TrendingUp, RefreshCw, X, ChevronRight, Crown, Swords } from 'lucide-react';
import Link from 'next/link';

export default function ${name}(props: any) {
  const {
    loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
    partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
    measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, submittingWeight, handleAddWeight, handleDeleteMeasurement, selectedPhotoForZoom, setSelectedPhotoForZoom,
    selectedTier, setSelectedTier, achievementFilter, setAchievementFilter
  } = props;

  return (
    <>
      ${innerJsx}
    </>
  );
}`;
};

fs.writeFileSync(path.join(outDir, 'WorkoutTab.tsx'), createComponent('WorkoutTab', fichasTab.block, '{activeTab === "fichas" && ('));
fs.writeFileSync(path.join(outDir, 'PartnerTab.tsx'), createComponent('PartnerTab', duplaTab.block, '{activeTab === "dupla" && ('));
fs.writeFileSync(path.join(outDir, 'WeightTab.tsx'), createComponent('WeightTab', pesoTab.block, '{activeTab === "peso" && ('));
fs.writeFileSync(path.join(outDir, 'AchievementsTab.tsx'), createComponent('AchievementsTab', conquistasTab.block, '{activeTab === "conquistas" && ('));

const giantProps = `{
  loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
  partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
  measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, submittingWeight, handleAddWeight, handleDeleteMeasurement, selectedPhotoForZoom, setSelectedPhotoForZoom,
  selectedTier, setSelectedTier, achievementFilter, setAchievementFilter
}`;

pageContent = pageContent.replace(fichasTab.block, `{activeTab === "fichas" && <WorkoutTab {...${giantProps}} />}`);
pageContent = pageContent.replace(duplaTab.block, `{activeTab === "dupla" && <PartnerTab {...${giantProps}} />}`);
pageContent = pageContent.replace(pesoTab.block, `{activeTab === "peso" && <WeightTab {...${giantProps}} />}`);
pageContent = pageContent.replace(conquistasTab.block, `{activeTab === "conquistas" && <AchievementsTab {...${giantProps}} />}`);

const imports = `
import WorkoutTab from "./components/WorkoutTab";
import PartnerTab from "./components/PartnerTab";
import WeightTab from "./components/WeightTab";
import AchievementsTab from "./components/AchievementsTab";
`;
pageContent = pageContent.replace('import BrandLogo from "@/components/BrandLogo";', 'import BrandLogo from "@/components/BrandLogo";' + imports);

fs.writeFileSync(pagePath, pageContent, 'utf-8');

console.log("Refactoring complete!");
