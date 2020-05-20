const util = require('../../utils/util.js');
const db = util.dbUtil;

Page({

  /**
   * Page initial data
   */
  data: {
    array: [],
    cateName: ""
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    // 获取类别测试
    this.setData({
      cateName: options.cate
    })
    db.collection('questions-lists').where({
      category: options.cate,
    }).get({
      success: res => {
        res.data.sort((a, b) => a.index - b.index);
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
    wx.showLoading({
      title: '努力刷新中'
    })
    db.collection('questions-lists').where({
      category: this.data.cateName,
    }).get({
      success: res => {
        this.setData({
          array: res.data
        })
        setTimeout(function () {
          wx.stopPullDownRefresh();
          wx.hideLoading();
        }, 500);
      }
    });
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