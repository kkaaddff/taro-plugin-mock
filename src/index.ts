import { join } from 'path'
import * as fse from 'fs-extra'
import { getModels } from './utils/getModels'
import { getTmpFile } from './utils/tpl'
import * as Mustache from 'mustache'
import { DIR_NAME_IN_TMP } from './constants'
import * as lodash from 'lodash'

const MODEL_DIR = 'models'
const PROJECT_PATH = process.cwd()
const ABS_SRC_PATH = join(PROJECT_PATH, 'src')
const TARO_CACHE_PATH = join(ABS_SRC_PATH, '.taro')

export default (ctx) => {
  ctx.onBuildStart(() => {
    fse.ensureDirSync(TARO_CACHE_PATH)
    const files = getAllModels()
    const tmpFiles = getTmpFile(files, [], ABS_SRC_PATH)

    // provider.tsx
    writeTmpFile({
      path: `${DIR_NAME_IN_TMP}/Provider.tsx`,
      content: tmpFiles.providerContent,
    })

    // useModel.tsx
    writeTmpFile({
      path: `${DIR_NAME_IN_TMP}/useModel.tsx`,
      content: tmpFiles.useModelContent,
    })

    // runtime.tsx
    writeTmpFile({
      path: `${DIR_NAME_IN_TMP}/runtime.tsx`,
      content: Mustache.render(
        fse.readFileSync(join(__dirname, '..', 'tpl', 'runtime.tsx.tpl'), 'utf-8'),
        {}
      ),
    })

    // constant.tsx
    writeTmpFile({
      path: `${DIR_NAME_IN_TMP}/helpers/constant.tsx`,
      content: fse.readFileSync(join(__dirname, '..', 'tpl', 'constant.tsx.tpl'), 'utf-8'),
    })

    // dispatcher.tsx
    writeTmpFile({
      path: `${DIR_NAME_IN_TMP}/helpers/dispatcher.tsx`,
      content: fse.readFileSync(join(__dirname, '..', 'tpl', 'dispatcher.tsx.tpl'), 'utf-8'),
    })

    // executor.tsx
    writeTmpFile({
      path: `${DIR_NAME_IN_TMP}/helpers/executor.tsx`,
      content: fse.readFileSync(join(__dirname, '..', 'tpl', 'executor.tsx.tpl'), 'utf-8'),
    })
  })
}

function getModelsPath() {
  return join(ABS_SRC_PATH, MODEL_DIR)
}

function getAllModels() {
  const srcModelsPath = getModelsPath()
  return lodash.uniq([
    ...getModels(srcModelsPath),
    ...getModels(ABS_SRC_PATH, `**/${MODEL_DIR}/**/*.{ts,tsx,js,jsx}`),
    ...getModels(ABS_SRC_PATH, `**/*.model.{ts,tsx,js,jsx}`),
  ])
}

function writeTmpFile({ path, content }: { path: string; content: string }) {
  const filePath = join(TARO_CACHE_PATH, path)
  fse.ensureFileSync(filePath)
  fse.writeFileSync(filePath, content)
}
