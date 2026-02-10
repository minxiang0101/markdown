// Emoji 联想数据

export interface EmojiItem {
  shortcode: string
  emoji: string
  description: string
  keywords: string[]
}

/**
 * 常用 Emoji 数据
 * 包含约 120 个常用 emoji
 */
export const emojiData: EmojiItem[] = [
  // 表情
  { shortcode: 'smile', emoji: '😄', description: '笑脸', keywords: ['happy', 'joy', 'laugh'] },
  { shortcode: 'grinning', emoji: '😀', description: '咧嘴笑', keywords: ['happy', 'smile'] },
  { shortcode: 'joy', emoji: '😂', description: '笑哭', keywords: ['laugh', 'cry', 'happy'] },
  { shortcode: 'rofl', emoji: '🤣', description: '笑翻了', keywords: ['laugh', 'rolling'] },
  { shortcode: 'wink', emoji: '😉', description: '眨眼', keywords: ['blink', 'flirt'] },
  { shortcode: 'blush', emoji: '😊', description: '害羞', keywords: ['shy', 'happy'] },
  { shortcode: 'innocent', emoji: '😇', description: '天使', keywords: ['angel', 'halo'] },
  { shortcode: 'heart_eyes', emoji: '😍', description: '花痴', keywords: ['love', 'crush'] },
  { shortcode: 'kissing_heart', emoji: '😘', description: '飞吻', keywords: ['kiss', 'love'] },
  { shortcode: 'thinking', emoji: '🤔', description: '思考', keywords: ['think', 'hmm'] },
  { shortcode: 'neutral_face', emoji: '😐', description: '面无表情', keywords: ['meh', 'blank'] },
  { shortcode: 'expressionless', emoji: '😑', description: '无语', keywords: ['blank', 'meh'] },
  { shortcode: 'unamused', emoji: '😒', description: '不高兴', keywords: ['unhappy', 'side eye'] },
  { shortcode: 'roll_eyes', emoji: '🙄', description: '翻白眼', keywords: ['whatever', 'bored'] },
  { shortcode: 'grimacing', emoji: '😬', description: '尴尬', keywords: ['awkward', 'nervous'] },
  { shortcode: 'relieved', emoji: '😌', description: '如释重负', keywords: ['relief', 'calm'] },
  { shortcode: 'pensive', emoji: '😔', description: '沉思', keywords: ['sad', 'thoughtful'] },
  { shortcode: 'sleepy', emoji: '😪', description: '困', keywords: ['tired', 'sleep'] },
  { shortcode: 'sleeping', emoji: '😴', description: '睡觉', keywords: ['zzz', 'tired'] },
  { shortcode: 'drool', emoji: '🤤', description: '流口水', keywords: ['yummy', 'hungry'] },
  { shortcode: 'yum', emoji: '😋', description: '美味', keywords: ['delicious', 'tasty'] },
  { shortcode: 'mask', emoji: '😷', description: '口罩', keywords: ['sick', 'covid'] },
  { shortcode: 'sunglasses', emoji: '😎', description: '墨镜', keywords: ['cool', 'awesome'] },
  { shortcode: 'nerd', emoji: '🤓', description: '书呆子', keywords: ['geek', 'smart'] },
  { shortcode: 'confused', emoji: '😕', description: '困惑', keywords: ['puzzled', 'unsure'] },
  { shortcode: 'worried', emoji: '😟', description: '担心', keywords: ['anxious', 'nervous'] },
  { shortcode: 'cry', emoji: '😢', description: '哭', keywords: ['sad', 'tear'] },
  { shortcode: 'sob', emoji: '😭', description: '大哭', keywords: ['crying', 'sad'] },
  { shortcode: 'angry', emoji: '😠', description: '生气', keywords: ['mad', 'upset'] },
  { shortcode: 'rage', emoji: '😡', description: '愤怒', keywords: ['angry', 'furious'] },
  { shortcode: 'triumph', emoji: '😤', description: '哼', keywords: ['proud', 'huffing'] },
  { shortcode: 'skull', emoji: '💀', description: '骷髅', keywords: ['dead', 'death'] },
  { shortcode: 'poop', emoji: '💩', description: '便便', keywords: ['shit', 'crap'] },
  { shortcode: 'clown', emoji: '🤡', description: '小丑', keywords: ['joker', 'circus'] },
  { shortcode: 'ghost', emoji: '👻', description: '幽灵', keywords: ['spooky', 'halloween'] },
  { shortcode: 'alien', emoji: '👽', description: '外星人', keywords: ['ufo', 'space'] },
  { shortcode: 'robot', emoji: '🤖', description: '机器人', keywords: ['bot', 'ai'] },

  // 手势
  { shortcode: 'thumbsup', emoji: '👍', description: '点赞', keywords: ['like', 'good', 'ok', '+1'] },
  { shortcode: 'thumbsdown', emoji: '👎', description: '踩', keywords: ['dislike', 'bad', '-1'] },
  { shortcode: 'clap', emoji: '👏', description: '鼓掌', keywords: ['applause', 'bravo'] },
  { shortcode: 'wave', emoji: '👋', description: '挥手', keywords: ['hello', 'bye', 'hi'] },
  { shortcode: 'ok_hand', emoji: '👌', description: 'OK', keywords: ['perfect', 'nice'] },
  { shortcode: 'v', emoji: '✌️', description: '耶', keywords: ['peace', 'victory'] },
  { shortcode: 'crossed_fingers', emoji: '🤞', description: '祈祷', keywords: ['luck', 'hope'] },
  { shortcode: 'point_up', emoji: '☝️', description: '指向上', keywords: ['one', 'up'] },
  { shortcode: 'point_down', emoji: '👇', description: '指向下', keywords: ['down', 'below'] },
  { shortcode: 'point_left', emoji: '👈', description: '指向左', keywords: ['left'] },
  { shortcode: 'point_right', emoji: '👉', description: '指向右', keywords: ['right'] },
  { shortcode: 'punch', emoji: '👊', description: '拳头', keywords: ['fist', 'bump'] },
  { shortcode: 'fist', emoji: '✊', description: '握拳', keywords: ['power', 'fight'] },
  { shortcode: 'pray', emoji: '🙏', description: '祈祷/感谢', keywords: ['thanks', 'please', 'namaste'] },
  { shortcode: 'handshake', emoji: '🤝', description: '握手', keywords: ['deal', 'agreement'] },
  { shortcode: 'muscle', emoji: '💪', description: '肌肉', keywords: ['strong', 'power', 'flex'] },
  { shortcode: 'writing_hand', emoji: '✍️', description: '写字', keywords: ['write', 'pen'] },

  // 心形
  { shortcode: 'heart', emoji: '❤️', description: '红心', keywords: ['love', 'red'] },
  { shortcode: 'orange_heart', emoji: '🧡', description: '橙心', keywords: ['love', 'orange'] },
  { shortcode: 'yellow_heart', emoji: '💛', description: '黄心', keywords: ['love', 'yellow'] },
  { shortcode: 'green_heart', emoji: '💚', description: '绿心', keywords: ['love', 'green'] },
  { shortcode: 'blue_heart', emoji: '💙', description: '蓝心', keywords: ['love', 'blue'] },
  { shortcode: 'purple_heart', emoji: '💜', description: '紫心', keywords: ['love', 'purple'] },
  { shortcode: 'black_heart', emoji: '🖤', description: '黑心', keywords: ['love', 'black'] },
  { shortcode: 'white_heart', emoji: '🤍', description: '白心', keywords: ['love', 'white'] },
  { shortcode: 'broken_heart', emoji: '💔', description: '心碎', keywords: ['sad', 'breakup'] },
  { shortcode: 'sparkling_heart', emoji: '💖', description: '闪亮的心', keywords: ['love', 'sparkle'] },

  // 自然/天气
  { shortcode: 'fire', emoji: '🔥', description: '火', keywords: ['hot', 'lit', 'flame'] },
  { shortcode: 'star', emoji: '⭐', description: '星星', keywords: ['favorite', 'rating'] },
  { shortcode: 'sparkles', emoji: '✨', description: '闪闪发光', keywords: ['shine', 'magic'] },
  { shortcode: 'zap', emoji: '⚡', description: '闪电', keywords: ['lightning', 'fast'] },
  { shortcode: 'sun', emoji: '☀️', description: '太阳', keywords: ['sunny', 'bright'] },
  { shortcode: 'moon', emoji: '🌙', description: '月亮', keywords: ['night', 'sleep'] },
  { shortcode: 'cloud', emoji: '☁️', description: '云', keywords: ['weather', 'sky'] },
  { shortcode: 'rainbow', emoji: '🌈', description: '彩虹', keywords: ['colorful', 'pride'] },
  { shortcode: 'snowflake', emoji: '❄️', description: '雪花', keywords: ['cold', 'winter'] },
  { shortcode: 'droplet', emoji: '💧', description: '水滴', keywords: ['water', 'tear'] },

  // 动物
  { shortcode: 'dog', emoji: '🐕', description: '狗', keywords: ['puppy', 'pet'] },
  { shortcode: 'cat', emoji: '🐈', description: '猫', keywords: ['kitty', 'pet'] },
  { shortcode: 'panda', emoji: '🐼', description: '熊猫', keywords: ['cute', 'china'] },
  { shortcode: 'monkey', emoji: '🐒', description: '猴子', keywords: ['ape', 'banana'] },
  { shortcode: 'unicorn', emoji: '🦄', description: '独角兽', keywords: ['magic', 'fantasy'] },
  { shortcode: 'butterfly', emoji: '🦋', description: '蝴蝶', keywords: ['insect', 'pretty'] },
  { shortcode: 'bee', emoji: '🐝', description: '蜜蜂', keywords: ['honey', 'buzz'] },
  { shortcode: 'bug', emoji: '🐛', description: '虫子', keywords: ['insect', 'caterpillar'] },

  // 食物
  { shortcode: 'apple', emoji: '🍎', description: '苹果', keywords: ['fruit', 'red'] },
  { shortcode: 'pizza', emoji: '🍕', description: '披萨', keywords: ['food', 'italian'] },
  { shortcode: 'hamburger', emoji: '🍔', description: '汉堡', keywords: ['food', 'burger'] },
  { shortcode: 'coffee', emoji: '☕', description: '咖啡', keywords: ['drink', 'cafe'] },
  { shortcode: 'beer', emoji: '🍺', description: '啤酒', keywords: ['drink', 'alcohol'] },
  { shortcode: 'cake', emoji: '🎂', description: '蛋糕', keywords: ['birthday', 'dessert'] },
  { shortcode: 'cookie', emoji: '🍪', description: '饼干', keywords: ['snack', 'sweet'] },

  // 活动/物品
  { shortcode: 'tada', emoji: '🎉', description: '庆祝', keywords: ['party', 'celebration', 'congrats'] },
  { shortcode: 'balloon', emoji: '🎈', description: '气球', keywords: ['party', 'birthday'] },
  { shortcode: 'gift', emoji: '🎁', description: '礼物', keywords: ['present', 'birthday'] },
  { shortcode: 'trophy', emoji: '🏆', description: '奖杯', keywords: ['winner', 'award'] },
  { shortcode: 'medal', emoji: '🏅', description: '奖牌', keywords: ['winner', 'gold'] },
  { shortcode: 'rocket', emoji: '🚀', description: '火箭', keywords: ['launch', 'space', 'fast'] },
  { shortcode: 'airplane', emoji: '✈️', description: '飞机', keywords: ['travel', 'flight'] },
  { shortcode: 'car', emoji: '🚗', description: '汽车', keywords: ['drive', 'vehicle'] },
  { shortcode: 'bike', emoji: '🚲', description: '自行车', keywords: ['bicycle', 'cycling'] },
  { shortcode: 'phone', emoji: '📱', description: '手机', keywords: ['mobile', 'call'] },
  { shortcode: 'computer', emoji: '💻', description: '电脑', keywords: ['laptop', 'work'] },
  { shortcode: 'keyboard', emoji: '⌨️', description: '键盘', keywords: ['type', 'coding'] },
  { shortcode: 'bulb', emoji: '💡', description: '灯泡', keywords: ['idea', 'light'] },
  { shortcode: 'book', emoji: '📖', description: '书', keywords: ['read', 'study'] },
  { shortcode: 'bookmark', emoji: '🔖', description: '书签', keywords: ['save', 'mark'] },
  { shortcode: 'memo', emoji: '📝', description: '备忘录', keywords: ['note', 'write'] },
  { shortcode: 'pencil', emoji: '✏️', description: '铅笔', keywords: ['write', 'edit'] },
  { shortcode: 'pin', emoji: '📌', description: '图钉', keywords: ['location', 'mark'] },
  { shortcode: 'link', emoji: '🔗', description: '链接', keywords: ['url', 'connect'] },
  { shortcode: 'lock', emoji: '🔒', description: '锁', keywords: ['secure', 'private'] },
  { shortcode: 'key', emoji: '🔑', description: '钥匙', keywords: ['unlock', 'password'] },
  { shortcode: 'bell', emoji: '🔔', description: '铃铛', keywords: ['notification', 'alert'] },

  // 符号
  { shortcode: 'check', emoji: '✅', description: '完成', keywords: ['done', 'yes', 'success'] },
  { shortcode: 'x', emoji: '❌', description: '错误', keywords: ['no', 'wrong', 'fail'] },
  { shortcode: 'question', emoji: '❓', description: '问号', keywords: ['what', 'help'] },
  { shortcode: 'exclamation', emoji: '❗', description: '感叹号', keywords: ['important', 'alert'] },
  { shortcode: 'warning', emoji: '⚠️', description: '警告', keywords: ['alert', 'caution'] },
  { shortcode: 'info', emoji: 'ℹ️', description: '信息', keywords: ['information', 'help'] },
  { shortcode: 'plus', emoji: '➕', description: '加号', keywords: ['add', 'new'] },
  { shortcode: 'minus', emoji: '➖', description: '减号', keywords: ['remove', 'delete'] },
  { shortcode: 'arrow_up', emoji: '⬆️', description: '向上箭头', keywords: ['up', 'increase'] },
  { shortcode: 'arrow_down', emoji: '⬇️', description: '向下箭头', keywords: ['down', 'decrease'] },
  { shortcode: 'arrow_left', emoji: '⬅️', description: '向左箭头', keywords: ['left', 'back'] },
  { shortcode: 'arrow_right', emoji: '➡️', description: '向右箭头', keywords: ['right', 'next'] },
  { shortcode: 'recycle', emoji: '♻️', description: '回收', keywords: ['environment', 'green'] },
  { shortcode: 'infinity', emoji: '♾️', description: '无限', keywords: ['forever', 'loop'] },
  { shortcode: '100', emoji: '💯', description: '100分', keywords: ['perfect', 'score'] },
]

/**
 * 根据输入过滤 emoji
 */
export function filterEmoji(query: string): EmojiItem[] {
  const lowerQuery = query.toLowerCase()
  return emojiData.filter(item =>
    item.shortcode.includes(lowerQuery) ||
    item.description.includes(lowerQuery) ||
    item.keywords.some(k => k.includes(lowerQuery))
  )
}
