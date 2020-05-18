// 云函数入口文件
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')
cloud.init()

exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.wxacode.get({
      path: event.page,
      width: event.width,
      autoColor: event.autoColor,
      isHyaline: event.isHyaline
    });
    const uploadResult = await cloud.uploadFile({
      cloudPath: event.name + '-qrcode.jpg',
      fileContent: result.buffer
    });
  } catch (err) {
    return err
  }
}