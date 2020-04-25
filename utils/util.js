const app = getApp();
const formatTime = date => {

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

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

module.exports = {
  formatTime: formatTime,
  pickIndexOfMax: pickIndexOfMax,
  app: app
}