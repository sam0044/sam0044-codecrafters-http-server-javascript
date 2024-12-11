const net = require("net");
const file = require("fs")
const zlib = require('zlib')


// Constants

const HTTP_CODE = {
    OK : "HTTP/1.1 200 OK",
    CREATED : "HTTP/1.1 201 Created",
    NOT_FOUND : "HTTP/1.1 404 Not Found"
}
const PORT = 4221;
const HOST = "localhost";
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const args = process.argv.slice(2)
const directory = args[1]


const routeHandlers = {
    async handleRoot(socket){
        socket.write(`${HTTP_CODE.OK}\r\n\r\n`)}
    ,

    async handleEcho(socket,headers,requestTarget){
        const echoString = requestTarget.slice(6)
        const compressedData = zlib.gzipSync(echoString);
        if (headers['accept-encoding']?.includes('gzip')){
                socket.write(`${HTTP_CODE.OK}\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${compressedData.length}\r\n\r\n`)
                socket.write(compressedData)
            }
        else{
            socket.write(`${HTTP_CODE.OK}\r\nContent-Type: text/plain\r\nContent-Length: ${echoString.length}\r\n\r\n${echoString}`)}
    },
    async handleAgent(socket, headers){
        const userAgent = headers['user-agent']
        socket.write(`${HTTP_CODE.OK}\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`)
    },
    async handleFiles(socket,method,request,directory){
        const requestTarget = request[0].split(" ")[1]
        const filename = requestTarget.split('/files/')[1]
        const filePath = `${directory}${filename}`
        if (method ==="GET"){
            if(!file.existsSync(filePath)){
                socket.write(`${HTTP_CODE.NOT_FOUND}\r\n\r\n`)
            }
            const data = file.readFileSync(filePath)
            const size = file.statSync(filePath).size
            socket.write(`${HTTP_CODE.OK}\r\nContent-Type: application/octet-stream\r\nContent-Length: ${size}\r\n\r\n${data.toString()}`)
        }
        else{
            file.writeFileSync(filePath, request[request.length-1])
            socket.write(`${HTTP_CODE.CREATED}\r\n\r\n`)
        }
    }
    
}

 //Uncomment this to pass the first stage
 const server = net.createServer((socket) => {
    socket.on("data", async (data)=>{
        const request = data.toString().split("\r\n")
        const requestTarget = request[0].split(" ")[1]
        const headers = {}
        let i =1
        while(i<request.length && request[i]!==''){
            const [key,value]=request[i].split(': ')
            headers[key.toLowerCase()] = value
            i++
        }
        const method = request[0].split(" ")[0]
        if (requestTarget === "/") {
            routeHandlers.handleRoot(socket);
          } else if (requestTarget.startsWith("/echo")) {
            routeHandlers.handleEcho(socket,headers,requestTarget);
          } else if (requestTarget.startsWith("/user-agent")) {
            routeHandlers.handleUserAgent(socket, headers);
          } else if (requestTarget.startsWith("/files")) {
            routeHandlers.handleFiles(socket, method, request, directory);
          } else {
            socket.write(`${HTTP_CODE.NOT_FOUND}\r\n\r\n`);
          }
        
    })
   socket.on("close", () => {
     socket.end();
   });
 });

 server.listen(PORT,HOST);
