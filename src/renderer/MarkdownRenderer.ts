import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

/**
 * Markdown 渲染器配置选项
 */
export interface RendererOptions {
  breaks: boolean;
  gfm: boolean;
  highlight: (code: string, lang: string) => string;
}

/**
 * 生成标题的 id（用于锚点跳转）
 * 与 Sidebar.tsx 中的逻辑保持一致
 */
export function generateHeadingId(text: string, index: number): string {
  const baseId = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${baseId}-${index}`;
}

/**
 * 为 HTML 中的标题添加 id 属性
 */
function addHeadingIds(html: string): string {
  let index = 0;
  return html.replace(/<h([1-6])>([^<]*)<\/h\1>/g, (_match, level, text) => {
    const id = generateHeadingId(text, index);
    index++;
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
}

/**
 * Markdown 渲染器类
 * 负责将 Markdown 内容转换为安全的 HTML
 */
export class MarkdownRenderer {
  private options: RendererOptions;
  private renderCache: Map<string, string> = new Map();
  private readonly maxCacheSize: number = 50; // 最大缓存条目数

  constructor(options?: Partial<RendererOptions>) {
    // 默认配置
    this.options = {
      breaks: true, // 启用换行
      gfm: true, // 启用 GitHub Flavored Markdown
      highlight: this.defaultHighlight,
      ...options,
    };

    this.configure(this.options);
  }

  /**
   * 配置 Markdown 解析器
   */
  configure(options: RendererOptions): void {
    this.options = { ...this.options, ...options };

    // 配置 marked
    marked.setOptions({
      breaks: this.options.breaks,
      gfm: this.options.gfm,
    });
  }

  /**
   * 默认代码高亮函数
   */
  private defaultHighlight(code: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (error) {
        console.error('Code highlighting error:', error);
      }
    }
    return hljs.highlightAuto(code).value;
  }

  /**
   * 渲染 Markdown 内容为 HTML
   * 使用缓存优化性能
   * @param markdown - Markdown 字符串
   * @returns 清理后的安全 HTML 字符串
   * @throws 如果渲染失败则抛出错误
   */
  render(markdown: string): string {
    // 检查缓存
    const cacheKey = this.getCacheKey(markdown);
    const cached = this.renderCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    try {
      // 将 Markdown 转换为 HTML
      const rawHtml = marked.parse(markdown) as string;

      // 为标题添加 id
      const htmlWithIds = addHeadingIds(rawHtml);

      // 清理 HTML 以防止 XSS 攻击
      // 需求 2.1: 确保 HTML 清理正确实施
      const cleanHtml = DOMPurify.sanitize(htmlWithIds, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'ul', 'ol', 'li',
          'a', 'img',
          'strong', 'em', 'code', 'pre',
          'blockquote',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'span', 'div',
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title',
          'class', 'id',
        ],
        // 安全配置
        KEEP_CONTENT: true,           // 保留被移除标签的内容
        RETURN_DOM: false,            // 返回字符串而不是 DOM
        RETURN_DOM_FRAGMENT: false,   // 不返回 DOM 片段
        FORCE_BODY: false,            // 不强制包装在 body 中
        SANITIZE_DOM: true,           // 清理 DOM
        IN_PLACE: false,              // 不在原地修改
        ALLOW_DATA_ATTR: false,       // 禁止 data-* 属性
        ALLOW_UNKNOWN_PROTOCOLS: false, // 禁止未知协议
        SAFE_FOR_TEMPLATES: true,     // 对模板安全
      });

      // 存入缓存
      this.addToCache(cacheKey, cleanHtml);

      return cleanHtml;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`Markdown 渲染失败: ${errorMessage}`);
    }
  }

  /**
   * 生成缓存键
   * 使用内容的哈希值作为键
   */
  private getCacheKey(content: string): string {
    // 简单的哈希函数，用于生成缓存键
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为 32 位整数
    }
    return hash.toString(36);
  }

  /**
   * 添加到缓存，使用 LRU 策略
   */
  private addToCache(key: string, value: string): void {
    // 如果缓存已满，删除最旧的条目
    if (this.renderCache.size >= this.maxCacheSize) {
      const firstKey = this.renderCache.keys().next().value;
      if (firstKey !== undefined) {
        this.renderCache.delete(firstKey);
      }
    }
    this.renderCache.set(key, value);
  }

  /**
   * 清除渲染缓存
   */
  clearCache(): void {
    this.renderCache.clear();
  }
}

// 导出默认实例
export const defaultRenderer = new MarkdownRenderer();
