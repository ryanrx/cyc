// pages/result/result.js
const util = require('../../utils/util.js');
const app = util.app;
const db = util.dbUtil;

function saveImageToPhotosAlbum(option) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      ...option,
      success: resolve,
      fail: reject,
    })
  })
}

Page({

  /**
   * Page initial data
   */
  data: {
    resultIndex: "",
    test: "",
    array: [],
    platformType: ""
  },

  //事件处理函数
  // 海报保存至相册
  handleSave() {
    const imageFile = app.globalData.canvasPath

    // ---------- check authority
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          if (imageFile) {
            saveImageToPhotosAlbum({
              filePath: imageFile,
            }).then(() => {
              wx.showToast({
                icon: 'none',
                title: '分享图片已保存至相册',
                duration: 2000,
              })
            }, reason => { })
          }
        } else if (res.authSetting['scope.writePhotosAlbum'] === undefined) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              if (imageFile) {
                saveImageToPhotosAlbum({
                  filePath: imageFile,
                }).then(() => {
                  wx.showToast({
                    icon: 'none',
                    title: '分享图片已保存至相册',
                    duration: 2000,
                  })
                }, reason => { })
              }
            },
            fail() {
              wx.showToast({
                title: '您没有授权，无法保存到相册',
                icon: 'none'
              })
            }
          })
        } else {
          wx.openSetting({
            success(res) {
              if (res.authSetting['scope.writePhotosAlbum']) {
                if (imageFile) {
                  saveImageToPhotosAlbum({
                    filePath: imageFile,
                  }).then(() => {
                    wx.showToast({
                      icon: 'none',
                      title: '分享图片已保存至相册',
                      duration: 2000,
                    })
                  }, reason => { })
                }
              } else {
                wx.showToast({
                  title: '您没有授权，无法保存到相册',
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })
  },
  // ---------- end of checking authority
  
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      resultIndex: options.resultIndex,
      test: options.test,
      platformType: util.platformType,
    })
    
    // console.log('platformType : ' + util.platformType)
    
    // 获取其他推荐测试
    db.collection('questions-lists').where({ 
      name: db.command.neq(options.test)
     }).get({
      success: res => {
        res.data.sort((a, b) => 0.5 - Math.random());
        this.setData({
          array: res.data.slice(0, 20)
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
    return {
      title: this.data.test, //自定义转发标题
      path: '/pages/main/main?id=' + this.data.test, //分享页面路径
      imageUrl: app.globalData.canvasPath //分享图片 宽高比 5:4
    }
  },

  homePage: function() {
    wx.switchTab({
      url: '../home/home',
    })
  }
})