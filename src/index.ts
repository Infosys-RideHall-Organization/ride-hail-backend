// server.ts
import http from "http";
import app from "./app";
import dotenv from "dotenv";
import { initSocket } from "./socket";

dotenv.config();

const server = http.createServer(app);
const io = initSocket(server);

app.set("io", io);

// check socket status
app.get("/api/test/socket", (req, res) => {
    const io = req.app.get("io");
    io.emit("test-event", {
        message: "testing",
    });
    res.json({
        success:true,
       message: "Socket.IO event emitted!"
        });
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
