import AWS from 'aws-sdk'

const KEY_ID = "AKIASAEM7RK3KALRSB53"
const SECRET_KEY = "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"
import fs from 'fs'
import mime from 'mime'
import multer from 'multer'
import express from "express";
import cors from "cors";
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());

const Bucket_Name = "basecamp-group-media"

const s3 = new AWS.S3(
    {
        accessKeyId: KEY_ID,
        secretAccessKey: SECRET_KEY
    }
)

const acl = 'public-read'
const generateRandomString = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}
const uploadFileFromPath = (filePath) => {
    console.log(filePath)
    let ext = path.extname(filePath)
    const fileContent = fs.readFileSync(filePath)

    let params = {
        Bucket: Bucket_Name,
        Key: generateRandomString(10) + ext,
        Body: fileContent,
        ContentType: mime.getType(filePath),
        ACL: acl
    }
    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            fs.unlinkSync(filePath) // delete the file from disk
            console.log("URL:", data.Location)
        }
    })
}
const deleteFileFromS3 = (fileName) => {
    const params = {
        Bucket: Bucket_Name,
        Key: fileName
    };
    console.log(params)

    s3.deleteObject(params, (err, data) => {
        if (err) {
            throw err;
        }
        console.log(`File deleted successfully. ${fileName}`);
    });
};

//deleteFileFromS3('XfXZijaFBc.jpg')


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
})

const upload = multer({storage: storage})

app.post("/api", upload.array("files"), (req, res) => {
    uploadFileFromPath(req.files[0].path)
    res.json({message: "File(s) uploaded successfully"});

});


app.listen(5000, function () {
    console.log("Server running on port 5000");
});
