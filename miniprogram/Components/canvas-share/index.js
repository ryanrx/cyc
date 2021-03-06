const util = require('../../utils/util.js');
const app = util.app;
const db = util.dbUtil;

var resultObject;

// const wenben = '！！！到时候把 draw() 里面的 wenben 改成 resultObject.desc，也就是结果文案。美利坚合众国（英语：United States of America，United States），简称“美国”，是由华盛顿哥伦比亚特区、50个州和关岛等众多海外领土组成的联邦共和立宪制国家。'
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
    test: String,
    resultIndex: Number
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
            resultObject = res.data[0].types[this.properties.resultIndex];
            resolve();
          }
        });  
      })

      var that = this;

      getbg.then(() => {
        that.draw()
        that.beginDraw = true
      })
    },
  },

  methods: {

    draw() {
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })
      const userInfo = app.globalData.userInfo;
      const { canvasWidth, canvasHeight } = this.data
      var hasUserInfo = Boolean(userInfo);
      var avatarUrl = hasUserInfo ? userInfo.avatarUrl : 'cloud://inuyasha.696e-inuyasha-1301310234/cyc/other/user.png';
      var nickName = hasUserInfo ? userInfo.nickName : '未登录';
      var avatarPromise = getImageInfo(avatarUrl);
      
      const bgColor = bg
      const qrCodePromise = getImageInfo('cloud://inuyasha.696e-inuyasha-1301310234/cyc/other/cyc-qrcode.jpg')

      const picPromise = getImageInfo(resultObject.img);

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

      Promise.all([qrCodePromise, picPromise])
        .then(([qrCode, pic]) => {

          const ctx = wx.createCanvasContext('share', this)

          const canvasW = rpx2px(canvasWidth/3*2)
          const canvasH = rpx2px(canvasHeight/3*2)

          // @@@@@@@@@@ 各种重要参数
          const radius = rpx2px(38*2)
          const y = rpx2px(65 * 2)
          const circleY = canvasH - 6*radius

          // 绘制背景
          ctx.setFillStyle(bgColor)
          ctx.fillRect(
            0,
            0,
            canvasW,
            canvasH
          )


          const drawUser = new Promise((resolve) => {
            avatarPromise.then((avatar) => {

              // 绘制头像
              ctx.save()
              ctx.beginPath()
              ctx.arc(canvasW / 4,
                y,
                radius + rpx2px(5), 0, 2 * Math.PI)
              ctx.clip()
              ctx.drawImage(
                avatar.path,
                canvasW / 4 - radius,
                y - radius,
                radius * 2,
                radius * 2
              )
              ctx.setLineWidth(rpx2px(10))
              ctx.setFillStyle('black')
              ctx.stroke()
              ctx.restore()


              // 绘制用户名
              ctx.setFontSize(rpx2px(30))
              ctx.setTextAlign('center')
              ctx.setFillStyle('#F5F5F5')


              ctx.fillText(
                nickName,
                canvasW/4,
                y + radius + rpx2px(38)
              )

              resolve();
            })
          })

          //绘制二维码
          ctx.save()
          ctx.beginPath()
          ctx.arc(canvasW / 4 * 3,
            y,
            radius + rpx2px(5), 0, 2 * Math.PI)
          ctx.clip()
          ctx.drawImage(
            qrCode.path,
            canvasW / 4 * 3 - radius,
            y - radius,
            radius * 2,
            radius * 2
          )
          ctx.setLineWidth(rpx2px(10))
          ctx.setFillStyle('black')
          ctx.stroke()
          ctx.restore()

          // 绘制扫描二维码标语
          const h2size = rpx2px(24)
          ctx.setFontSize(h2size)

          ctx.setTextAlign('center')
          ctx.setFillStyle('lightgray')
          drawText(ctx, crucialMess, canvasW / 4 * 3, y + radius + rpx2px(35), 0, canvasW/2, rpx2px(5)+h2size)

          // 绘制结果标题
          const _h3size = rpx2px(36)
          ctx.setFontSize(_h3size)
          ctx.setTextAlign('center')
          ctx.setFillStyle('#FFE4C4')
          const _textTopY = y + rpx2px(200)
          const _textH
            = drawText(ctx, resultObject.title, canvasW / 2, _textTopY, 0, canvasW - rpx2px(60), rpx2px(3) + _h3size)


          // 绘制结果图片
          ctx.drawImage(
            pic.path,
            rpx2px(30),
            _textTopY + _textH + rpx2px(60),
            canvasW - rpx2px(60),
            rpx2px(520)
          )

          // 绘制结果文案
          const h3size = rpx2px(30)
          ctx.setFontSize(h3size)
          ctx.setTextAlign('center')
          ctx.setFillStyle('white')
          const textTopY = _textTopY + _textH + rpx2px(60) + rpx2px(520)+ rpx2px(60)
          const textH
            = drawText(ctx, resultObject.desc, canvasW/2, textTopY, 0, canvasW-rpx2px(120), rpx2px(3)+h3size)
        
          drawUser.then(() => {
            // 最后完成作画
            
            ctx.draw(false, () => {
              canvasToTempFilePath({
                canvasId: 'share',
              }, this).then(({ tempFilePath }) =>
              {
                this.setData({ imageFile: tempFilePath })
                app.globalData.canvasPath = tempFilePath
              })
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