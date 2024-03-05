import { useState, useEffect } from "react"
import { Button } from "@react-md/button";
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import RegistrationView from "./RegistrationView.js"
import "./Login.css"

const LoginChecker = ({setLoginDone}) => {
	const [initialCheckDone, setInitialCheckDone] = useState(false)

	useEffect(() => {
		fetch("api/login/check")
			.then((res) => {
				// If the login check returns "401 Unauthorized", show the login page.
				if(res.status === 401)
				{
					setInitialCheckDone(true)
					setLoginDone(false)
				}

				else if(res.status === 200)
				{
					setInitialCheckDone(true)
					setLoginDone(true)
				}

				else throw "Weird login check status"
			})
	})

	return (
		// Wait for the initial login check to be done.
		// Once it's done, render the login page if the user hasn't logged in.
		<div className="App">
			<header className="App-header">
				{initialCheckDone ? (
					<LoginPage setLoginDone={setLoginDone} />
				) : (<p>Loading...</p>)}
			</header>
		</div>
	);
}

const LoginPage = ({setLoginDone}) => {
	const [ username, setUsername ] = useState("")
	const [ password, setPassword ] = useState("")

	const [ error, setError ] = useState("")
	const [registrationVisible, setRegistrationVisible] = useState(false)

	const handleSubmit = (e) => {
		e.preventDefault()

		// Send the crendentials to the backend.
		fetch("api/login/", {
			method: "POST",
			headers: {
				"Accept": "application/json, text/plain, */*",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				username: username,
				password: password
			})
		})
		.then((res) => {
			// If the login check returns "401 Unauthorized", the credential were incorrect.
			if(res.status === 401)
			{
				setError("Your username or password was incorrect.")
			}

			// If the login check returns "400 Bad request", something weird was sent.
			else if(res.status === 400)
			{
				setError("Something went wrong.")
			}

			else if(res.status === 200)
			{
				setLoginDone(true)
			}

			else throw "Weird authentication status"
		})
	}

	const handleUsernameChange = (e) => {
		setUsername(e.target.value)
	}

	const handlePasswordChange = (e) => {
		setPassword(e.target.value)
	}

	return (
		<div id="loginContainer">
			<form onSubmit={handleSubmit}>
				<input type="text" className="loginField" placeholder="Username" value={username} onChange={handleUsernameChange} required /> 
				<input type="password" className="loginField" placeholder="Password" value={password} onChange={handlePasswordChange} required />

				<input type="submit" id="loginSubmit" value="Login"/>
				<label htmlFor="loginSubmit">{error}</label>
			</form>

			<Button
				themeType="contained"
				theme="primary"
				onClick={() => setRegistrationVisible(true)}
			>
				Register
			</Button>

			<Dialog
				visible={registrationVisible}
				onRequestClose={() => setRegistrationVisible(false)}
			>
				<DialogContent>
					<RegistrationView />
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default LoginChecker
