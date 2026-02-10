// 联想功能统一导出

export { AutocompletePopup } from './AutocompletePopup'
export type { AutocompletePopupProps } from './AutocompletePopup'

export { useAutocomplete } from './useAutocomplete'
export type { AutocompleteItem, AutocompleteState } from './useAutocomplete'

export { checkTrigger, extractHeadings, triggers } from './triggers'
export type { Trigger, TriggerType } from './triggers'

export {
  headingSyntax,
  listSyntax,
  codeSyntax,
  quoteSyntax,
  linkSyntax,
  tableSyntax,
  formatSyntax,
  dividerSyntax,
  allMarkdownSyntax,
  getMarkdownSyntaxByTrigger,
} from './data/markdownSyntax'
export type { MarkdownSyntaxItem } from './data/markdownSyntax'

export { emojiData, filterEmoji } from './data/emoji'
export type { EmojiItem } from './data/emoji'
