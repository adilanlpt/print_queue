
const fs = require('fs');
const io = require('socket.io-client');
const PDFDocument  = require('pdfkit');
const { getPrinters, print } = require('pdf-to-printer');
require('dotenv').config();

const socket = io(`${process.env.SOCKET_URI}/printer`);

function createqueue(ward, room, queue,qlength) {

    queue = `${queue.match(/[a-zA-Z]+/g)?queue.match(/[a-zA-Z]+/g)[0]:''}${queue.match(/\d+/g)[0]}`;

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ 
            size: [227, 227] ,
            margins : { top: 0, bottom: 0, left: 10, right: 10 }
        }); // กำหนดขนาดเป็น A4
        const outputPath = './output.pdf';
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        doc.font('./THSarabunNew.ttf'); // เปลี่ยนเป็นฟอนต์ที่คุณต้องการใช้
        // เขียนข้อความลงใน PDF
        doc.lineGap(0);
        doc.fontSize(20).text(ward, {
            align: 'left',
            fontSize:30,
            width:100,
            lineGap:-10
        });
        doc.fontSize(100).text(queue, 0,30,{
            align: 'center'
        });
        doc.fontSize(20).text(`เหลืออีก ${qlength} คิว`, 0,120, {
            align: 'center'
        });

        doc.text(`ห้องบริการ: ${room}`, 135,0,{
            align: 'left'
        });
        doc.text('คิวที่', 30,42,{
            align: 'left'
        });

        // ปิดการเขียน PDF
        doc.end();

        writeStream.on('finish', () => {
            resolve(outputPath);
        });

        writeStream.on('error', err => {
            reject(err);
        });
    });
}


socket.on('getprinter', async() => {

    getPrinters()
    .then(result=>{
        socket.emit('printer', result);
    })
    .catch((err) => {
        socket.emit('printer', []);
    });
});

socket.on('print', (data) => {
    try {
         createqueue(data.ward,data.room,data.queue,data.qlength).then((path)=>{
            print(path,{printer: data.printer});
        });
    } catch (error) {
        console.log(error)
    }
});
