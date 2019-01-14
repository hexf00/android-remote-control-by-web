// 获取本机IP
function getLocalIp() {
    var ipText = shell("ifconfig | grep -A 1 wlan")
    ipText = ipText.toString()
    result = ipText.match(/inet\saddr:(\d+\.\d+\.\d+\.\d+)/)

    if (result) {
        var ip = result[1]
        return ip
    } else {
        return false
    }
}

module.exports = {
    getLocalIp : getLocalIp
}