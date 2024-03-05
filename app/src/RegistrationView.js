import { useState } from "react"
import { Button } from "@react-md/button";
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { Form, TextFieldWithMessage, useTextField, PasswordWithMessage, FormThemeProvider } from "@react-md/form";

const RegistrationView = () => {
	const [username, usernameProps] = useTextField({
		id: "usernameInput",
		required: true
	})

	const [password, passwordProps] = useTextField({
		id: "passwordInput",
		required: true
	})

	return (
		<FormThemeProvider theme="underline">
			<Form>
				<TextFieldWithMessage
					{...usernameProps}
					placeholder="Username"
				/>

				<PasswordWithMessage
					{...passwordProps}
					placeholder="Password"
				/>

				<Button
					type="submit"
					onClick={(e) => {
						if(username.length > 0 && password.length > 0)
						{
							// TODO: Do error handling.
							fetch("api/login/register", {
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
						}
					}}
				>
					Register
				</Button>	
			</Form>
		</FormThemeProvider>
	)
}

export default RegistrationView
