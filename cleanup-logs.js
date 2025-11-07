// Script para limpiar console.logs de debug en producción
const fs = require('fs');

const files = [
  'src/context/AppContext.tsx',
  'src/lib/portfolioService.ts',
  'src/lib/supabaseTest.ts'
];

const logPatterns = [
  /console\.log\('🔄[^']+'\);?\n?/g,
  /console\.log\('✅[^']+'\);?\n?/g,
  /console\.log\('📊[^']+'\);?\n?/g,
  /console\.log\('📝[^']+'\);?\n?/g,
  /console\.log\(`✅[^`]+`\);?\n?/g,
  /console\.log\(`🔄[^`]+`\);?\n?/g,
  /\s*console\.log\('🚀[^']+'\);\s*/g
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    logPatterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // Limpiar líneas vacías extra
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Limpiado: ${filePath}`);
    }
  }
});

console.log('🧹 Console.logs de debug eliminados');