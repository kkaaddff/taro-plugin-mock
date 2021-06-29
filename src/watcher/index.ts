const path = require('path')
const watch = require('watch')
const glob = require('glob')

export default function startWatcher(fn: () => void, WatcherFiles: { dirs: [] }) {
  watch.watchTree(process.cwd(), function (f, curr, prev) {
    if (typeof f == 'object' && prev === null && curr === null) {
      // Finished walking the tree
      return
    } else if (prev === null && curr.nlink === 0) {
      // f is a new file
      // f was removed
      WatcherFiles.dirs = getModelsDirs()
    }

    let dir = WatcherFiles.dirs.find((dir) => f.includes(dir))

    if (dir) {
      fn()
    }
  })
}

export function getModelsDirs() {
  const files = glob
    .sync('src/**/models/*.{ts,tsx,js,jsx}', {
      absolute: true,
    })
    .map((file) => path.dirname(file))
  return files
}
