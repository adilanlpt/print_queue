
const fs = require('fs');
const io = require('socket.io-client');
const PDFDocument  = require('pdfkit');
const { getPrinters, print } = require('pdf-to-printer');
const os = require('os');
require('dotenv').config();

// Get network interfaces
const networkInterfaces = os.networkInterfaces();

// Function to get the server IP addresses
const getServerIpAddresses = () => {
  const addresses = [];

  for (const interfaceName in networkInterfaces) {
    const interfaceInfo = networkInterfaces[interfaceName];

    for (const info of interfaceInfo) {
      if (info.family === 'IPv4' && !info.internal) {
        addresses.push(info.address);
      }
    }
  }

  return addresses;
};

const socket = io(`${process.env.SOCKET_URI}/printer`);

function createqueue(ward,queue,qlength) {
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
            fontSize:30
        });
        doc.fontSize(100).text(queue.toString().padStart(3, '0'),{
            align: 'center'
        });
        doc.fontSize(20).text(`เหลืออีก ${qlength} คิว`, 0,120, {
            align: 'center'
        });
        doc.text('คิวที่', 35,45,{
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


socket.on('getprinter', () => {

    getPrinters()
    .then(result=>{
        socket.emit('printer', result);
    })
    .catch(() => {
        socket.emit('printer', {});
    });
});

socket.on('print', (data) => {
    try {
         createqueue(data.ward,data.queue,data.qlength).then((path)=>{
            print(path,{printer: data.printer});
        });
    } catch (error) {
        console.log(error)
    }
});
