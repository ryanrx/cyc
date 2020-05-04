// pages/user/user.js
//获取应用实例
const util = require('../../utils/util.js');
const app = util.app;
const db = util.dbUtil;
// console.log(db)
var userInfo = {};

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    records: []
  },
  //事件处理函数
  bindViewTap: function () {

  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }


    if(this.data.hasUserInfo){
      if (app.globalData.openid) {
        this.setData({
          openid: app.globalData.openid
        })
      }
      userInfo = this.data.userInfo;
      // const db = wx.cloud.database()
      // 查询当前用户所有的记录
      db.collection('user-history').where({
        _openid: this.data.openid,
      }).get({
        success: res => {
          var recs = [];
          for (var i = 0; i < res.data.length; i++) {
            recs.push(res.data[i]);
          }
          recs.sort((a, b) => b.date - a.date);
          var d = new Date();
          var milliday = 1000 * 60 * 60 * 24;
          for(var i = 0; i < recs.length; i++){
            var cd = recs[i].date;
            var days = (d.getTime() - cd.getTime()) / milliday;
            if(days <= 1){
              recs[i].date = "今天";
            }else if(days <= 2){
              recs[i].date = "昨天";
            }else{
              var year = cd.getFullYear();
              var month = cd.getMonth() + 1;
              var day = cd.getDate();
              recs[i].date = year+"年"+month+"月"+day+"日";
            }
          }
          this.setData({
            records: recs,
          })
          if (res.data.length && !Object.keys(res.data[0].userInfo).length){
            db.collection('user-history').where({
              _openid: this.data.openid,
            }).get({
              success: res => {
                for (var j = 0; j < res.data.length; j++) {
                  db.collection('user-history').doc(res.data[j]._id).update({
                    data: {
                      nickName: userInfo.nickName,
                      userInfo: userInfo
                    }
                  })
                }
              }
            })
          }
        }
      })
    }
  },

  getUserInfo: function (e) {
    console.log(app)
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  viewHistory: function(e) {
    var curRec = this.data.records[parseInt(e.currentTarget.id)];
    wx.navigateTo({
      url: '../result/result?test=' + curRec.qname + "&result=" + curRec.result
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
    wx.showLoading({
      title: '努力刷新中'
    })
    this.onLoad();
    setTimeout(function(){
      wx.stopPullDownRefresh();
      wx.hideLoading();
    }, 500);
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