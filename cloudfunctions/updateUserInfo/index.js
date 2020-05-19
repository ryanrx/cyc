// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var res = await db.collection('user-history').where({
      _openid: event.openid,
    }).get();
    
    for (var i = 0; i < res.data.length; i++) {
      await db.collection('user-history').doc(res.data[i]._id).update({
        data: {
          nickName: event.userInfo.nickName,
          userInfo: event.userInfo
        }
      })
    }

  } catch (e) {
    console.log(e)
  }
}