// Markdown 语法联想数据

export interface MarkdownSyntaxItem {
  label: string
  value: string
  description: string
  category: 'heading' | 'list' | 'code' | 'quote' | 'link' | 'format' | 'table' | 'divider'
}

/**
 * 标题语法
 */
export const headingSyntax: MarkdownSyntaxItem[] = [
  { label: '# 一级标题', value: '# ', description: '最大的标题', category: 'heading' },
  { label: '## 二级标题', value: '## ', description: '次级标题', category: 'heading' },
  { label: '### 三级标题', value: '### ', description: '三级标题', category: 'heading' },
  { label: '#### 四级标题', value: '#### ', description: '四级标题', category: 'heading' },
  { label: '##### 五级标题', value: '##### ', description: '五级标题', category: 'heading' },
  { label: '###### 六级标题', value: '###### ', description: '最小的标题', category: 'heading' },
]

/**
 * 列表语法
 */
export const listSyntax: MarkdownSyntaxItem[] = [
  { label: '- 无序列表', value: '- ', description: '无序列表项', category: 'list' },
  { label: '* 无序列表', value: '* ', description: '无序列表项（星号）', category: 'list' },
  { label: '1. 有序列表', value: '1. ', description: '有序列表项', category: 'list' },
  { label: '- [ ] 任务列表', value: '- [ ] ', description: '未完成的任务', category: 'list' },
  { label: '- [x] 已完成任务', value: '- [x] ', description: '已完成的任务', category: 'list' },
]

/**
 * 代码块语言列表
 */
export const codeLanguages = [
  'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'c', 'cpp',
  'csharp', 'json', 'yaml', 'html', 'css', 'scss', 'sql', 'bash', 'shell',
  'markdown', 'xml', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r',
  'dockerfile', 'graphql', 'vue', 'react', 'tsx', 'jsx'
]

/**
 * 代码块语法
 */
export const codeSyntax: MarkdownSyntaxItem[] = codeLanguages.map(lang => ({
  label: `\`\`\`${lang}`,
  value: `\`\`\`${lang}\n\n\`\`\``,
  description: `${lang} 代码块`,
  category: 'code' as const,
}))

// 添加通用代码块
codeSyntax.unshift({
  label: '```代码块',
  value: '```\n\n```',
  description: '通用代码块',
  category: 'code',
})

/**
 * 引用语法
 */
export const quoteSyntax: MarkdownSyntaxItem[] = [
  { label: '> 引用', value: '> ', description: '块引用', category: 'quote' },
  { label: '>> 嵌套引用', value: '>> ', description: '嵌套块引用', category: 'quote' },
]

/**
 * 链接/图片语法
 */
export const linkSyntax: MarkdownSyntaxItem[] = [
  { label: '[链接](url)', value: '[](url)', description: '超链接', category: 'link' },
  { label: '![图片](url)', value: '![](url)', description: '图片', category: 'link' },
  { label: '[链接][ref]', value: '[][ref]', description: '引用式链接', category: 'link' },
]

/**
 * 表格语法
 */
export const tableSyntax: MarkdownSyntaxItem[] = [
  {
    label: '| 表格 |',
    value: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |',
    description: '创建表格',
    category: 'table',
  },
]

/**
 * 格式化语法
 */
export const formatSyntax: MarkdownSyntaxItem[] = [
  { label: '**粗体**', value: '****', description: '粗体文本', category: 'format' },
  { label: '*斜体*', value: '**', description: '斜体文本', category: 'format' },
  { label: '~~删除线~~', value: '~~~~', description: '删除线文本', category: 'format' },
  { label: '`行内代码`', value: '``', description: '行内代码', category: 'format' },
]

/**
 * 分割线语法
 */
export const dividerSyntax: MarkdownSyntaxItem[] = [
  { label: '--- 分割线', value: '---', description: '水平分割线', category: 'divider' },
  { label: '*** 分割线', value: '***', description: '水平分割线（星号）', category: 'divider' },
]

/**
 * 所有 Markdown 语法
 */
export const allMarkdownSyntax: MarkdownSyntaxItem[] = [
  ...headingSyntax,
  ...listSyntax,
  ...quoteSyntax,
  ...dividerSyntax,
  ...tableSyntax,
]

/**
 * 根据触发字符获取相关语法
 */
export function getMarkdownSyntaxByTrigger(trigger: string): MarkdownSyntaxItem[] {
  switch (trigger) {
    case '#':
      return headingSyntax
    case '-':
      return listSyntax.filter(s => s.value.startsWith('-'))
    case '*':
      return [...listSyntax.filter(s => s.value.startsWith('*')), ...formatSyntax.filter(s => s.value.startsWith('*'))]
    case '>':
      return quoteSyntax
    case '`':
      return [...formatSyntax.filter(s => s.value.startsWith('`')), ...codeSyntax]
    case '[':
      return linkSyntax.filter(s => s.value.startsWith('['))
    case '!':
      return linkSyntax.filter(s => s.value.startsWith('!'))
    case '|':
      return tableSyntax
    default:
      return allMarkdownSyntax
  }
}
