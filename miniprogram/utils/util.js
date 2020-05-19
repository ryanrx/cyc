const app = getApp();
const dbUtil = wx.cloud.database();

/* find the index of the maximal number of an array */
const  pickIndexOfMax = array => {
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

const getPlatformType = () => {
  var rtn = '';
  wx.getSystemInfo({
    success: function (res) {
      rtn = res.platform;
    }
  })
  return rtn;
}

const platformType = getPlatformType();

module.exports = {
  pickIndexOfMax: pickIndexOfMax,
  app: app,
  dbUtil: dbUtil,
  platformType: platformType,
}