// 云函数入口文件
const cloud = require('wx-server-sdk')

// 更改测试名
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var res = await db.collection('questions-lists').where({
      name: event.oldName
    }).get();

    await db.collection('questions-lists').doc(res.data[0]._id).update({
      data: {
        name: event.newName
      }
    })

    res = await db.collection('user-history').where({
      qname: event.oldName,
    }).get();

    for (var i = 0; i < res.data.length; i++) {
      await db.collection('user-history').doc(res.data[i]._id).update({
        data: {
          qname: event.newName
        }
      })
    }

  } catch (e) {
    console.log(e)
  }
}