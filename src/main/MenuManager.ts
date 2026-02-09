import { Menu, MenuItemConstructorOptions, app, shell, BrowserWindow, dialog } from 'electron';

/**
 * MenuManager - 负责创建和管理应用菜单
 */
export class MenuManager {
  /**
   * 创建应用菜单
   */
  createMenu(): void {
    const isMac = process.platform === 'darwin';

    const template: MenuItemConstructorOptions[] = [
      // macOS 应用菜单
      ...(isMac ? [{
        label: app.name,
        submenu: [
          { label: `关于 ${app.name}`, role: 'about' as const },
          { type: 'separator' as const },
          { label: '服务', role: 'services' as const },
          { type: 'separator' as const },
          { label: `隐藏 ${app.name}`, role: 'hide' as const },
          { label: '隐藏其他', role: 'hideOthers' as const },
          { label: '显示全部', role: 'unhide' as const },
          { type: 'separator' as const },
          { label: '退出', role: 'quit' as const }
        ]
      }] : []),

      // 文件菜单
      {
        label: '文件',
        submenu: [
          {
            label: '打开文件',
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const window = BrowserWindow.getFocusedWindow();
              if (!window) return;

              const result = await dialog.showOpenDialog(window, {
                title: '选择 Markdown 文件',
                filters: [
                  { name: 'Markdown 文件', extensions: ['md', 'markdown'] },
                  { name: '所有文件', extensions: ['*'] }
                ],
                properties: ['openFile']
              });

              if (!result.canceled && result.filePaths.length > 0) {
                window.webContents.send('open-initial-file', result.filePaths[0]);
              }
            }
          },
          { type: 'separator' as const },
          isMac ? { label: '关闭', role: 'close' as const } : { label: '退出', role: 'quit' as const }
        ]
      },
      
      // 编辑菜单
      {
        label: '编辑',
        submenu: [
          { label: '撤销', role: 'undo' as const },
          { label: '重做', role: 'redo' as const },
          { type: 'separator' as const },
          { label: '剪切', role: 'cut' as const },
          { label: '复制', role: 'copy' as const },
          { label: '粘贴', role: 'paste' as const },
          ...(isMac ? [
            { label: '粘贴并匹配样式', role: 'pasteAndMatchStyle' as const },
            { label: '删除', role: 'delete' as const },
            { label: '全选', role: 'selectAll' as const },
            { type: 'separator' as const },
            {
              label: '语音',
              submenu: [
                { label: '开始朗读', role: 'startSpeaking' as const },
                { label: '停止朗读', role: 'stopSpeaking' as const }
              ]
            }
          ] : [
            { label: '删除', role: 'delete' as const },
            { type: 'separator' as const },
            { label: '全选', role: 'selectAll' as const }
          ])
        ]
      },
      
      // 视图菜单
      {
        label: '视图',
        submenu: [
          { label: '重新加载', role: 'reload' as const },
          { label: '强制重新加载', role: 'forceReload' as const },
          { label: '切换开发者工具', role: 'toggleDevTools' as const },
          { type: 'separator' as const },
          { label: '实际大小', role: 'resetZoom' as const },
          { label: '放大', role: 'zoomIn' as const },
          { label: '缩小', role: 'zoomOut' as const },
          { type: 'separator' as const },
          { label: '切换全屏', role: 'togglefullscreen' as const }
        ]
      },
      
      // 窗口菜单
      {
        label: '窗口',
        submenu: [
          { label: '最小化', role: 'minimize' as const },
          { label: '缩放', role: 'zoom' as const },
          ...(isMac ? [
            { type: 'separator' as const },
            { label: '前置全部窗口', role: 'front' as const },
            { type: 'separator' as const },
            { label: '窗口', role: 'window' as const }
          ] : [
            { label: '关闭', role: 'close' as const }
          ])
        ]
      },
      
      // 帮助菜单
      {
        label: '帮助',
        submenu: [
          {
            label: '了解更多',
            click: async () => {
              await shell.openExternal('https://github.com/electron/electron')
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}
