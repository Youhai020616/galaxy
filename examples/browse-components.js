#!/usr/bin/env node

/**
 * Galaxy组件浏览示例
 * 演示如何使用新的MCP工具浏览和查看组件
 */

const GalaxyUniAppMCPServer = require('../mcp-server');

async function browseComponents() {
  console.log('🌟 Galaxy组件浏览示例\n');
  
  const server = new GalaxyUniAppMCPServer();
  
  // 场景1: 查看组件库概览
  console.log('📊 场景1: 查看组件库整体概览');
  const overview = await server.listAvailableComponents({
    include_stats: true,
    limit: 0  // 只要统计信息，不要具体组件
  });
  
  const stats = overview.statistics;
  console.log(`📦 总共有 ${stats.total_components} 个组件`);
  console.log(`📂 分类分布:`);
  Object.entries(stats.categories).forEach(([category, count]) => {
    const percentage = ((count / stats.total_components) * 100).toFixed(1);
    console.log(`   ${getCategoryIcon(category)} ${category}: ${count}个 (${percentage}%)`);
  });
  
  console.log(`\n⚡ 性能分布:`);
  Object.entries(stats.complexity_distribution).forEach(([complexity, count]) => {
    if (count > 0) {
      const percentage = ((count / stats.total_components) * 100).toFixed(1);
      console.log(`   ${getComplexityIcon(complexity)} ${complexity}: ${count}个 (${percentage}%)`);
    }
  });
  
  console.log(`\n🏆 热门作者 (前5):`);
  stats.top_authors.slice(0, 5).forEach((author, index) => {
    console.log(`   ${index + 1}. ${author.author}: ${author.count}个组件`);
  });
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 场景2: 浏览不同类别的组件
  console.log('🔍 场景2: 浏览不同类别的组件');
  
  const categories = ['buttons', 'loaders', 'tooltips'];
  for (const category of categories) {
    console.log(`\n${getCategoryIcon(category)} ${category.toUpperCase()} 组件:`);
    
    const categoryComponents = await server.listAvailableComponents({
      category: category,
      sort_by: 'complexity',
      sort_order: 'asc',
      limit: 3
    });
    
    console.log(`   找到 ${categoryComponents.total} 个${category}组件，显示前3个简单的:`);
    categoryComponents.components.forEach((comp, index) => {
      const complexity = comp.performance?.complexity || 'unknown';
      const bundleSize = comp.performance?.bundle_size || 0;
      console.log(`   ${index + 1}. ${comp.name}`);
      console.log(`      作者: ${comp.author} | 复杂度: ${complexity} | 大小: ${bundleSize}B`);
    });
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 场景3: 查看热门作者的作品
  console.log('👨‍💻 场景3: 查看热门作者的作品');
  
  const topAuthor = stats.top_authors[0].author;
  console.log(`查看 ${topAuthor} 的作品:`);
  
  const authorComponents = await server.listAvailableComponents({
    author: topAuthor,
    sort_by: 'name',
    limit: 5
  });
  
  console.log(`${topAuthor} 共有 ${authorComponents.total} 个组件，展示前5个:`);
  authorComponents.components.forEach((comp, index) => {
    console.log(`  ${index + 1}. ${comp.name} (${comp.category})`);
    console.log(`     标签: ${comp.tags.slice(0, 3).join(', ') || '无标签'}`);
  });
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 场景4: 深入了解特定组件
  console.log('🔬 场景4: 深入了解特定组件');
  
  const selectedComponent = authorComponents.components[0];
  console.log(`详细分析组件: ${selectedComponent.name}\n`);
  
  const details = await server.getComponentDetails({
    component_id: selectedComponent.id,
    include_code: false,
    include_usage: true
  });
  
  console.log(`📋 基本信息:`);
  console.log(`   名称: ${details.name}`);
  console.log(`   作者: ${details.author}`);
  console.log(`   分类: ${details.category}`);
  console.log(`   描述: ${details.description}`);
  console.log(`   标签: ${details.tags.join(', ') || '无'}`);
  
  console.log(`\n📱 平台支持:`);
  Object.entries(details.platforms).forEach(([platform, supported]) => {
    const status = supported ? '✅' : '❌';
    console.log(`   ${status} ${platform.toUpperCase()}`);
  });
  
  console.log(`\n⚡ 性能信息:`);
  const perf = details.performance;
  console.log(`   复杂度: ${getComplexityIcon(perf.complexity)} ${perf.complexity}`);
  console.log(`   包大小: ${perf.bundle_size} bytes`);
  console.log(`   渲染成本: ${perf.render_cost}`);
  console.log(`   内存使用: ${perf.memory_usage}`);
  
  console.log(`\n🔧 组件接口:`);
  console.log(`   Props: ${details.props.length}个`);
  details.props.forEach(prop => {
    console.log(`     - ${prop.name}: ${prop.type} (默认: ${prop.default})`);
  });
  
  console.log(`   Events: ${details.events.length}个`);
  details.events.forEach(event => {
    console.log(`     - ${event.name}: ${event.description}`);
  });
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 场景5: 按性能要求筛选组件
  console.log('🚀 场景5: 按性能要求筛选组件');
  
  console.log('寻找高性能的按钮组件 (低复杂度):');
  const performantButtons = await server.listAvailableComponents({
    category: 'buttons',
    sort_by: 'complexity',
    sort_order: 'asc',
    limit: 5
  });
  
  const lowComplexityButtons = performantButtons.components.filter(
    comp => comp.performance?.complexity === 'low'
  );
  
  console.log(`找到 ${lowComplexityButtons.length} 个低复杂度按钮:`);
  lowComplexityButtons.forEach((comp, index) => {
    const bundleSize = comp.performance?.bundle_size || 0;
    console.log(`  ${index + 1}. ${comp.name} - ${bundleSize}B`);
    console.log(`     作者: ${comp.author}`);
    console.log(`     标签: ${comp.tags.slice(0, 2).join(', ') || '无'}`);
  });
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 场景6: 发现新组件
  console.log('🆕 场景6: 发现最新添加的组件');
  
  const recentComponents = await server.listAvailableComponents({
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 5
  });
  
  console.log('最新添加的5个组件:');
  recentComponents.components.forEach((comp, index) => {
    const date = comp.created_at ? new Date(comp.created_at).toLocaleDateString() : '未知';
    console.log(`  ${index + 1}. ${comp.name} (${comp.category})`);
    console.log(`     作者: ${comp.author} | 添加时间: ${date}`);
    console.log(`     标签: ${comp.tags.slice(0, 3).join(', ') || '无'}`);
  });
  
  console.log('\n🎉 组件浏览完成！');
  
  console.log('\n💡 浏览技巧:');
  console.log('1. 使用 list_available_components 获取组件概览和统计');
  console.log('2. 通过 category、author、complexity 等参数精确筛选');
  console.log('3. 使用 get_component_details 深入了解组件详情');
  console.log('4. 利用排序功能找到最适合的组件');
  console.log('5. 查看统计信息了解组件库的整体情况');
}

// 辅助函数
function getCategoryIcon(category) {
  const icons = {
    'buttons': '🔘',
    'loaders': '⏳',
    'tooltips': '💬'
  };
  return icons[category] || '📦';
}

function getComplexityIcon(complexity) {
  const icons = {
    'low': '🟢',
    'medium': '🟡',
    'high': '🔴',
    'unknown': '⚪'
  };
  return icons[complexity] || '⚪';
}

// 运行示例
if (require.main === module) {
  browseComponents().catch(console.error);
}
