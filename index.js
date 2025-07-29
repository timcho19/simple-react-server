const express = require('express')
const app = express()
const port = 8000
const cors = require('cors')
const multer  = require('multer')

let corsOptions = {
  origin: '*', // Allow only a specific origin
  credentials: true,            // Enable cookies and credentials
};
app.use(express.json());//json
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use('/uploads', express.static('uploads'));

//파일 업로드
const storage = multer.diskStorage({
  destination:  (req, file, cb)=> {
    cb(null, 'uploads')
  },
  filename: (req, file, cb)=> {
    const uniquepreffix = Date.now() + '-' + Math.round(Math.random() * 10)
    cb(null, `${uniquepreffix}-${file.originalname}`);
  }
})

const upload = multer({ storage: storage })


const mysql = require('mysql')
const db = mysql.createConnection({
  host: 'localhost',
  user: 'react_bbs',
  password: 'react_bbs1234',
  database: 'react_bbs'
})

db.connect()

app.get('/', (req, res) => {
  db.query("INSERT INTO requested (name) VALUES ('홍길동')", (err, rows, fields) => {
    if (err) throw err
  
    res.send('success');
  })
})
app.get('/list', (req, res) => {
  db.query("SELECT BOARD_ID, BOARD_TITLE,REGISTER_ID, DATE_FORMAT(REGISTER_DATE, '%Y-%m-%d') AS REGISTER_DATE FROM BOARD", (err, result) => {
    if (err) throw err  
    res.send(result);
  })
})

app.get('/detail', (req, res) => {
  const id = req.query.id;
  db.query("SELECT * FROM BOARD WHERE BOARD_ID = ?",[id], (err, result) => {
    if (err) throw err  
    console.log(id);
    res.send(result);
  })
})

app.post('/insert', upload.single('image'), (req, res) => {
  const {title, content} = req.body;
  const imagePath = req.file ? req.file.path: null;//이미지 경로

  db.query("INSERT INTO BOARD (BOARD_TITLE, BOARD_CONTENT,IMAGE_PATH, REGISTER_ID) VALUES (?,?,?,'admin')",[title,content, imagePath], (err, result) => {
    if (err) throw err  
    res.send(result);
  })  

})
app.post('/modify', (req, res) => {
  const {id, title, content} = req.body;

  db.query(`UPDATE BOARD SET BOARD_TITLE=?,  BOARD_CONTENT=? WHERE BOARD_ID=${id}`,[title,content], (err, result) => {
    if (err) throw err  
    res.send(result);
  })  

});

app.post('/delete', (req, res) => {
  const {boardIDList} = req.body;

  db.query(`DELETE FROM board WHERE BOARD_ID in (${boardIDList})`, (err, result) => {
    if (err) throw err  
    res.send(result);
  })  

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
