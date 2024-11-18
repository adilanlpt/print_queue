# Server Print Queue

## ความต้องการของระบบ

- Node.js

## ขั้นตอนการติดตั้ง

1. **ติดตั้ง PM2**  
   ให้ใช้คำสั่งต่อไปนี้เพื่อติดตั้ง PM2 (Process Manager สำหรับ Node.js):
   ```bash
   npm install pm2 -g
2. **ติดตั้ง PM2 Windows Startup สำหรับ Windows, ใช้ pm2-windows-startup เพื่อให้ PM2 เริ่มต้นอัตโนมัติเมื่อระบบเริ่มทำงาน**
   ```bash
   > npm install pm2-windows-startup -g
   > pm2-startup install
3. **คลิกโปรเจกต์ ไปที่โฟลเดอร์โปรเจกต์ที่คุณดาวน์โหลดมา หรือคลิกโฟลเดอร์โปรเจกต์ในเครื่องของคุณ**
    ```bash
   cd /path/to/your/project
4. **ติดตั้ง Dependencies รันคำสั่ง npm install เพื่อดาวน์โหลด dependencies ที่จำเป็นทั้งหมด**
    ````bash
    npm install
5. **เริ่มต้นโปรเจกต์ด้วย PM2 ใช้ PM2 เพื่อเริ่มต้นโปรเจกต์ Node.js ของคุณ**
    ````bash
    pm2 start index.js --name kiosk
6. **บันทึกการตั้งค่า PM2 เพื่อให้ PM2 บันทึกกระบวนการที่กำลังทำงาน เพื่อให้มันสามารถเริ่มทำงานได้เมื่อบูตใหม่**
    ````bash
    pm2 save