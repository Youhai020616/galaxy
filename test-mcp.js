#!/usr/bin/env node

const GalaxyUniAppMCPServer = require('./mcp-server');

/**
 * 测试Galaxy UniApp MCP服务器
 */
async function testMCPServer() {
  console.log('🚀 开始测试Galaxy UniApp MCP服务器...\n');
  
  const server = new GalaxyUniAppMCPServer();
  
  // 测试1: 搜索组件
  console.log('📋 测试1: 搜索组件');
  try {
    const searchResult = await server.searchUniappComponents({
      query: 'button',
      category: 'buttons',
      limit: 5
    });
    
    console.log(`✅ 找到 ${searchResult.total} 个按钮组件`);
    console.log('前5个组件:');
    searchResult.components.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} (${comp.author}) - ${comp.tags.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ 搜索组件失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试2: 分析组件兼容性
  console.log('🔍 测试2: 分析组件兼容性');
  try {
    const compatibilityResult = await server.analyzeUniappCompatibility({
      component_id: 'cssbuttons-io_brown-otter-21',
      target_platforms: ['H5', 'MP-WEIXIN', 'MP-ALIPAY', 'APP-PLUS'],
      check_performance: true
    });
    
    console.log(`✅ 组件: ${compatibilityResult.component_name}`);
    console.log('平台兼容性:');
    Object.entries(compatibilityResult.compatibility).forEach(([platform, compat]) => {
      const status = compat.supported ? '✅' : '❌';
      const confidence = compat.confidence || 0;
      console.log(`  ${status} ${platform}: ${confidence}% 置信度`);
      if (compat.issues.length > 0) {
        console.log(`    问题: ${compat.issues.join(', ')}`);
      }
    });
    
    if (compatibilityResult.performance_analysis) {
      console.log('性能分析:');
      const perf = compatibilityResult.performance_analysis;
      console.log(`  复杂度: ${perf.complexity}`);
      console.log(`  包大小: ${perf.bundle_size} bytes`);
      console.log(`  渲染成本: ${perf.render_cost}`);
    }
  } catch (error) {
    console.error('❌ 兼容性分析失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试3: 转换组件
  console.log('🔄 测试3: 转换组件为UniApp格式');
  try {
    const convertResult = await server.convertToUniappComponent({
      component_id: 'cssbuttons-io_brown-otter-21',
      target_platforms: ['H5', 'MP-WEIXIN', 'APP-PLUS'],
      enable_conditions: true,
      optimize_for_mp: true,
      component_name: 'GalaxyFancyButton'
    });
    
    console.log(`✅ 转换完成: ${convertResult.original_name} -> ${convertResult.converted_name}`);
    console.log('目标平台:', convertResult.target_platforms.join(', '));
    console.log('\n组件代码预览:');
    console.log('Template:');
    console.log(convertResult.uniapp_component.template.substring(0, 200) + '...');
    console.log('\nScript:');
    console.log(convertResult.uniapp_component.script.substring(0, 300) + '...');
    
    if (convertResult.performance_tips.length > 0) {
      console.log('\n性能提示:');
      convertResult.performance_tips.forEach((tip, index) => {
        console.log(`  ${index + 1}. ${tip}`);
      });
    }
  } catch (error) {
    console.error('❌ 组件转换失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试4: 生成项目集成代码
  console.log('📦 测试4: 生成项目集成代码');
  try {
    const integrationResult = await server.generateUniappProjectIntegration({
      components: [
        'cssbuttons-io_brown-otter-21',
        'cssbuttons-io_calm-tiger-42'
      ],
      auto_import: true,
      global_styles: true
    });
    
    console.log(`✅ 生成集成代码，包含 ${integrationResult.components_count} 个组件`);
    console.log('\n配置文件:');
    Object.keys(integrationResult.configuration).forEach(file => {
      console.log(`  📄 ${file}`);
    });
    
    console.log('\n组件文件:');
    Object.keys(integrationResult.integration_files).forEach(file => {
      console.log(`  🧩 ${file}`);
    });
    
    console.log('\n安装步骤:');
    integrationResult.installation_guide.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
  } catch (error) {
    console.error('❌ 项目集成代码生成失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试5: 按标签搜索
  console.log('🏷️ 测试5: 按标签搜索组件');
  try {
    const tagSearchResult = await server.searchUniappComponents({
      tags: ['animation'],
      limit: 3
    });
    
    console.log(`✅ 找到 ${tagSearchResult.total} 个带动画的组件`);
    tagSearchResult.components.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} - 标签: ${comp.tags.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ 标签搜索失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试6: 按作者搜索
  console.log('👤 测试6: 按作者搜索组件');
  try {
    const authorSearchResult = await server.searchUniappComponents({
      author: 'cssbuttons-io',
      limit: 3
    });
    
    console.log(`✅ 找到 ${authorSearchResult.total} 个 cssbuttons-io 的组件`);
    authorSearchResult.components.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} (${comp.category})`);
    });
  } catch (error) {
    console.error('❌ 作者搜索失败:', error.message);
  }
  
  console.log('\n🎉 测试完成！');
}

// 运行测试
if (require.main === module) {
  testMCPServer().catch(console.error);
}
