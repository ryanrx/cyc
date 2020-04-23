// pages/main/main.js
const app = getApp();

var stageNum = 0;   // current question stage
var types = []; // result types
var userType = []; // initial user scores
var questions = [];
var userInfo = {};
var openid;

/* find the index of the maximal number of an array */
function pickIndexOfMax(array) {
  var max = array[0];
  var maxIndex = 0; // find type with max score
  for (var i = 1; i < array.length; i++) {
    if (array[i] > max) {
      maxIndex = i;
      max = array[i];
    }
  }
  return maxIndex;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stage: stageNum,
    questions: questions,
    result: "",
    resultStatus: false,
    imagesrc: "",
    name: "",
  },



  chosen: function(e) {

    // console.log(e);
    for(var i = 0; i < userType.length; i++){ // add scores
      userType[i] += questions[stageNum].scores[e.target.id][i];
    }

    // increment questions stage number
    stageNum++;
    this.setData({
      stage: stageNum,
    })

    console.log(userType);

    if(stageNum == questions.length){ // if no questions left
      var maxIndex = pickIndexOfMax(userType);
      this.setData({  // return result
        resultStatus: true,
        result: types[maxIndex]
      })
      let name = this.data.name;
      let result = this.data.result;

      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          userInfo = res.userInfo;
          // console.log("success", res)
        },
        complete: res => {
          if (app.globalData.openid) {
            this.setData({
              openid: app.globalData.openid
            })
          }
          const db = wx.cloud.database();
          db.collection('user-history').where({
            _openid: this.data.openid,
            qname: name
          }).get({
            success: res => {
              if(res.data.length){
                db.collection('user-history').doc(res.data[0]._id).update({
                  data: {
                    result: result
                  }
                })
              }else{
                // console.log("complete", res)
                db.collection('user-history').add({
                  data: {
                    qname: name,
                    result: result,
                    nickName: userInfo.nickName,
                    userInfo: userInfo
                  }
                })
              }
            }
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    const db = wx.cloud.database()
    db.collection('questions-lists').where({
      name: options.id
    }).get({
      success: res => {
        // console.log('[数据库] [查询记录] 成功: ', res);
        questions = res.data[0].questions;
        types = res.data[0].types;
        userType = [];
        for(var i = 0; i < types.length; i++){
          userType.push(0);
        }
        stageNum = 0;
        this.setData({
          name: options.id,
          imagesrc: res.data[0].imagesrc,
          questions: questions
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})