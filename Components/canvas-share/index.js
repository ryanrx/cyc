const util = require('../../utils/util.js');
const app = util.app;
const db = util.dbUtil;

const wenben = '！！！到时候把这段文字改成this.properties.resultMess，不带引号。。。。美利坚合众国（英语：United States of America，United States），简称“美国”，是由华盛顿哥伦比亚特区、50个州和关岛等众多海外领土组成的联邦共和立宪制国家。其主体部分位于北美洲中部，美国中央情报局《世界概况》1989年至1996年初始版美国总面积是937.3万平方公里，人口3.3亿。美利坚合众国（英语：United States of America，United States），简称“美国”，是由华盛顿哥伦比亚特区、50个州和关岛等众多海外领土组成的联邦共和立宪制国家。其主体部分位于北美洲中部，美国中央情报局《世界概况》1989年至1996年初始版美国总面积是937.3万平方公里，人口3.3亿。'
const crucialMess = '微信扫一扫 你也测一测'

var bg = '';

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

function drawText(ctx, str, leftWidth, initHeight, titleHeight, canvasWidth, charHeight) {
  var lineWidth = 0;
  var lastSubStrIndex = 0; //每次开始截取的字符串的索引
  for (let i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width;
    if (lineWidth > canvasWidth) {
      ctx.fillText(str.substring(lastSubStrIndex, i), leftWidth, initHeight); //绘制截取部分
      initHeight += charHeight; //16为字体的高度
      lineWidth = 0;
      lastSubStrIndex = i;
      titleHeight += charHeight;
    }
    if (i == str.length - 1) { //绘制剩余部分
      ctx.fillText(str.substring(lastSubStrIndex, i + 1), leftWidth, initHeight);
    }
  }
  // 标题border-bottom 线距顶部距离
  return titleHeight;
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
    test: String
  },

  data: {
    beginDraw: false,
    isDraw: false,

    canvasWidth: 1126,
    canvasHeight: 2000,

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
      // console.log(this.data.test);

      const { windowWidth, windowHeight } = wx.getSystemInfoSync()
      const responsiveScale =
        windowHeight / ((windowWidth / designWidth) * designHeight)
      if (responsiveScale < 1) {
        this.setData({
          responsiveScale,
        })
      }

      const getbg = new Promise((resolve) => {
        db.collection('questions-lists').where({
          name: this.data.test,
        }).get({
          success: res => {
            bg = res.data[0].canvas_bg;
            resolve();
          }
        });  
      })

      var that = this;

      getbg.then(() => {
        that.draw()
        that.beginDraw = true
      })

      // this.draw()
      // this.beginDraw = true
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
    // ---------- end of checking authority

    draw() {
      wx.showLoading({title: '当前网速较慢'})
      const userInfo = app.globalData.userInfo;
      const { canvasWidth, canvasHeight } = this.data
      var hasUserInfo = false;
      var avatarPromise, avatarUrl, nickName;
      // console.log(userInfo)
      if (userInfo) {
        hasUserInfo = true;
        avatarUrl = userInfo.avatarUrl;
        nickName = userInfo.nickName;
        // { avatarUrl, nickName } = userInfo
        avatarPromise = getImageInfo(avatarUrl)
      }
      
      const backgroundPromise = getImageInfo(bg)
      const qrCodePromise = getImageInfo('cloud://inuyasha.696e-inuyasha-1301310234/cyc/cyc-qrcode.jpg')
      const fillTextLineBreak = (ctx, text, x, y, lw, lh) => {
        let i = 0
        let n = 0
        let r = -1
        while (i < text.length) {
          while (ctx.measureText(text.substring(n, i)).width < lw && i < text.length) {
            i++
          }
          r++
          ctx.fillText(text.substring(n, i), x, y + lh * r)
          n = i
        }
        return lh * r
      }

      Promise.all([backgroundPromise, qrCodePromise])
        .then(([background, qrCode]) => {

          const ctx = wx.createCanvasContext('share', this)

          const canvasW = rpx2px(canvasWidth/3*2)
          const canvasH = rpx2px(canvasHeight/3*2)

          // @@@@@@@@@@ 各种重要参数
          const radius = rpx2px(45*2)
          const y = rpx2px(75 * 2)
          const circleY = canvasH - 6*radius

          // 绘制背景
          ctx.drawImage(
            background.path,
            0,
            0,
            canvasW,
            canvasH
          )


          const drawUser = new Promise((resolve) => {
            if (hasUserInfo) {
              avatarPromise.then((avatar) => {

                // 绘制头像
                ctx.drawImage(
                  avatar.path,
                  canvasW / 4 - radius,
                  y - radius,
                  radius * 2,
                  radius * 2,
                )

                // 绘制用户名
                ctx.setFontSize(rpx2px(40))
                ctx.setTextAlign('center')
                ctx.setFillStyle('rgba(0,0,0,0.8)')
                ctx.fillText(
                  nickName,
                  canvasW/4,
                  y + rpx2px(64*2),
                )

                resolve();
              })
            } else{
              ctx.drawImage(
                '../../pages/images/user/user.png',
                canvasW / 4 - radius,
                y - radius,
                radius * 2,
                radius * 2,
              )

              ctx.setFontSize(rpx2px(40))
              ctx.setTextAlign('center')
              ctx.setFillStyle('rgba(0,0,0,0.8)')
              ctx.fillText(
                "未登录",
                canvasW / 4,
                y + rpx2px(64 * 2),
              )
              resolve();
            }
          })

          // 绘制扫描二维码标语
          const h2size = rpx2px(30)
          ctx.setFontSize(h2size)
          ctx.setTextAlign('center')
          ctx.setFillStyle('dimgray')
          drawText(ctx, crucialMess, canvasW / 4 * 3, y + radius + rpx2px(35), 0, canvasW/2, rpx2px(5)+h2size)


          // 绘制结果标题
          const h3size = rpx2px(32)
          ctx.setFontSize(h3size)
          ctx.setTextAlign('center')
          ctx.setFillStyle('rgba(0,0,0,0)')
          const textTopY = y + rpx2px(240)
          const textH
            = drawText(ctx, wenben, canvasW/2, textTopY, 0, canvasW-rpx2px(120), rpx2px(3)+h3size)
          /* ctx.fillText(
            this.properties.resultMess,   //@@@@@@@@@@@ 语法示范（需提前传参，自动同名传参无法使用）
            canvasW / 2,
            y + rpx2px(240)
          ) */
          // 绘制背景板
          ctx.setFillStyle('rgba(0,0,0,0.5)')
          ctx.fillRect(rpx2px(30), textTopY - rpx2px(45), canvasW - rpx2px(60), textH + rpx2px(75))
          ctx.setFillStyle('white')
          drawText(ctx, wenben, canvasW / 2, textTopY, 0, canvasW - rpx2px(120), rpx2px(3) + h3size)


          //绘制二维码
          ctx.save()
          ctx.beginPath()
          ctx.arc(canvasW/4*3,
            y,
            radius+rpx2px(5), 0, 2 * Math.PI)
          ctx.clip()
          ctx.drawImage(
            qrCode.path,
            canvasW/4*3 - radius,
            y - radius,
            radius*2,
            radius*2
          )
          ctx.setLineWidth(rpx2px(10))
          ctx.setFillStyle('black')
          ctx.stroke()
          ctx.restore()
        
          drawUser.then(() => {
            // 最后完成作画
            
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