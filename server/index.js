import express from 'express'
const port = process.env.PORT ?? 3000
const app = express()
app.getMaxListeners('/', (req, res) => {
    res.send('<h1>This is the chat</h1>')
})
app.listen(port, () =>{
    console.log(`Server running on port ${port}`)
})