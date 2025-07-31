#!/usr/bin/env node

const GalaxyUniAppMCPServer = require('./mcp-server');

/**
 * 测试新增的MCP工具
 */
async function testNewTools() {
  console.log('🚀 测试新增的MCP工具...\n');
  
  const server = new GalaxyUniAppMCPServer();
  
  // 测试1: 列出所有组件 (带统计信息)
  console.log('📋 测试1: 列出所有组件概览');
  try {
    const listResult = await server.listAvailableComponents({
      include_stats: true,
      include_preview: false,
      limit: 10,
      sort_by: 'name',
      sort_order: 'asc'
    });
    
    console.log(`✅ 总共有 ${listResult.total} 个组件`);
    console.log('\n📊 统计信息:');
    const stats = listResult.statistics;
    
    console.log(`  总组件数: ${stats.total_components}`);
    console.log(`  分类分布:`);
    Object.entries(stats.categories).forEach(([category, count]) => {
      console.log(`    ${category}: ${count}个`);
    });
    
    console.log(`  复杂度分布:`);
    Object.entries(stats.complexity_distribution).forEach(([complexity, count]) => {
      console.log(`    ${complexity}: ${count}个`);
    });
    
    console.log(`  平台支持:`);
    Object.entries(stats.platform_support).forEach(([platform, count]) => {
      console.log(`    ${platform}: ${count}个组件支持`);
    });
    
    console.log(`  性能指标:`);
    console.log(`    平均包大小: ${stats.performance_metrics.avg_bundle_size} bytes`);
    console.log(`    最小包大小: ${stats.performance_metrics.min_bundle_size} bytes`);
    console.log(`    最大包大小: ${stats.performance_metrics.max_bundle_size} bytes`);
    
    console.log(`\n🏆 热门作者 (前5):`);
    stats.top_authors.slice(0, 5).forEach((author, index) => {
      console.log(`  ${index + 1}. ${author.author}: ${author.count}个组件`);
    });
    
    console.log(`\n🏷️ 热门标签 (前8):`);
    stats.popular_tags.slice(0, 8).forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.tag}: ${tag.count}次使用`);
    });
    
    console.log(`\n📅 最新组件 (前3):`);
    stats.recent_components.slice(0, 3).forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} by ${comp.author}`);
    });
    
  } catch (error) {
    console.error('❌ 列出组件失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试2: 按分类列出组件
  console.log('🔘 测试2: 列出按钮组件 (按复杂度排序)');
  try {
    const buttonResult = await server.listAvailableComponents({
      category: 'buttons',
      sort_by: 'complexity',
      sort_order: 'asc',
      include_stats: false,
      limit: 5
    });
    
    console.log(`✅ 找到 ${buttonResult.total} 个按钮组件`);
    console.log('前5个简单按钮:');
    buttonResult.components.forEach((comp, index) => {
      const complexity = comp.performance?.complexity || 'unknown';
      const bundleSize = comp.performance?.bundle_size || 'unknown';
      console.log(`  ${index + 1}. ${comp.name}`);
      console.log(`     作者: ${comp.author}`);
      console.log(`     复杂度: ${complexity}`);
      console.log(`     包大小: ${bundleSize} bytes`);
      console.log(`     标签: ${comp.tags.slice(0, 3).join(', ')}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ 按分类列出组件失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试3: 按作者列出组件
  console.log('👤 测试3: 列出特定作者的组件');
  try {
    const authorResult = await server.listAvailableComponents({
      author: 'cssbuttons-io',
      sort_by: 'name',
      include_stats: false,
      limit: 8
    });
    
    console.log(`✅ cssbuttons-io 共有 ${authorResult.total} 个组件`);
    console.log('组件列表:');
    authorResult.components.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} (${comp.category})`);
    });
  } catch (error) {
    console.error('❌ 按作者列出组件失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试4: 获取组件详细信息
  console.log('🔍 测试4: 获取组件详细信息');
  try {
    const detailResult = await server.getComponentDetails({
      component_id: 'cssbuttons-io_brown-otter-21',
      include_code: true,
      include_usage: true
    });
    
    console.log(`✅ 组件详情: ${detailResult.name}`);
    console.log(`  ID: ${detailResult.id}`);
    console.log(`  作者: ${detailResult.author}`);
    console.log(`  分类: ${detailResult.category}`);
    console.log(`  描述: ${detailResult.description}`);
    console.log(`  标签: ${detailResult.tags.join(', ')}`);
    
    console.log(`\n  平台支持:`);
    Object.entries(detailResult.platforms).forEach(([platform, supported]) => {
      const status = supported ? '✅' : '❌';
      console.log(`    ${status} ${platform}`);
    });
    
    console.log(`\n  性能信息:`);
    const perf = detailResult.performance;
    console.log(`    复杂度: ${perf.complexity}`);
    console.log(`    包大小: ${perf.bundle_size} bytes`);
    console.log(`    渲染成本: ${perf.render_cost}`);
    
    console.log(`\n  Props (${detailResult.props.length}个):`);
    detailResult.props.forEach(prop => {
      console.log(`    - ${prop.name}: ${prop.type} (默认: ${prop.default})`);
    });
    
    console.log(`\n  Events (${detailResult.events.length}个):`);
    detailResult.events.forEach(event => {
      console.log(`    - ${event.name}: ${event.description}`);
    });
    
    if (detailResult.include_code) {
      console.log(`\n  原始HTML长度: ${detailResult.original_code?.html?.length || 0} 字符`);
      console.log(`  原始CSS长度: ${detailResult.original_code?.css?.length || 0} 字符`);
      console.log(`  UniApp模板长度: ${detailResult.uniapp_code?.template?.length || 0} 字符`);
    }
    
  } catch (error) {
    console.error('❌ 获取组件详情失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 测试5: 列出加载器组件
  console.log('⏳ 测试5: 列出加载器组件 (按创建时间排序)');
  try {
    const loaderResult = await server.listAvailableComponents({
      category: 'loaders',
      sort_by: 'created_at',
      sort_order: 'desc',
      include_preview: true,
      limit: 5
    });
    
    console.log(`✅ 找到 ${loaderResult.total} 个加载器组件`);
    console.log('最新的5个加载器:');
    loaderResult.components.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} by ${comp.author}`);
      console.log(`     创建时间: ${comp.created_at || '未知'}`);
      console.log(`     预览: ${comp.preview_url || '无'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ 列出加载器组件失败:', error.message);
  }
  
  console.log('\n🎉 新工具测试完成！');
  
  // 显示工具使用总结
  console.log('\n📝 新增工具总结:');
  console.log('1. list_available_components - 列出和统计所有组件');
  console.log('2. get_component_details - 获取组件详细信息');
  console.log('\n💡 这些工具让您可以:');
  console.log('- 📊 查看组件库的整体统计信息');
  console.log('- 🔍 按多种条件筛选和排序组件');
  console.log('- 📋 获取组件的完整详细信息');
  console.log('- 👥 了解热门作者和标签');
  console.log('- 📈 分析组件的性能和兼容性');
}

// 运行测试
if (require.main === module) {
  testNewTools().catch(console.error);
}
