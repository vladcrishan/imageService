const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000

const shapesDirectory = './shapes'

// initialize shapes
let shapesPath = []
fs.readdir(shapesDirectory, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err)
  }

  files.forEach(file => shapesPath.push(`${shapesDirectory}/${file}`))
  console.log(shapesPath)
})

app.use(fileUpload())
app.get('/', (req, res) => res.send('presentationToolService is running!'))
app.get('/download/shape', (req, res) => {
  res.sendfile(`${shapesDirectory}/ubuntu.png`)
  console.log(shapesPath)
})
app.post('/upload/shape', (req, res) => {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.')
  }

  let shape = req.files.data

  shape.mv(`${shapesDirectory}/${req.files.data.name}`, err => {
    if (err) return res.status(500).send(err)
  })

  if (shapesPath.indexOf(shape) === -1)
    shapesPath.push(`${shapesDirectory}/${req.files.data.name}`)
  console.log(shapesPath)
  return res.send('200')
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
