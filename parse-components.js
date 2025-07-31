#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Galaxy组件解析器 - 将组件转换为UniApp格式
 */
class GalaxyComponentParser {
  constructor() {
    this.conversionRules = this.loadConversionRules();
    this.componentTemplate = this.loadComponentTemplate();
    this.components = [];
    this.authors = new Set();
    this.tags = new Set();
  }

  /**
   * 加载转换规则
   */
  loadConversionRules() {
    const rulesPath = path.join(__dirname, 'data/templates/conversion-rules.json');
    return JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  }

  /**
   * 加载组件模板
   */
  loadComponentTemplate() {
    const templatePath = path.join(__dirname, 'data/templates/uniapp-component.json');
    return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  }

  /**
   * 解析单个组件文件
   */
  parseComponent(filePath, category) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, '.html');
      
      // 解析文件名获取作者和组件信息
      const [author, ...nameParts] = fileName.split('_');
      const componentName = nameParts.join('_');
      
      // 使用JSDOM解析HTML
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      // 提取HTML和CSS
      const styleElement = document.querySelector('style');
      const css = styleElement ? styleElement.textContent : '';
      
      // 移除style标签后获取HTML
      if (styleElement) {
        styleElement.remove();
      }
      const html = document.body.innerHTML;
      
      // 提取标签信息
      const tags = this.extractTags(css, html);
      
      // 创建组件数据
      const component = this.createComponentData({
        id: fileName,
        name: this.formatComponentName(componentName),
        category,
        author,
        html,
        css,
        filePath,
        tags
      });
      
      this.authors.add(author);
      tags.forEach(tag => this.tags.add(tag));
      
      return component;
    } catch (error) {
      console.error(`解析组件失败: ${filePath}`, error.message);
      return null;
    }
  }

  /**
   * 创建组件数据
   */
  createComponentData({ id, name, category, author, html, css, filePath, tags }) {
    const component = JSON.parse(JSON.stringify(this.componentTemplate));
    
    component.id = id;
    component.name = name;
    component.category = category;
    component.author = author;
    component.description = this.generateDescription(name, tags);
    component.tags = tags;
    
    // 原始代码
    component.original = {
      html: html.trim(),
      css: css.trim(),
      file_path: filePath
    };
    
    // 转换为UniApp格式
    component.uniapp = this.convertToUniApp(html, css, name);
    
    // 分析平台兼容性
    component.compatibility = this.analyzeCompatibility(css, html);
    
    // 性能分析
    component.performance = this.analyzePerformance(css, html);
    
    // 生成Props和Events
    component.props = this.generateProps(name, category);
    component.events = this.generateEvents(category);
    
    // 时间戳
    const now = new Date().toISOString();
    component.created_at = now;
    component.updated_at = now;
    
    return component;
  }

  /**
   * 转换为UniApp格式
   */
  convertToUniApp(html, css, componentName) {
    const template = this.convertHtmlToTemplate(html);
    const script = this.generateVueScript(componentName);
    const style = this.convertCssToUniApp(css);
    
    return {
      template,
      script,
      style,
      component_name: this.formatComponentName(componentName, true)
    };
  }

  /**
   * 转换HTML为UniApp模板
   */
  convertHtmlToTemplate(html) {
    let template = html;

    // 转换HTML标签
    Object.entries(this.conversionRules.html_tag_mapping).forEach(([htmlTag, uniTag]) => {
      const regex = new RegExp(`<${htmlTag}(\\s[^>]*)?>(.*?)</${htmlTag}>`, 'gi');
      template = template.replace(regex, `<${uniTag}$1>$2</${uniTag}>`);

      // 处理自闭合标签
      const selfClosingRegex = new RegExp(`<${htmlTag}(\\s[^>]*)?/?>`, 'gi');
      template = template.replace(selfClosingRegex, `<${uniTag}$1></${uniTag}>`);
    });

    // 转换事件
    Object.entries(this.conversionRules.event_mapping).forEach(([htmlEvent, uniEvent]) => {
      const regex = new RegExp(`@${htmlEvent}`, 'gi');
      template = template.replace(regex, `@${uniEvent}`);

      // 转换onclick等内联事件
      const onEventRegex = new RegExp(`on${htmlEvent}`, 'gi');
      template = template.replace(onEventRegex, `@${uniEvent}`);
    });

    // 修复常见的HTML结构问题
    template = template.replace(/<a\s+/gi, '<navigator ');
    template = template.replace(/<\/a>/gi, '</navigator>');

    return template.trim();
  }

  /**
   * 生成Vue脚本
   */
  generateVueScript(componentName) {
    const formattedName = this.formatComponentName(componentName, true);
    
    return `export default {
  name: '${formattedName}',
  props: {
    // 根据组件类型动态生成props
  },
  data() {
    return {
      // 组件状态
    };
  },
  methods: {
    // 组件方法
  }
}`;
  }

  /**
   * 转换CSS为UniApp样式
   */
  convertCssToUniApp(css) {
    let uniappCss = css;
    
    // 转换单位
    uniappCss = this.convertCssUnits(uniappCss);
    
    // 处理不兼容的CSS属性
    uniappCss = this.handleIncompatibleCss(uniappCss);
    
    // 添加平台条件编译
    uniappCss = this.addPlatformConditions(uniappCss);
    
    return uniappCss;
  }

  /**
   * 转换CSS单位
   */
  convertCssUnits(css) {
    const { px_to_rpx_ratio } = this.conversionRules.css_unit_conversion;
    
    // 转换px为rpx
    return css.replace(/(\d+(?:\.\d+)?)px/g, (match, value) => {
      const rpxValue = parseFloat(value) * px_to_rpx_ratio;
      return `${rpxValue}rpx`;
    });
  }

  /**
   * 处理不兼容的CSS属性
   */
  handleIncompatibleCss(css) {
    const { unsupported, alternatives } = this.conversionRules.css_property_compatibility;
    
    let processedCss = css;
    
    // 移除不支持的属性或添加条件编译
    unsupported.forEach(property => {
      if (alternatives[property]) {
        // 添加条件编译注释
        const regex = new RegExp(`(${property}:[^;]+;)`, 'gi');
        processedCss = processedCss.replace(regex, `/* #ifdef H5 */\n  $1\n  /* #endif */`);
      } else {
        // 直接移除
        const regex = new RegExp(`${property}:[^;]+;`, 'gi');
        processedCss = processedCss.replace(regex, '');
      }
    });
    
    return processedCss;
  }

  /**
   * 添加平台条件编译
   */
  addPlatformConditions(css) {
    // 为特定CSS属性添加平台条件
    let conditionedCss = css;
    
    // box-shadow 处理
    if (css.includes('box-shadow')) {
      conditionedCss = conditionedCss.replace(
        /(box-shadow:[^;]+;)/gi,
        '/* #ifdef H5 */\n  $1\n  /* #endif */\n  /* #ifdef MP */\n  border: 1rpx solid rgba(0,0,0,0.1);\n  /* #endif */'
      );
    }
    
    return conditionedCss;
  }

  /**
   * 提取标签
   */
  extractTags(css, html) {
    const tags = [];
    
    // 从CSS注释中提取标签
    const commentMatch = css.match(/\/\*.*?Tags?:\s*([^*]+)\*\//i);
    if (commentMatch) {
      const extractedTags = commentMatch[1].split(',').map(tag => tag.trim());
      tags.push(...extractedTags);
    }
    
    // 根据CSS特征推断标签
    if (css.includes('animation') || css.includes('transform')) {
      tags.push('animation');
    }
    if (css.includes('gradient')) {
      tags.push('gradient');
    }
    if (css.includes('hover')) {
      tags.push('interactive');
    }
    
    return [...new Set(tags)];
  }

  /**
   * 分析平台兼容性
   */
  analyzeCompatibility(css, html) {
    const compatibility = {
      h5: { supported: true, issues: [], alternatives: [] },
      'mp-weixin': { supported: true, issues: [], alternatives: [] },
      'mp-alipay': { supported: true, issues: [], alternatives: [] },
      'app-plus': { supported: true, issues: [], alternatives: [] }
    };
    
    // 检查不兼容的CSS属性
    const { unsupported } = this.conversionRules.css_property_compatibility;
    unsupported.forEach(property => {
      if (css.includes(property)) {
        compatibility['mp-weixin'].issues.push(`不支持 ${property} 属性`);
        compatibility['mp-alipay'].issues.push(`不支持 ${property} 属性`);
      }
    });
    
    return compatibility;
  }

  /**
   * 性能分析
   */
  analyzePerformance(css, html) {
    let complexity = 'low';
    let bundleSize = css.length + html.length;
    
    // 根据CSS复杂度判断
    if (css.includes('animation') || css.includes('transform')) {
      complexity = 'medium';
    }
    if (css.split('\n').length > 100) {
      complexity = 'high';
    }
    
    return {
      complexity,
      bundle_size: bundleSize,
      render_cost: complexity,
      memory_usage: complexity
    };
  }

  /**
   * 生成Props
   */
  generateProps(name, category) {
    const commonProps = [
      {
        name: 'disabled',
        type: 'Boolean',
        default: false,
        required: false,
        description: '是否禁用'
      }
    ];
    
    if (category === 'buttons') {
      commonProps.push(
        {
          name: 'text',
          type: 'String',
          default: '按钮',
          required: false,
          description: '按钮文字'
        },
        {
          name: 'type',
          type: 'String',
          default: 'primary',
          required: false,
          description: '按钮类型'
        }
      );
    }
    
    return commonProps;
  }

  /**
   * 生成Events
   */
  generateEvents(category) {
    const commonEvents = [];
    
    if (category === 'buttons') {
      commonEvents.push({
        name: 'click',
        description: '点击事件',
        parameters: ['event']
      });
    }
    
    return commonEvents;
  }

  /**
   * 格式化组件名称
   */
  formatComponentName(name, pascalCase = false) {
    const cleaned = name.replace(/[^a-zA-Z0-9-]/g, '-');
    const parts = cleaned.split('-').filter(part => part.length > 0);
    
    if (pascalCase) {
      return 'Galaxy' + parts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join('');
    }
    
    return parts.join('-').toLowerCase();
  }

  /**
   * 生成描述
   */
  generateDescription(name, tags) {
    const tagStr = tags.length > 0 ? ` (${tags.join(', ')})` : '';
    return `${name} 组件${tagStr}`;
  }

  /**
   * 解析所有组件
   */
  async parseAllComponents() {
    const categories = ['Buttons', 'Tooltips', 'loaders'];
    
    for (const category of categories) {
      const categoryPath = path.join(__dirname, category);
      if (!fs.existsSync(categoryPath)) {
        console.warn(`目录不存在: ${categoryPath}`);
        continue;
      }
      
      const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.html'));
      console.log(`解析 ${category} 类别，共 ${files.length} 个组件...`);
      
      // 创建输出目录
      const outputDir = path.join(__dirname, 'data/components', category.toLowerCase());
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const component = this.parseComponent(filePath, category.toLowerCase());
        
        if (component) {
          // 保存组件数据
          const outputPath = path.join(outputDir, `${component.id}.json`);
          fs.writeFileSync(outputPath, JSON.stringify(component, null, 2));
          
          this.components.push({
            id: component.id,
            name: component.name,
            category: component.category,
            author: component.author,
            file_path: outputPath
          });
        }
      }
    }
    
    // 保存索引和元数据
    this.saveMetadata();
    
    console.log(`解析完成！共处理 ${this.components.length} 个组件`);
  }

  /**
   * 保存元数据
   */
  saveMetadata() {
    const metadataDir = path.join(__dirname, 'data/metadata');
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }
    
    // 组件索引
    fs.writeFileSync(
      path.join(metadataDir, 'component-index.json'),
      JSON.stringify({
        total: this.components.length,
        categories: this.getCategoryCounts(),
        components: this.components
      }, null, 2)
    );
    
    // 作者信息
    fs.writeFileSync(
      path.join(metadataDir, 'authors.json'),
      JSON.stringify({
        total: this.authors.size,
        authors: Array.from(this.authors).sort()
      }, null, 2)
    );
    
    // 标签信息
    fs.writeFileSync(
      path.join(metadataDir, 'tags.json'),
      JSON.stringify({
        total: this.tags.size,
        tags: Array.from(this.tags).sort()
      }, null, 2)
    );
  }

  /**
   * 获取分类统计
   */
  getCategoryCounts() {
    const counts = {};
    this.components.forEach(comp => {
      counts[comp.category] = (counts[comp.category] || 0) + 1;
    });
    return counts;
  }
}

// 运行解析器
if (require.main === module) {
  const parser = new GalaxyComponentParser();
  parser.parseAllComponents().catch(console.error);
}

module.exports = GalaxyComponentParser;
