// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
const multer = require('multer')
const app = express();
const PDFDocument = require('pdfkit');
const fs = require('fs');

dotenv.config();
app.use(cors());
app.use(bodyParser.json());


const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {

  // console.log(
  //   req.body
  // );
  const imagePath = req.file.path;
  const pdfPath = `${imagePath}.pdf`;

  // Create a new PDF document
  const pdfDoc = new PDFDocument();
  const pdfStream = fs.createWriteStream(pdfPath);

  pdfDoc.image(imagePath, { fit: [400, 300] }); // Adjust the size as needed

  pdfDoc.pipe(pdfStream);
  pdfDoc.end();

  pdfStream.on('finish', () => {
    // Remove the uploaded image after creating the PDF
    fs.unlinkSync(imagePath);

    // Example: Sending a success response with the PDF link
    const pdfLink = `/pdfs/${req.file.filename}.pdf`;

    // Send the PDF link in the response
    res.status(200).json({ message: 'Image converted to PDF successfully!', pdfLink });
  });

  pdfStream.on('error', (error) => {
    console.error('Error creating PDF:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});


// Serve PDF files
app.get('/pdfs/:filename.pdf', (req, res) => {
  const pdfPath = `uploads/${req.params.filename}.pdf`;

  // Set appropriate headers for a PDF response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}.pdf`);

  const pdfStream = fs.createReadStream(pdfPath);
  pdfStream.pipe(res);
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
