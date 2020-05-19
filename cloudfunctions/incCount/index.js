// 云函数入口文件
const cloud = require('wx-server-sdk')
// increment hitCount
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var res = await db.collection('questions-lists').where({
      _id: event._id
    }).get();

    return await db.collection('questions-lists').doc(event._id).update({
      data: {
        hitCount: res.data[0].hitCount + 1
      }
    })
    
  } catch (e) {
    console.log(e)
  }
}