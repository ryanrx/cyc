const util = require('../../utils/util.js');
const app = util.app;

function getImageInfo(url) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: url,
      success: resolve,
      fail: reject,
    })
  })
}

function createRpx2px() {
  const { windowWidth } = wx.getSystemInfoSync()

  return function(rpx) {
    return windowWidth / 750 * rpx
  }
}

const rpx2px = createRpx2px()

function canvasToTempFilePath(option, context) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      ...option,
      success: resolve,
      fail: reject,
    }, context)
  })
}

function saveImageToPhotosAlbum(option) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      ...option,
      success: resolve,
      fail: reject,
    })
  })
}

Component({
  properties: {
    // visible: {
    //   type: Boolean,
    //   value: false,
    //   observer(visible) {
    //     if (visible && !this.beginDraw) {
    //       this.draw()
    //       this.beginDraw = true
    //     }
    //   }
    // },
    // userInfo: {
    //   type: Object,
    //   value: false
    // },
    resultMess: String,
  },

  data: {
    beginDraw: false,
    isDraw: false,

    canvasWidth: 843,
    canvasHeight: 1500,

    imageFile: '',

    responsiveScale: 1
  },

  lifetimes: {
    ready() {
      const designWidth = 375
      const designHeight = 603 // 这是在顶部位置定义，底部无tabbar情况下的设计稿高度

      // 以iphone6为设计稿，计算相应的缩放比例
      // this.setData({
      //   userInfo: app.globalData.userInfo,
      // })
      // console.log(this.data.userInfo);

      const { windowWidth, windowHeight } = wx.getSystemInfoSync()
      const responsiveScale =
        windowHeight / ((windowWidth / designWidth) * designHeight)
      if (responsiveScale < 1) {
        this.setData({
          responsiveScale,
        })
      }
      this.draw()
      this.beginDraw = true
    },
  },

  methods: {
    // handleClose() {
    //   this.triggerEvent('close')
    // },
    handleSave() {
      const { imageFile } = this.data

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
              }, reason =>{})
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
    draw() {
      wx.showLoading({title: '当前网速较慢'})
      const userInfo = app.globalData.userInfo;
      const { canvasWidth, canvasHeight } = this.data
      var hasUserInfo = false;
      var avatarPromise, avatarUrl, nickName;
      // console.log(userInfo)
      if (userInfo){
        hasUserInfo = true;
        avatarUrl = userInfo.avatarUrl;
        nickName = userInfo.nickName;
        // { avatarUrl, nickName } = userInfo
        avatarPromise = getImageInfo(avatarUrl)
      }
      const backgroundPromise = getImageInfo('cloud://inuyasha.696e-inuyasha-1301310234/cyc/qyn_bg2.jpg')
      const qrCodePromise = getImageInfo('cloud://inuyasha.696e-inuyasha-1301310234/cyc/cyc-qrcode.jpg')

      Promise.all([backgroundPromise, qrCodePromise])
        .then(([background, qrCode]) => {

          const ctx = wx.createCanvasContext('share', this)

          const canvasW = rpx2px(canvasWidth * 2)
          const canvasH = rpx2px(canvasHeight * 2)

          // 绘制背景
          ctx.drawImage(
            background.path,
            0,
            0,
            canvasW,
            canvasH
          )

          const radius = rpx2px(90 * 2)
          const y = rpx2px(200 * 2)

          const drawUser = new Promise((resolve) => {
            if (hasUserInfo) {
              avatarPromise.then((avatar) => {
                // 绘制头像
                ctx.drawImage(
                  avatar.path,
                  canvasW / 2 - radius,
                  y - radius,
                  radius * 2,
                  radius * 2,
                )

                // 绘制用户名
                ctx.setFontSize(60)
                ctx.setTextAlign('center')
                ctx.setFillStyle('black')
                ctx.fillText(
                  nickName,
                  canvasW / 2,
                  y + rpx2px(150 * 2),
                )

                resolve();
              })
            }else{
              ctx.drawImage(
                '../../pages/images/user/user.png',
                canvasW / 2 - radius,
                y - radius,
                radius * 2,
                radius * 2,
              )
              resolve();
            }
          })

          // 绘制结果标题
          ctx.setFontSize(60)
          ctx.setTextAlign('center')
          ctx.setFillStyle('black')
          ctx.fillText(
            this.properties.resultMess,   //@@@@@@@@@@@ 语法示范（需提前传参，自动同名传参无法使用）
            canvasW / 2,
            y + rpx2px(150 * 4),
          )

          //绘制二维码
          ctx.save()
          ctx.beginPath()
          ctx.arc(canvasW / 2,
            y + rpx2px(150 * 10) + rpx2px(600),
            rpx2px(300), 0, 2 * Math.PI)
          ctx.clip()
          ctx.drawImage(
            qrCode.path,
            canvasW / 2 - rpx2px(300),
            y + rpx2px(150 * 12),
            rpx2px(600),
            rpx2px(600)
          )
          ctx.restore()
          
          drawUser.then(() => {
            // 最后完成作画
            // ctx.stroke()
            ctx.draw(false, () => {
              canvasToTempFilePath({
                canvasId: 'share',
              }, this).then(({ tempFilePath }) => this.setData({ imageFile: tempFilePath }))
            })


            this.setData({ isDraw: true })

            setTimeout(() => {
              wx.hideLoading();
            }, 1000);
          }) 

        }).catch(() => {
          this.setData({ beginDraw: false })
          wx.hideLoading()
        })

    }
  }
})