const net = require("net");
const file = require("fs")

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const args = process.argv.slice(2)
const directory = args[1]

 //Uncomment this to pass the first stage
 const server = net.createServer((socket) => {
    socket.on("data",(data)=>{
        const request = data.toString().split("\r\n")
        const requestTarget = request[0].split(" ")[1]
        const userAgent = request[2].split(" ")[1]
        const method = request[0].split(" ")[0]
        if(requestTarget ==="/"){
            socket.write("HTTP/1.1 200 OK\r\n\r\n")}
        else if(requestTarget.startsWith("/echo")){
            const echoString = requestTarget.slice(6)
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${echoString.length}\r\n\r\n${echoString}`)}
        else if(requestTarget.startsWith("/user-agent")){
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`)}
        else if(requestTarget.startsWith("/files" && method==='GET')){
            const filename = requestTarget.split('/files/')[1]
            if(file.existsSync(`${directory}${filename}`)){
                const data = file.readFileSync(`${directory}${filename}`)
                const size = file.statSync(`${directory}${filename}`).size
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${size}\r\n\r\n${data.toString()}`)
            }
            else{
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
            }
        }
        else if(requestTarget.startsWith("/files") && method ==='POST'){
            const filename = requestTarget.split('/files/')[1]
            const data = request[request.length-1]
            file.writeFileSync(`${directory}${filename}`, data)
            socket.write("HTTP/1.1 201 Created\r\n\r\n")
        }
        else{
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
    })
   socket.on("close", () => {
     socket.end();
   });
 });

 server.listen(4221, "localhost");
