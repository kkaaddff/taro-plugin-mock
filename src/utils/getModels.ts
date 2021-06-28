import * as path from 'path'
import { readFileSync } from 'fs'
import {} from '@babel/core'
import * as parser from '@babel/parser'
import * as traverse from '@babel/traverse'
import * as t from '@babel/types'
import { glob } from 'glob'

export function getModels(cwd: string, pattern?: string) {
  const files = glob
    .sync(pattern || '**/*.{ts,tsx,js,jsx}', {
      cwd,
    })
    .filter(
      (file: string) =>
        !file.endsWith('.d.ts') &&
        !file.endsWith('.test.js') &&
        !file.endsWith('.test.jsx') &&
        !file.endsWith('.test.ts') &&
        !file.endsWith('.test.tsx')
    )

  return getValidFiles(files, cwd)
}

const getValidFiles = (files: string[], modelsDir: string) =>
  files
    .map((file) => {
      const filePath = path.join(modelsDir, file)
      const valid = isValidHook(filePath)
      if (valid) {
        return filePath
      }
      return ''
    })
    .filter((ele) => !!ele) as string[]

export const isValidHook = (filePath: string) => {
  const isTS = path.extname(filePath) === '.ts'
  const isTSX = path.extname(filePath) === '.tsx'
  const content = readFileSync(filePath, { encoding: 'utf-8' }).toString()

  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: [
      // .ts 不能加 jsx，因为里面可能有 `<Type>{}` 这种写法
      // .tsx, .js, .jsx 可以加
      isTS ? false : 'jsx',
      // 非 ts 不解析 typescript
      isTS || isTSX ? 'typescript' : false,
      // 支持更多语法
      'classProperties',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'optionalChaining',
      'decorators-legacy',
    ].filter(Boolean) as parser.ParserPlugin[],
  })
  let valid = false
  let identifierName = ''
  traverse.default(ast, {
    enter(p) {
      if (p.isExportDefaultDeclaration()) {
        const { type } = p.node.declaration
        try {
          if (type === 'ArrowFunctionExpression' || type === 'FunctionDeclaration') {
            valid = true
          } else if (type === 'Identifier') {
            identifierName = (p.node.declaration as t.Identifier).name
          }
        } catch (e) {
          console.error(e)
        }
      }
    },
  })

  try {
    if (identifierName) {
      ast.program.body.forEach((ele) => {
        if (ele.type === 'FunctionDeclaration') {
          if (ele.id?.name === identifierName) {
            valid = true
          }
        }
        if (ele.type === 'VariableDeclaration') {
          if (
            (ele.declarations[0].id as t.Identifier).name === identifierName &&
            (ele.declarations[0].init as t.ArrowFunctionExpression).type ===
              'ArrowFunctionExpression'
          ) {
            valid = true
          }
        }
      })
    }
  } catch (e) {
    valid = false
  }

  return valid
}
