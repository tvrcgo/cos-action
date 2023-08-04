import core from '@actions/core'
import github from '@actions/github'
import fg from 'fast-glob'
import fs from 'fs'
import COS from 'cos-nodejs-sdk-v5'
import { resolve } from 'path'

try {
  const cos = new COS({
    SecretId: core.getInput('secret_id'),
    SecretKey: core.getInput('secret_key'),
  })

  let uploaded = 0
  const putObject = async (key, src) => {
    return new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: core.getInput('bucket'),
        Region: core.getInput('region'),
        Key: key,
        Body: fs.createReadStream(src),
      }, (err, data) => {
        if (err) {
          return reject(err)
        }
        uploaded++
        return resolve(data)
      })
    })
  }

  const assets = core.getInput('assets')
  await Promise.all(assets.split('\n').map(async mapping => {
    const [src, dst] = mapping.split(':')
    const files = fg.sync([src], { dot: false, onlyFiles: true })

    // 单文件
    if (files.length === 1 && !/\/$/.test(dst)) {
      await putObject(dst, resolve(files[0]))
    }

    // 目录
    if (files.length && /\/$/.test(dst)) {
      await Promise.all(files.map(async file => {
        const base = src.replace(/\*+$/g, '')
        const filename = file.replace(base, '')
        return putObject(`${dst}${filename}`, resolve(file))
      }))
    }
  }))

  core.notice(`上传文件 ${uploaded} 个到 COS`)
  core.setOutput('count', uploaded)

} catch (err) {
  core.setFailed(err.message)
}
