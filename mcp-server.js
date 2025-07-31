#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Galaxy UniApp MCP服务器
 * 提供Galaxy组件库到UniApp组件的转换和查询服务
 */
class GalaxyUniAppMCPServer {
  constructor() {
    this.dataPath = path.join(__dirname, 'data');
    this.componentIndex = this.loadComponentIndex();
    this.authors = this.loadAuthors();
    this.tags = this.loadTags();
    this.conversionRules = this.loadConversionRules();
  }

  /**
   * 加载组件索引
   */
  loadComponentIndex() {
    try {
      const indexPath = path.join(this.dataPath, 'metadata/component-index.json');
      return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (error) {
      console.error('加载组件索引失败:', error.message);
      return { total: 0, categories: {}, components: [] };
    }
  }

  /**
   * 加载作者信息
   */
  loadAuthors() {
    try {
      const authorsPath = path.join(this.dataPath, 'metadata/authors.json');
      return JSON.parse(fs.readFileSync(authorsPath, 'utf8'));
    } catch (error) {
      console.error('加载作者信息失败:', error.message);
      return { total: 0, authors: [] };
    }
  }

  /**
   * 加载标签信息
   */
  loadTags() {
    try {
      const tagsPath = path.join(this.dataPath, 'metadata/tags.json');
      return JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
    } catch (error) {
      console.error('加载标签信息失败:', error.message);
      return { total: 0, tags: [] };
    }
  }

  /**
   * 加载转换规则
   */
  loadConversionRules() {
    try {
      const rulesPath = path.join(this.dataPath, 'templates/conversion-rules.json');
      return JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    } catch (error) {
      console.error('加载转换规则失败:', error.message);
      return {};
    }
  }

  /**
   * 加载单个组件数据
   */
  loadComponent(componentId) {
    try {
      // 查找组件文件路径
      const component = this.componentIndex.components.find(c => c.id === componentId);
      if (!component) {
        throw new Error(`组件 ${componentId} 不存在`);
      }

      const componentData = JSON.parse(fs.readFileSync(component.file_path, 'utf8'));
      return componentData;
    } catch (error) {
      console.error(`加载组件 ${componentId} 失败:`, error.message);
      return null;
    }
  }

  /**
   * MCP工具: 分析UniApp平台兼容性
   */
  async analyzeUniappCompatibility(params) {
    const { component_id, target_platforms = ['H5', 'MP-WEIXIN', 'MP-ALIPAY', 'APP-PLUS'], check_performance = true } = params;

    const component = this.loadComponent(component_id);
    if (!component) {
      return {
        error: `组件 ${component_id} 不存在`
      };
    }

    const result = {
      component_id,
      component_name: component.name,
      target_platforms,
      compatibility: {},
      performance_analysis: null,
      recommendations: []
    };

    // 分析每个平台的兼容性
    target_platforms.forEach(platform => {
      const platformKey = platform.toLowerCase().replace('-', '_');
      const compatibility = component.compatibility[platformKey] || {
        supported: true,
        issues: [],
        alternatives: []
      };

      result.compatibility[platform] = {
        supported: compatibility.supported,
        issues: compatibility.issues || [],
        alternatives: compatibility.alternatives || [],
        confidence: this.calculateCompatibilityConfidence(compatibility)
      };
    });

    // 性能分析
    if (check_performance && component.performance) {
      result.performance_analysis = {
        complexity: component.performance.complexity,
        bundle_size: component.performance.bundle_size,
        render_cost: component.performance.render_cost,
        memory_usage: component.performance.memory_usage,
        optimization_suggestions: this.generateOptimizationSuggestions(component)
      };
    }

    // 生成建议
    result.recommendations = this.generateCompatibilityRecommendations(component, target_platforms);

    return result;
  }

  /**
   * MCP工具: 转换为UniApp组件
   */
  async convertToUniappComponent(params) {
    const {
      component_id,
      target_platforms = ['H5', 'MP-WEIXIN', 'MP-ALIPAY', 'APP-PLUS'],
      design_width = 750,
      enable_conditions = true,
      optimize_for_mp = true,
      component_name,
      props_config = {}
    } = params;

    const component = this.loadComponent(component_id);
    if (!component) {
      return {
        error: `组件 ${component_id} 不存在`
      };
    }

    const result = {
      component_id,
      original_name: component.name,
      converted_name: component_name || component.uniapp.component_name,
      target_platforms,
      uniapp_component: {
        template: component.uniapp.template,
        script: this.enhanceVueScript(component, props_config),
        style: this.optimizeStyleForPlatforms(component.uniapp.style, target_platforms, enable_conditions),
        component_name: component_name || component.uniapp.component_name
      },
      usage_example: this.generateUsageExample(component, component_name),
      integration_guide: this.generateIntegrationGuide(component, target_platforms),
      performance_tips: optimize_for_mp ? this.generatePerformanceTips(component) : []
    };

    return result;
  }

  /**
   * MCP工具: 搜索UniApp组件
   */
  async searchUniappComponents(params) {
    const {
      query = '',
      category,
      author,
      tags = [],
      platforms = [],
      complexity,
      limit = 10,
      offset = 0
    } = params;

    let filteredComponents = [...this.componentIndex.components];

    // 按查询词过滤
    if (query) {
      const queryLower = query.toLowerCase();
      filteredComponents = filteredComponents.filter(comp =>
        comp.name.toLowerCase().includes(queryLower) ||
        comp.id.toLowerCase().includes(queryLower) ||
        comp.author.toLowerCase().includes(queryLower)
      );
    }

    // 按分类过滤
    if (category) {
      filteredComponents = filteredComponents.filter(comp => comp.category === category);
    }

    // 按作者过滤
    if (author) {
      filteredComponents = filteredComponents.filter(comp => comp.author === author);
    }

    // 加载详细信息并进一步过滤
    const detailedComponents = filteredComponents.map(comp => {
      const detail = this.loadComponent(comp.id);
      return detail ? { ...comp, ...detail } : comp;
    }).filter(Boolean);

    // 按标签过滤
    if (tags.length > 0) {
      filteredComponents = detailedComponents.filter(comp =>
        tags.some(tag => comp.tags && comp.tags.includes(tag))
      );
    }

    // 按平台过滤
    if (platforms.length > 0) {
      filteredComponents = detailedComponents.filter(comp => {
        if (!comp.platforms) return true;
        return platforms.every(platform => {
          const platformKey = platform.toLowerCase().replace('-', '_');
          return comp.platforms[platformKey] !== false;
        });
      });
    }

    // 按复杂度过滤
    if (complexity) {
      filteredComponents = detailedComponents.filter(comp =>
        comp.performance && comp.performance.complexity === complexity
      );
    }

    // 分页
    const total = filteredComponents.length;
    const paginatedComponents = filteredComponents.slice(offset, offset + limit);

    return {
      total,
      limit,
      offset,
      components: paginatedComponents.map(comp => ({
        id: comp.id,
        name: comp.name,
        category: comp.category,
        author: comp.author,
        description: comp.description,
        tags: comp.tags || [],
        platforms: comp.platforms || {},
        performance: comp.performance || {},
        preview_url: this.generatePreviewUrl(comp.id)
      }))
    };
  }

  /**
   * MCP工具: 列出可用组件
   */
  async listAvailableComponents(params) {
    const {
      category,
      author,
      sort_by = 'name', // name, author, category, created_at, complexity
      sort_order = 'asc', // asc, desc
      include_stats = true,
      include_preview = false,
      limit = 50,
      offset = 0
    } = params;

    let components = [...this.componentIndex.components];

    // 过滤
    if (category) {
      components = components.filter(comp => comp.category === category);
    }
    if (author) {
      components = components.filter(comp => comp.author === author);
    }

    // 加载详细信息
    const detailedComponents = components.map(comp => {
      const detail = this.loadComponent(comp.id);
      return detail ? { ...comp, ...detail } : comp;
    }).filter(Boolean);

    // 排序
    detailedComponents.sort((a, b) => {
      let aValue, bValue;

      switch (sort_by) {
        case 'author':
          aValue = a.author || '';
          bValue = b.author || '';
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'complexity':
          const complexityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
          aValue = complexityOrder[a.performance?.complexity] || 0;
          bValue = complexityOrder[b.performance?.complexity] || 0;
          break;
        default: // name
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (sort_order === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // 分页
    const total = detailedComponents.length;
    const paginatedComponents = detailedComponents.slice(offset, offset + limit);

    const result = {
      total,
      limit,
      offset,
      components: paginatedComponents.map(comp => ({
        id: comp.id,
        name: comp.name,
        category: comp.category,
        author: comp.author,
        description: comp.description,
        tags: comp.tags || [],
        platforms: comp.platforms || {},
        performance: comp.performance || {},
        created_at: comp.created_at,
        updated_at: comp.updated_at,
        preview_url: include_preview ? this.generatePreviewUrl(comp.id) : undefined
      }))
    };

    // 添加统计信息
    if (include_stats) {
      result.statistics = this.generateComponentStatistics(detailedComponents);
    }

    return result;
  }

  /**
   * MCP工具: 获取组件详细信息
   */
  async getComponentDetails(params) {
    const { component_id, include_code = false, include_usage = true } = params;

    const component = this.loadComponent(component_id);
    if (!component) {
      return {
        error: `组件 ${component_id} 不存在`
      };
    }

    const result = {
      id: component.id,
      name: component.name,
      category: component.category,
      author: component.author,
      description: component.description,
      tags: component.tags || [],
      platforms: component.platforms || {},
      compatibility: component.compatibility || {},
      performance: component.performance || {},
      props: component.props || [],
      events: component.events || [],
      slots: component.slots || [],
      created_at: component.created_at,
      updated_at: component.updated_at,
      preview_url: this.generatePreviewUrl(component.id)
    };

    // 包含代码
    if (include_code) {
      result.original_code = component.original;
      result.uniapp_code = component.uniapp;
    }

    // 包含使用示例
    if (include_usage) {
      result.usage_example = this.generateUsageExample(component);
      result.integration_guide = this.generateIntegrationGuide(component, ['H5', 'MP-WEIXIN', 'APP-PLUS']);
    }

    return result;
  }

  /**
   * MCP工具: 生成UniApp项目集成代码
   */
  async generateUniappProjectIntegration(params) {
    const {
      components = [],
      project_structure = {},
      global_styles = false,
      auto_import = true
    } = params;

    const result = {
      components_count: components.length,
      integration_files: {},
      configuration: {},
      usage_examples: {},
      installation_guide: []
    };

    // 生成pages.json配置
    if (auto_import) {
      result.configuration['pages.json'] = this.generatePagesJsonConfig(components);
    }

    // 生成main.js配置
    result.configuration['main.js'] = this.generateMainJsConfig(components, auto_import);

    // 生成全局样式
    if (global_styles) {
      result.configuration['App.vue'] = this.generateGlobalStyles(components);
    }

    // 生成组件文件
    components.forEach(componentId => {
      const component = this.loadComponent(componentId);
      if (component) {
        const fileName = `${component.uniapp.component_name}.vue`;
        result.integration_files[fileName] = this.generateCompleteVueComponent(component);
        result.usage_examples[componentId] = this.generateUsageExample(component);
      }
    });

    // 生成安装指南
    result.installation_guide = this.generateInstallationGuide(components);

    return result;
  }

  /**
   * 计算兼容性置信度
   */
  calculateCompatibilityConfidence(compatibility) {
    if (!compatibility.supported) return 0;
    const issueCount = compatibility.issues ? compatibility.issues.length : 0;
    return Math.max(0, 100 - issueCount * 20);
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions(component) {
    const suggestions = [];
    
    if (component.performance.complexity === 'high') {
      suggestions.push('考虑简化动画效果以提升性能');
      suggestions.push('使用条件编译为不同平台提供不同的实现');
    }
    
    if (component.performance.bundle_size > 1000) {
      suggestions.push('考虑拆分为多个小组件');
      suggestions.push('移除不必要的CSS规则');
    }

    return suggestions;
  }

  /**
   * 生成兼容性建议
   */
  generateCompatibilityRecommendations(component, platforms) {
    const recommendations = [];
    
    platforms.forEach(platform => {
      const platformKey = platform.toLowerCase().replace('-', '_');
      const compatibility = component.compatibility[platformKey];
      
      if (compatibility && compatibility.issues.length > 0) {
        recommendations.push({
          platform,
          type: 'warning',
          message: `${platform}平台存在兼容性问题`,
          details: compatibility.issues,
          solutions: compatibility.alternatives
        });
      }
    });

    return recommendations;
  }

  /**
   * 增强Vue脚本
   */
  enhanceVueScript(component, propsConfig) {
    const props = Array.isArray(component.props) ? component.props : [];
    const events = Array.isArray(component.events) ? component.events : [];

    const propsCode = props.length > 0 ? props.map(prop => `    ${prop.name}: {
      type: ${prop.type},
      default: ${JSON.stringify(prop.default)},
      required: ${prop.required}
    }`).join(',\n') : '    // 无props定义';

    const methodsCode = events.length > 0 ? events.map(event => `    handle${event.name.charAt(0).toUpperCase() + event.name.slice(1)}(e) {
      this.$emit('${event.name}', e);
    }`).join(',\n') : '    // 无事件处理方法';

    return `export default {
  name: '${component.uniapp.component_name}',
  props: {
${propsCode}
  },
  data() {
    return {
      isPressed: false,
      isLoading: false
    };
  },
  methods: {
${methodsCode}
  }
}`;
  }

  /**
   * 优化样式为多平台
   */
  optimizeStyleForPlatforms(style, platforms, enableConditions) {
    if (!enableConditions) return style;
    
    let optimizedStyle = style;
    
    // 为小程序平台添加特殊处理
    if (platforms.includes('MP-WEIXIN') || platforms.includes('MP-ALIPAY')) {
      optimizedStyle = optimizedStyle.replace(
        /box-shadow:[^;]+;/gi,
        '/* #ifdef H5 */\n  $&\n  /* #endif */\n  /* #ifdef MP */\n  border: 1rpx solid rgba(0,0,0,0.1);\n  /* #endif */'
      );
    }
    
    return optimizedStyle;
  }

  /**
   * 生成使用示例
   */
  generateUsageExample(component, customName) {
    const componentName = customName || component.uniapp.component_name;
    const kebabName = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    
    const props = component.props || [];
    const propsExample = props.slice(0, 3).map(prop => 
      `  ${prop.name}="${prop.default}"`
    ).join('\n');
    
    return `<template>
  <view class="page">
    <${kebabName}
${propsExample}
      @click="handleClick"
    />
  </view>
</template>

<script>
export default {
  methods: {
    handleClick(e) {
      console.log('组件被点击', e);
    }
  }
}
</script>`;
  }

  /**
   * 生成集成指南
   */
  generateIntegrationGuide(component, platforms) {
    return {
      steps: [
        '1. 将组件文件复制到 components 目录',
        '2. 在 pages.json 中配置 easycom 自动导入',
        '3. 在页面中直接使用组件',
        '4. 根据需要自定义组件属性'
      ],
      platforms: platforms.map(platform => ({
        name: platform,
        notes: this.getPlatformNotes(platform, component)
      })),
      dependencies: component.dependencies || []
    };
  }

  /**
   * 获取平台注意事项
   */
  getPlatformNotes(platform, component) {
    const notes = [];
    const platformKey = platform.toLowerCase().replace('-', '_');
    const compatibility = component.compatibility[platformKey];
    
    if (compatibility && compatibility.issues.length > 0) {
      notes.push(...compatibility.issues);
    }
    
    return notes;
  }

  /**
   * 生成性能提示
   */
  generatePerformanceTips(component) {
    const tips = [];
    
    if (component.performance.complexity === 'high') {
      tips.push('建议在小程序中减少动画复杂度');
      tips.push('考虑使用 transform 替代 position 变化');
    }
    
    tips.push('使用 v-if 而不是 v-show 来条件渲染');
    tips.push('避免在模板中使用复杂的表达式');
    
    return tips;
  }

  /**
   * 生成预览URL
   */
  generatePreviewUrl(componentId) {
    return `https://uiverse.io/preview/${componentId}`;
  }

  /**
   * 生成pages.json配置
   */
  generatePagesJsonConfig(components) {
    const easycomRules = {};
    
    components.forEach(componentId => {
      const component = this.loadComponent(componentId);
      if (component) {
        const kebabName = component.uniapp.component_name
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');
        easycomRules[`^${kebabName}$`] = `@/components/${kebabName}/${kebabName}.vue`;
      }
    });

    return {
      easycom: {
        autoscan: true,
        custom: easycomRules
      }
    };
  }

  /**
   * 生成main.js配置
   */
  generateMainJsConfig(components, autoImport) {
    if (autoImport) {
      return '// 使用 easycom 自动导入，无需手动注册组件';
    }
    
    const imports = [];
    const registrations = [];
    
    components.forEach(componentId => {
      const component = this.loadComponent(componentId);
      if (component) {
        const componentName = component.uniapp.component_name;
        const kebabName = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        imports.push(`import ${componentName} from '@/components/${kebabName}/${kebabName}.vue'`);
        registrations.push(`Vue.component('${kebabName}', ${componentName})`);
      }
    });

    return `${imports.join('\n')}

// 全局注册组件
${registrations.join('\n')}`;
  }

  /**
   * 生成全局样式
   */
  generateGlobalStyles(components) {
    return `<style>
/* Galaxy组件库全局样式 */
.galaxy-component {
  box-sizing: border-box;
}

/* 通用动画 */
.galaxy-transition {
  transition: all 0.3s ease;
}

/* 响应式工具类 */
.galaxy-flex {
  display: flex;
}

.galaxy-center {
  align-items: center;
  justify-content: center;
}
</style>`;
  }

  /**
   * 生成完整的Vue组件
   */
  generateCompleteVueComponent(component) {
    return `<template>
${component.uniapp.template}
</template>

<script>
${this.enhanceVueScript(component, {})}
</script>

<style scoped>
${component.uniapp.style}
</style>`;
  }

  /**
   * 生成安装指南
   */
  generateInstallationGuide(components) {
    return [
      '1. 创建 components 目录（如果不存在）',
      '2. 将组件文件复制到对应的子目录中',
      '3. 在 pages.json 中配置 easycom 规则',
      '4. 重启开发服务器',
      '5. 在页面中直接使用组件标签',
      `6. 总共集成了 ${components.length} 个组件`
    ];
  }

  /**
   * 生成组件统计信息
   */
  generateComponentStatistics(components) {
    const stats = {
      total_components: components.length,
      categories: {},
      authors: {},
      tags: {},
      complexity_distribution: {
        low: 0,
        medium: 0,
        high: 0,
        unknown: 0
      },
      platform_support: {
        h5: 0,
        mp_weixin: 0,
        mp_alipay: 0,
        mp_baidu: 0,
        mp_toutiao: 0,
        app_plus: 0
      },
      performance_metrics: {
        avg_bundle_size: 0,
        total_bundle_size: 0,
        min_bundle_size: Infinity,
        max_bundle_size: 0
      },
      top_authors: [],
      popular_tags: [],
      recent_components: []
    };

    let totalBundleSize = 0;
    let bundleSizeCount = 0;

    components.forEach(comp => {
      // 分类统计
      stats.categories[comp.category] = (stats.categories[comp.category] || 0) + 1;

      // 作者统计
      stats.authors[comp.author] = (stats.authors[comp.author] || 0) + 1;

      // 标签统计
      if (comp.tags) {
        comp.tags.forEach(tag => {
          stats.tags[tag] = (stats.tags[tag] || 0) + 1;
        });
      }

      // 复杂度统计
      const complexity = comp.performance?.complexity || 'unknown';
      stats.complexity_distribution[complexity]++;

      // 平台支持统计
      if (comp.platforms) {
        Object.entries(comp.platforms).forEach(([platform, supported]) => {
          if (supported) {
            const platformKey = platform.replace('-', '_');
            if (stats.platform_support.hasOwnProperty(platformKey)) {
              stats.platform_support[platformKey]++;
            }
          }
        });
      }

      // 性能指标统计
      if (comp.performance?.bundle_size) {
        const bundleSize = comp.performance.bundle_size;
        totalBundleSize += bundleSize;
        bundleSizeCount++;
        stats.performance_metrics.min_bundle_size = Math.min(stats.performance_metrics.min_bundle_size, bundleSize);
        stats.performance_metrics.max_bundle_size = Math.max(stats.performance_metrics.max_bundle_size, bundleSize);
      }
    });

    // 计算平均包大小
    if (bundleSizeCount > 0) {
      stats.performance_metrics.avg_bundle_size = Math.round(totalBundleSize / bundleSizeCount);
      stats.performance_metrics.total_bundle_size = totalBundleSize;
    }

    if (stats.performance_metrics.min_bundle_size === Infinity) {
      stats.performance_metrics.min_bundle_size = 0;
    }

    // 热门作者 (前10)
    stats.top_authors = Object.entries(stats.authors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([author, count]) => ({ author, count }));

    // 热门标签 (前15)
    stats.popular_tags = Object.entries(stats.tags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count }));

    // 最近组件 (前5)
    stats.recent_components = components
      .filter(comp => comp.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(comp => ({
        id: comp.id,
        name: comp.name,
        author: comp.author,
        created_at: comp.created_at
      }));

    return stats;
  }
}

// MCP服务器主函数
async function main() {
  const server = new GalaxyUniAppMCPServer();
  
  // 模拟MCP协议处理
  process.stdin.on('data', async (data) => {
    try {
      const request = JSON.parse(data.toString());
      let response;
      
      switch (request.method) {
        case 'analyze_uniapp_compatibility':
          response = await server.analyzeUniappCompatibility(request.params);
          break;
        case 'convert_to_uniapp_component':
          response = await server.convertToUniappComponent(request.params);
          break;
        case 'search_uniapp_components':
          response = await server.searchUniappComponents(request.params);
          break;
        case 'generate_uniapp_project_integration':
          response = await server.generateUniappProjectIntegration(request.params);
          break;
        case 'list_available_components':
          response = await server.listAvailableComponents(request.params);
          break;
        case 'get_component_details':
          response = await server.getComponentDetails(request.params);
          break;
        default:
          response = { error: `未知方法: ${request.method}` };
      }
      
      console.log(JSON.stringify({
        id: request.id,
        result: response
      }));
    } catch (error) {
      console.error('处理请求失败:', error.message);
    }
  });
  
  console.log('Galaxy UniApp MCP服务器已启动');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = GalaxyUniAppMCPServer;
