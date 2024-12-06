const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

 //Uncomment this to pass the first stage
 const server = net.createServer((socket) => {
    socket.on("data",(data)=>{
        const request = data.toString().split("\r\n")
        const requestTarget = request[0].split(" ")[1]
        if(requestTarget ==="/"){
            socket.write("HTTP/1.1 200 OK\r\n\r\n")}
        else if(requestTarget.startsWith("/echo")){
            const echoString = requestTarget.slice(6)
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${echoString.length}\r\n\r\n${echoString}`)}
    })
   socket.on("close", () => {
     socket.end();
   });
 });

 server.listen(4221, "localhost");
