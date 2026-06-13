import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const states = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware',
  'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky',
  'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi',
  'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire', 'new-jersey', 'new-mexico',
  'new-york', 'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
  'rhode-island', 'south-carolina', 'south-dakota', 'tennessee', 'texas', 'utah', 'vermont',
  'virginia', 'washington', 'west-virginia', 'wisconsin', 'wyoming'
];

export default defineConfig(() => {
  const inputEntries: Record<string, string> = {
    main: path.resolve(__dirname, 'index.html'),
    calculator: path.resolve(__dirname, 'roofing-cost-calculator/index.html'),
    costGuides: path.resolve(__dirname, 'cost-guides/index.html'),
    getEstimates: path.resolve(__dirname, 'get-estimates/index.html'),
    roofCost: path.resolve(__dirname, 'how-much-does-a-new-roof-cost/index.html'),
    admin: path.resolve(__dirname, 'admin/index.html'),
    contact: path.resolve(__dirname, 'contact/index.html'),
    privacyPolicy: path.resolve(__dirname, 'privacy-policy/index.html'),
    termsOfUse: path.resolve(__dirname, 'terms-of-use/index.html'),
    disclaimer: path.resolve(__dirname, 'disclaimer/index.html'),
    about: path.resolve(__dirname, 'about/index.html'),
    editorialPolicy: path.resolve(__dirname, 'editorial-policy/index.html'),
    costMethodology: path.resolve(__dirname, 'cost-methodology/index.html'),
    
    // MAIN COST GUIDES
    roofReplacementCost: path.resolve(__dirname, 'roof-replacement-cost/index.html'),
    newRoofCost: path.resolve(__dirname, 'new-roof-cost/index.html'),
    roofRepairCost: path.resolve(__dirname, 'roof-repair-cost/index.html'),
    roofInspectionCost: path.resolve(__dirname, 'roof-inspection-cost/index.html'),
    roofCleaningCost: path.resolve(__dirname, 'roof-cleaning-cost/index.html'),
    
    // MATERIAL CLUSTER
    metalRoofCost: path.resolve(__dirname, 'metal-roof-cost/index.html'),
    standingSeamMetalRoofCost: path.resolve(__dirname, 'standing-seam-metal-roof-cost/index.html'),
    metalRoofVsShinglesCost: path.resolve(__dirname, 'metal-roof-vs-shingles-cost/index.html'),
    asphaltShingleRoofCost: path.resolve(__dirname, 'asphalt-shingle-roof-cost/index.html'),
    tileRoofCost: path.resolve(__dirname, 'tile-roof-cost/index.html'),
    slateRoofCost: path.resolve(__dirname, 'slate-roof-cost/index.html'),
    
    // COST CALCULATOR TOOLS
    roofAgeCalculator: path.resolve(__dirname, 'roof-age-calculator/index.html'),
    roofingCostPerSquareFootCalculator: path.resolve(__dirname, 'roofing-cost-per-square-foot/index.html'),
    roofMaterialCostCalculator: path.resolve(__dirname, 'roof-material-cost-calculator/index.html'),
    
    // INSURANCE CLUSTER
    roofInsuranceClaim: path.resolve(__dirname, 'roof-insurance-claim/index.html'),
    hailDamageRoof: path.resolve(__dirname, 'hail-damage-roof/index.html'),
    stormDamageRoof: path.resolve(__dirname, 'storm-damage-roof/index.html'),
    
    // STATE HUB
    roofCostByState: path.resolve(__dirname, 'roof-cost-by-state/index.html'),
    
    // COMPARISON POSTS
    roofRepairVsReplacement: path.resolve(__dirname, 'roof-repair-vs-replacement/index.html'),
    metalVsTileRoof: path.resolve(__dirname, 'metal-vs-tile-roof/index.html'),
    asphaltVsMetalRoof: path.resolve(__dirname, 'asphalt-vs-metal-roof/index.html'),
    
    // BLOG / RESOURCE CENTER
    howLongDoesARoofLast: path.resolve(__dirname, 'how-long-does-a-roof-last/index.html'),
    signsYouNeedANewRoof: path.resolve(__dirname, 'signs-you-need-a-new-roof/index.html'),
    bestRoofingMaterials: path.resolve(__dirname, 'best-roofing-materials/index.html'),
    howToChooseARoofingContractor: path.resolve(__dirname, 'how-to-choose-a-roofing-contractor/index.html')
  };

  // Dynamically map all 50 states
  states.forEach(state => {
    const key = 'roofCost' + state.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    inputEntries[key] = path.resolve(__dirname, `roof-cost/${state}/index.html`);
  });

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: inputEntries
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
