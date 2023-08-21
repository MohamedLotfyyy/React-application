const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST)
const bodyParser = require("body-parser")

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname + '/fileUpload');
  },
  filename: function (req, file, callback) {
    const chunkIndex = parseInt(req.headers['x-chunk-index']);
    const originalFilename = req.headers['x-original-filename'];
    const ext = originalFilename.split('.').pop();
    const tmpFilename = originalFilename + '_' + chunkIndex + '.' + ext;
    callback(null, tmpFilename);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.get('/fileUpload', (req, res) => {
  res.send('Hello World!');
});

app.post('/fileUpload', upload.array('file'), (req, res) => {
  const totalChunks = parseInt(req.headers['x-total-chunks']);
  const chunkIndex = parseInt(req.headers['x-chunk-index']);
  const originalFilename = req.headers['x-original-filename'];
  const ext = originalFilename.split('.').pop();
  const tmpFilename = originalFilename + '_' + chunkIndex + '.' + ext;
  const finalFilename = originalFilename;

  if (chunkIndex === totalChunks - 1) {
    // Last chunk, combine all chunks into the final file
    const filePath = __dirname + '/fileUpload/' + finalFilename;
    const writeStream = fs.createWriteStream(filePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = __dirname + '/fileUpload/' + originalFilename + '_' + i + '.' + ext;
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData); // Append the chunk to the final file
      fs.unlinkSync(chunkPath); // Delete the chunk file
    }

    writeStream.end(); // End the write stream

    res.json({ finalFilename });
  } else {
    res.json('ok');
  }
});

app.post("/payment", cors(), async (req, res) => {
	let { amount, id } = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount,
			currency: "USD",
			description: "PlusOne Health",
			payment_method: id,
			confirm: true
		})
		console.log("Payment", payment)
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false
		})
	}
}) // payment

app.post("/form", cors(), (req, res) => {
  formData = req.body;
  console.log(formData);
  res.json({
    name: req.body.name,
  });
}); // name email phone complain


app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
