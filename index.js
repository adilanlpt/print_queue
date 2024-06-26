
const fs = require('fs');
const io = require('socket.io-client');
const PDFDocument  = require('pdfkit');
const { getPrinters, print } = require('pdf-to-printer');
require('dotenv').config();

const socket = io(`${process.env.SOCKET_URI}/printer`);

function createqueue(data) {

    data.queue = `${data.queue.match(/[a-zA-Z]+/g)?data.queue.match(/[a-zA-Z]+/g)[0]:''}${data.queue.match(/\d+/g)[0]}`;

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ 
            size: [227, 227] ,
            margins : { top: 0, bottom: 0, left: 10, right: 10 }
        }); // กำหนดขนาดเป็น A4
        const outputPath = './output.pdf';
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        doc.registerFont('normal', './THSarabunNew.ttf');
        doc.registerFont('Bold', './THSarabunNew Bold.ttf');
        doc.font('normal');
        // เขียนข้อความลงใน PDF
        doc.lineGap(0);
        for(let i=0;i<data.quntity;i++){

            doc.fontSize(20).text(data.ward, {
                align: 'left',
                fontSize:30,
                width:100,
                lineGap:-10
            });
            doc.font('Bold');
            doc.text(`${data.labelroom}บริการ: `, 135,0,{
                align: 'left'
            });
            doc.fontSize(100).text(data.queue, 0,30,{
                align: 'center'
            });
            doc.font('normal').fontSize(20);
            doc.text(data.room, 195,0, {align:'center'});
            doc.text(`เหลืออีก ${data.qlength} คิว`, 0,120, {
                align: 'center'
            });
            doc.text('คิวที่', 30,42,{
                align: 'left'
            });

            doc.addPage()
            
        }

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

         createqueue(data).then((path)=>{
            print(path,{printer: data.printer});
        });
    } catch (error) {
        console.log(error)
    }
});
