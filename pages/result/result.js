// pages/result/result.js
const util = require('../../utils/util.js');
const app = util.app;

Page({

  /**
   * Page initial data
   */
  data: {
    userInfo: {},
    result: "",
    imagesrc: "",
    visible: false,
    array: []
  },

  //事件处理函数
  show: function () {
    this.setData({ visible: true,})
  },
  close: function () {
    this.setData({ visible: false })
  },

  
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      result: options.result,
      userInfo: app.globalData.userInfo,
    })

    const db = wx.cloud.database();
    db.collection('questions-lists').where({
      name: options.test
    }).get({
      success: res => {
        // console.log('[数据库] [查询记录] 成功: ', res);
        this.setData({
          imagesrc: res.data[0].imagesrc,
        });
      }
    })
    
    db.collection('questions-lists').get({
      success: res => {
        // console.log(res);
        this.setData({
          array: res.data
        })
      }
    });
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

  }
})