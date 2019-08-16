import express from 'express'
import fileUpload from 'express-fileupload'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const shapesDirectory = path.join(__dirname, 'shapes')
let shapePaths = []
InitializeShapes()

// initialize shapes
function InitializeShapes() {
  fs.readdir(shapesDirectory, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err)
    }

    files.forEach(file => shapePaths.push(path.join(shapesDirectory, file)))
    console.log('Initialized shapes')
    console.log(shapePaths)
  })
}

app.use(fileUpload())

app.get('/', (req, res) => res.send('imageService is running!'))

app.get('/download/shape', (req, res) => {
  console.log('GET /download/shape')
  res.sendFile(shapePaths.pop())
  if (!shapePaths.length) InitializeShapes()
})

app.post('/upload/shape', (req, res) => {
  console.log('POST /upload/shape')
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.')
  }

  const shape = req.files.data
  const shapePath = path.join(shapesDirectory, shape.name)
  shape.mv(shapePath, err => {
    if (err) return res.status(500).send(err)
  })

  if (shapePaths.indexOf(shape) === -1) shapePaths.push(shapePath)
  console.log(shapePaths)
  return res.send('Image uploaded successfully')
})

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
)
