// pages/unfinish/unfinish.js
const util = require('../../utils/util.js');
const db = util.dbUtil;

Page({

  /**
   * Page initial data
   */
  data: {
    imagesrc: "",
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({ platformType: util.platformType })
    db.collection('questions-lists').where({
      name: options.id
    }).get({
      success: res => {
        this.setData({
          imagesrc: res.data[0].bg_img,
        });
        // console.log(res)
        wx.cloud.callFunction({
          name: 'incCount',
          data: {
            _id: res.data[0]._id,
          }, success: function (res) {
            // console.log(res)
          }, fail: function (res) {
            // console.log(res)
          }
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '获取信息失败,请检查是否连接到网络'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },

  homePage: function () {
    wx.switchTab({
      url: '../home/home',
    })
  },

})