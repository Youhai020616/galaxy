#!/usr/bin/env node

/**
 * Galaxy UniApp MCP服务使用示例
 * 演示如何使用MCP服务器进行组件搜索、转换和集成
 */

const GalaxyUniAppMCPServer = require('../mcp-server');

async function demonstrateUsage() {
  console.log('🌟 Galaxy UniApp MCP服务使用示例\n');
  
  const server = new GalaxyUniAppMCPServer();
  
  // 场景1: 为电商项目寻找按钮组件
  console.log('📱 场景1: 为电商项目寻找按钮组件');
  console.log('需求: 寻找带动画效果的购买按钮，支持微信小程序\n');
  
  const searchResult = await server.searchUniappComponents({
    category: 'buttons',
    tags: ['animation'],
    platforms: ['H5', 'MP-WEIXIN'],
    limit: 3
  });
  
  console.log(`✅ 找到 ${searchResult.total} 个符合条件的组件:`);
  searchResult.components.forEach((comp, index) => {
    console.log(`  ${index + 1}. ${comp.name}`);
    console.log(`     作者: ${comp.author}`);
    console.log(`     标签: ${comp.tags.join(', ')}`);
    console.log(`     复杂度: ${comp.performance.complexity || 'unknown'}`);
    console.log('');
  });
  
  // 选择第一个组件进行详细分析
  if (searchResult.components.length > 0) {
    const selectedComponent = searchResult.components[0];
    
    console.log(`🔍 详细分析组件: ${selectedComponent.name}\n`);
    
    // 兼容性分析
    const compatibility = await server.analyzeUniappCompatibility({
      component_id: selectedComponent.id,
      target_platforms: ['H5', 'MP-WEIXIN', 'MP-ALIPAY', 'APP-PLUS'],
      check_performance: true
    });
    
    console.log('平台兼容性分析:');
    Object.entries(compatibility.compatibility).forEach(([platform, compat]) => {
      const status = compat.supported ? '✅' : '❌';
      console.log(`  ${status} ${platform}: ${compat.confidence}% 置信度`);
      if (compat.issues.length > 0) {
        console.log(`    ⚠️  问题: ${compat.issues.join(', ')}`);
      }
    });
    
    if (compatibility.performance_analysis) {
      console.log('\n性能分析:');
      const perf = compatibility.performance_analysis;
      console.log(`  📊 复杂度: ${perf.complexity}`);
      console.log(`  📦 包大小: ${perf.bundle_size} bytes`);
      console.log(`  ⚡ 渲染成本: ${perf.render_cost}`);
      
      if (perf.optimization_suggestions.length > 0) {
        console.log('\n优化建议:');
        perf.optimization_suggestions.forEach((suggestion, index) => {
          console.log(`  ${index + 1}. ${suggestion}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 转换组件
    console.log('🔄 转换组件为UniApp格式\n');
    
    const convertResult = await server.convertToUniappComponent({
      component_id: selectedComponent.id,
      target_platforms: ['H5', 'MP-WEIXIN', 'APP-PLUS'],
      enable_conditions: true,
      optimize_for_mp: true,
      component_name: 'EcommerceBuyButton'
    });
    
    console.log(`✅ 转换完成: ${convertResult.original_name} -> ${convertResult.converted_name}`);
    console.log(`🎯 目标平台: ${convertResult.target_platforms.join(', ')}\n`);
    
    // 显示生成的代码
    console.log('📄 生成的Vue组件代码:');
    console.log('```vue');
    console.log('<template>');
    console.log(convertResult.uniapp_component.template);
    console.log('</template>\n');
    
    console.log('<script>');
    console.log(convertResult.uniapp_component.script);
    console.log('</script>\n');
    
    console.log('<style scoped>');
    console.log(convertResult.uniapp_component.style.substring(0, 500) + '...');
    console.log('</style>');
    console.log('```\n');
    
    // 使用示例
    console.log('📖 使用示例:');
    console.log('```vue');
    console.log(convertResult.usage_example);
    console.log('```\n');
    
    console.log('='.repeat(60) + '\n');
    
    // 场景2: 批量集成多个组件
    console.log('📦 场景2: 批量集成多个组件到项目\n');
    
    // 选择几个不同类型的组件
    const componentsToIntegrate = [
      selectedComponent.id,
      'Nawsome_chilly-moose-65', // 一个loader组件
      'SmookyDev_itchy-newt-24'  // 一个tooltip组件
    ];
    
    const integrationResult = await server.generateUniappProjectIntegration({
      components: componentsToIntegrate,
      auto_import: true,
      global_styles: true
    });
    
    console.log(`✅ 生成项目集成代码，包含 ${integrationResult.components_count} 个组件\n`);
    
    // 显示配置文件
    console.log('📋 生成的配置文件:');
    Object.entries(integrationResult.configuration).forEach(([file, content]) => {
      console.log(`\n📄 ${file}:`);
      if (typeof content === 'string') {
        console.log(content.substring(0, 300) + (content.length > 300 ? '...' : ''));
      } else {
        console.log(JSON.stringify(content, null, 2).substring(0, 300) + '...');
      }
    });
    
    console.log('\n📁 生成的组件文件:');
    Object.keys(integrationResult.integration_files).forEach(file => {
      console.log(`  🧩 ${file}`);
    });
    
    console.log('\n📝 安装步骤:');
    integrationResult.installation_guide.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 场景3: 按特定需求搜索
    console.log('🎨 场景3: 按特定设计需求搜索组件\n');
    
    const designSearches = [
      {
        name: '加载动画',
        params: { category: 'loaders', tags: ['animation'], limit: 3 }
      },
      {
        name: '提示框',
        params: { category: 'tooltips', limit: 3 }
      },
      {
        name: '高性能按钮',
        params: { category: 'buttons', complexity: 'low', limit: 3 }
      }
    ];
    
    for (const search of designSearches) {
      console.log(`🔍 搜索${search.name}:`);
      const result = await server.searchUniappComponents(search.params);
      console.log(`  找到 ${result.total} 个组件`);
      result.components.slice(0, 2).forEach((comp, index) => {
        console.log(`  ${index + 1}. ${comp.name} (${comp.author})`);
      });
      console.log('');
    }
  }
  
  console.log('🎉 示例演示完成！');
  console.log('\n💡 提示:');
  console.log('- 可以通过MCP协议在AI助手中使用这些功能');
  console.log('- 支持实时搜索和转换组件');
  console.log('- 自动处理平台兼容性问题');
  console.log('- 生成完整的项目集成代码');
}

// 运行示例
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}
