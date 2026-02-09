import { defineConfig } from 'vite'
import path from 'path'
import { builtinModules } from 'module'

// Vite 配置用于构建 Electron 主进程和 preload 脚本
const isBuiltin = (id: string) => {
  if (id === 'electron') return true
  if (id.startsWith('node:')) return true
  if (builtinModules.includes(id)) return true
  return builtinModules.some(m => id.startsWith(`${m}/`))
}

const isExternal = (id: string) => {
  // 内置模块
  if (isBuiltin(id)) return true
  // 生产依赖（chokidar 等）
  if (id === 'chokidar' || id.startsWith('chokidar/')) return true
  return false
}

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    lib: {
      entry: {
        main: path.resolve(__dirname, 'src/main/index.ts'),
        preload: path.resolve(__dirname, 'src/preload/index.ts')
      },
      formats: ['cjs']
    },
    rollupOptions: {
      external: isExternal,
      output: {
        entryFileNames: '[name].cjs'
      }
    },
    minify: 'esbuild',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
