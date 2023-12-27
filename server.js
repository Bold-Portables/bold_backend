const http = require('http');
const app = require('./app');
const socket = require("socket.io");
const port = process.env.PORT || 4000;
const server = http.createServer(app);
console.log(`Server is listening at PORT:-${port}`)
server.listen(port);
const io = socket(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        credentials: true,
    },
});

io.on("connection", (socket) => {
    // socket.emit('newOrder', order);
    socket.on('new_order', (order) => {
        console.log('new order received:', order);

        // emit the new order event to the admin panel
        io.emit('new_order_recieved', order);
    });

    socket.on('new_quote', (quote) => {
        console.log('new quote received:', quote);

        // emit the new quote event to the admin panel
        io.emit('new_quote_recieved', quote);
    });

    // Send a cancel order event to the user panel
    socket.on('cancel_order', (data) => {
        console.log('cancel order received for orderId:', data.orderId, 'order:', data.order);

        // emit the cancel order event to the user panel
        io.emit('cancel_order_received', data.order);
    });

    // Send a cancel order event to the user panel
    socket.on('update_quote', (data) => {
        console.log('Quote has been sent to user:', data);

        // emit the cancel order event to the user panel
        io.emit('update_quote_received', data);
    });

    socket.on('user_request_service', (data) => {
        console.log('user request service Data :', data);
        // emit the cancel order event to the user panel
        io.emit('request_service_received', data);
    });

    socket.on('save_location', (data) => {
        io.emit('received_location', data);
    });

    socket.on('resolved_service', (data) => {
        io.emit('resolved_service', data);
    });
})



module.exports = { server, io };
