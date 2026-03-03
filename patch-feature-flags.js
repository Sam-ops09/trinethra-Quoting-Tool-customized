const fs = require('fs');
const content = fs.readFileSync('shared/feature-flags.ts', 'utf8');

// Insert new feature flags into the interface
let newContent = content.replace(
  /quotes_termsConditions: boolean;/,
  `quotes_termsConditions: boolean;
  
  // Suggested Improvements
  quotes_optionalItems: boolean;
  quotes_profitMargin: boolean;
  quotes_eSignature: boolean;
  quotes_activityTracking: boolean;
  quotes_autoExpiration: boolean;
  quotes_dynamicTemplates: boolean;
  quotes_multiOption: boolean;`
);

// Insert into DEFAULT_FEATURE_FLAGS
newContent = newContent.replace(
  /quotes_termsConditions: true,/,
  `quotes_termsConditions: true,
  quotes_optionalItems: true,
  quotes_profitMargin: true,
  quotes_eSignature: true,
  quotes_activityTracking: true,
  quotes_autoExpiration: true,
  quotes_dynamicTemplates: true,
  quotes_multiOption: true,`
);

fs.writeFileSync('shared/feature-flags.ts', newContent);
console.log("Patched feature-flags.ts");
