
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
            size: [80 * 2.834645669, 80 * 2.834645669], // Convert mm to points
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });
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
                width: 40 * 2.834645669,
                lineGap:-10
            });
            doc.font('Bold');
            doc.text(`${data.labelroom}บริการ: ${data.room}`, 40 * 2.834645669,0,{
                align: 'right',
                width: 40 * 2.834645669,
            });
            doc.fontSize(100).text(data.queue, 0,30,{
                align: 'center'
            });
            doc.font('normal').fontSize(20);
            doc.text(`เหลืออีก ${data.qlength} คิว`, 0,120, {
                align: 'center'
            });
            doc.text('คิวที่', 30,42,{
                align: 'left'
            });

            if(i+1<data.quntity)doc.addPage();
            
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
