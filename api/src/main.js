const fs = require("fs")
const express = require("express")
const api = express()
const router = express.Router()

const login = require("./login.js")
const quiz = require("./quiz.js")
const edit = require("./edit.js")

api.use("/api", router)
router.use("/login", login.router)
router.use("/quiz", quiz.router)
router.use("/edit", edit.router)
router.use("/images", express.static("images"))

api.listen(3001, () => {
	if(!fs.existsSync("images"))
	{
		fs.mkdirSync("images")
	}
})
