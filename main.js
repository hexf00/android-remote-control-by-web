// @author hexf00
// @date 2019年1月14日
toastLog("第一次启动会跳转到无障碍权限列表进行授权，授权后再次启动本程序等待数秒服务启动，本提示每次启动都显示，已经授权等待即可。")

auto();

if (!requestScreenCapture()) {
    toast("请求截图失败");
    exit
}

var screenUri;
var runRoot = files.cwd()
var lib;

// 由于auto.js的原因，需要对jquery的文件名进行修改
if (runRoot == "/storage/emulated/0/脚本") {
    // 开发模式
    runRoot = "/storage/emulated/0/脚本/android-remote-control-by-web"

    lib = require(runRoot + '/lib.js')
    if (!files.isFile(runRoot + "/remote.html") || !files.isFile(runRoot + "/jquery.bin")) {
        toastLog("文件缺失，exit")
    }
    jqRawData = files.read(runRoot + "/jquery.bin")
    indexRawData = files.read(runRoot + "/remote.html")
} else {
    //生产模式
    lib = require('lib.js');
    if (!files.isFile(files.path("remote.html")) || !files.isFile(files.path("jquery.bin"))) {
        toastLog("文件缺失，exit")
    }
    jqRawData = files.read(files.path("jquery.bin"))
    indexRawData = files.read(files.path("remote.html"))
}







importClass("android.graphics.Bitmap")
importClass("android.graphics.Matrix")
importClass("java.io.ByteArrayOutputStream")
importClass("java.nio.charset.Charset")
importClass("java.net.InetSocketAddress")

runtime.loadJar("./lotus.jar");
importClass("lotus.http.server.HttpMethod")
importClass("lotus.http.server.HttpRequest")
importClass("lotus.http.server.HttpResponse")
importClass("lotus.http.server.HttpServer")
importClass("lotus.http.server.support.HttpHandler")

var server = new HttpServer();
server.openWebSocket(true);
server.setReadBufferCacheSize(1024 * 4);
server.setEventThreadPoolSize(10);
server.setCharset(Charset.forName("utf-8"));


var matrix = new Matrix();
matrix.preScale(0.5, 0.5);

handler = new HttpHandler({
    service: function (method, req, res) {
        var path = req.getPath()
        if (path == "/swipe") {
            x1 = parseInt(req.getParameter("x1", 0))
            y1 = parseInt(req.getParameter("y1", 0))
            x2 = parseInt(req.getParameter("x2", 0))
            y2 = parseInt(req.getParameter("y2", 0))
            duration = parseInt(req.getParameter("duration", 0))
            swipe(x1, y1, x2, y2, duration)
            res.write("200")
        } else if (path == "/screen") {
            res.setHeader("Content-Type", "image/jpeg");
            // 截图不能并发请求
            var jietu = function () {
                var img = captureScreen();
                bm = img.getBitmap()
                newBM = Bitmap.createBitmap(bm, 0, 0, bm.getWidth(), bm.getHeight(), matrix, false);

                baos = new ByteArrayOutputStream();
                newBM.compress(Bitmap.CompressFormat.JPEG, 60, baos);
                res.write(baos.toByteArray());
            }
            var syncJietu = sync(jietu);
            syncJietu()
        } else if (path == "/") {
            res.write(indexRawData.replace(/{{screen_uri}}/g, screenUri))
        } else if (path == "/jquery.js") {
            res.setHeader("Content-Type", "application/x-javascript");
            res.write(jqRawData)
        } else {
            res.write("404")
        }

    }
})

server.addHandler("*", handler)

var port = Math.ceil(Math.random() * 55535) + 10000
screenUri = "http://" + lib.getLocalIp() + ":" + port
server.start(new InetSocketAddress(port));

toastLog("请在安全的局域网环境内使用。")

alert("远程服务启动成功，请打开电脑浏览器访问" + screenUri + "\n请不要用于作恶，源码请查看github.com/hexf00")
log("远程服务启动成功，请打开电脑浏览器访问" + screenUri + "\n请不要用于作恶，源码请查看github.com/hexf00")
//server.stop();
setInterval(() => {}, 1000);