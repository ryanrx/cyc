const util = require('../../utils/util.js');
const db = util.dbUtil;

Page({

  /**
   * Page initial data
   */
  data: {
    array: []
  },

  chosen: function(e){
    console.log(e);
      wx.redirectTo({
        url: '../main/main?id=' + e.currentTarget.id
      });
  },

  toCate: function (e) {
    // console.log(e);
    wx.navigateTo({
      url: '../category/category?cate=' + e.currentTarget.id
    });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    // wx.cloud.callFunction({
    //   name: 'qrcode',
    //   data: {
    //     page: 'pages/home/home',
    //     width: 430,
    //     autoColor: true,
    //     isHyaline: false,
    //     name: 'cyc/other/cyc'
    //   }
    // }).catch(err => {
    //   console.error(err);
    //   wx.showToast({
    //     icon: 'none',
    //     title: '调用失败',
    //   })
    // })
    
    db.collection('questions-lists').get({
      success: res => {
        // console.log(res);
        res.data.sort((a, b) => a.index - b.index);
        this.setData({
          array: res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '获取信息失败,请检查是否连接到网络'
        })
        console.error('[数据库] [查询记录] 失败：', err)
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
    var that = this;
    const load = new Promise((resolve) => {
      that.onLoad();
      resolve();
    })
    load.then(() => {
      setTimeout(function () {
        wx.stopPullDownRefresh();
        wx.hideLoading();
      }, 500);
    })
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