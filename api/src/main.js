const express = require("express")
const api = express()
const router = express.Router()

const login = require("./login.js")
const quiz = require("./quiz.js")

api.use("/api", router)
router.use("/login", login.router)
router.use("/quiz", quiz.router)

api.listen(3001, () => {
})
