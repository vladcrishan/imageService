const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const chalk = require('chalk')

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
  console.log(chalk.blue('GET /download/shape'))

  let shapePath = shapePaths.pop()
  let shapeName = path.basename(shapePath)
  res.setHeader('Shape-Name', shapeName)
  console.log('Returned image:', shapeName)

  res.sendFile(shapePath)
  if (!shapePaths.length) InitializeShapes()
})

app.post('/upload/shape', (req, res) => {
  console.log(chalk.blue('POST /upload/shape'))

  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.')
  }

  const shape = req.files.data
  console.log('Received image: ', shape.name)
  const shapePath = path.join(shapesDirectory, shape.name)
  shape.mv(shapePath, err => {
    if (err) return res.status(500).send(err)
  })

  // If Image with same name uploaded, skip adding it to shapePaths.
  // It means an existing image was updated.
  if (shapePaths.indexOf(shapePath) === -1) shapePaths.push(shapePath)
  console.log(shapePaths)
  return res.send('Image uploaded successfully')
})

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!
  ${chalk.red('Paths')}               ${chalk.red('Description')}
  /                   Health check
  /download/shape     Downloads one shape at a time with 'Shape-Name' property in the Header
  /upload/shape       Upload a shape`)
)
