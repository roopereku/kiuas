const pg = require("pg")
require("dotenv").config()

if(!("DB_USER" in process.env))
{
	throw "Missing the database username. Add DB_USER to .env"
}

if(!("DB_PASS" in process.env))
{
	throw "Missing the database password. Add DB_PASS to .env"
}

const client = new pg.Client({
	host: ("DB_HOST" in process.env ? process.env.DB_HOST : "localhost"),
	port: ("DB_PORT" in process.env ? parseInt(process.env.DB_PORT) : 5432),
	database: "kiuas",
	user: process.env.DB_USER,
	password: process.env.DB_PASS
})

client.connect((err) => {
	if(err)
	{
		throw err
	}

	console.log("Connected to postgres")

	client.query(`CREATE TABLE IF NOT EXISTS quiz (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		category TEXT NOT NULL
	);`)

	client.query(`CREATE TABLE IF NOT EXISTS revision (
		id TEXT PRIMARY KEY,
		quizid TEXT NOT NULL,
		authorized TEXT [],
		questions TEXT []
	);`)

	client.query(`CREATE TABLE IF NOT EXISTS question (
		id TEXT PRIMARY KEY,
		question TEXT NOT NULL,
		questions TEXT []
	);`)
})

module.exports.query = (detail, params = []) => {
	return new Promise((resolve) => {
		client.query(detail, params, (err, result) => {
			if(err)
			{
				throw err
			}

			resolve(result.rows)
		})
	})
}
