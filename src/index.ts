import { join } from 'path'
import * as fse from 'fs-extra'
import { getModels } from './utils/getModels'
import * as lodash from 'lodash'

const MODEL_DIR = 'models'
const PROJECT_PATH = process.cwd()
const ABS_SRC_PATH = join(PROJECT_PATH, 'src')
const TARO_CACHE_PATH = join(ABS_SRC_PATH, '.taro')

export default (ctx) => {
  ctx.onBuildStart(() => {
    fse.ensureDirSync(TARO_CACHE_PATH)
    // @ts-ignore
    const paths = getAllModels()
    debugger
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
