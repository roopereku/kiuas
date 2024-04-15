import { useContext, useState, useEffect } from "react"
import { MediaContainer, MediaOverlay } from "@react-md/media"
import { TextArea, FileInput } from "@react-md/form"
import { ImageSVGIcon } from "@react-md/material-icons"
import { Chip } from "@react-md/chip"

import QuizContext from "./QuizContext.js"
import EditOnly from "./EditOnly.js"
import "./QuizElement.css"

const QuizElement = ({data, setSettings, setSettingsVisible}) => {
	const ctx = useContext(QuizContext)
	const [ textValue, setTextValue ] = useState("")
	const [ imageValue, setImageValue ] = useState("")

	useEffect(() => {
		setTextValue(data.initialValue)
		setImageValue(data.image)
	}, [data])

	return (
		<MediaContainer
			className={"quizElement " + data.type + "Element"}
		>
			{imageValue !== "" && (
				<img
					className="quizElementImage"
					src={"api/images/" + imageValue}
				/>
			)}

			<MediaOverlay
				className={"quizElementOverlay" + (imageValue === "" ? " quizElementOverlayNoPicture" : "")}
				position="center"
			>
				<TextArea
					className="quizElementText"
					resize="none"
					value={textValue}
					readOnly={!ctx.isEditing}
					onChange={(e) => {
						setTextValue(e.target.value)

						const body = {}
						body[data.type] = e.target.value

						if(data.type === "answer")
						{
							body["answerIndex"] = data.answerIndex
						}

						fetch("api/edit/question/" + ctx.quizId + "/" + ctx.getSelectedQuestion(), {
							method: "POST",
							headers: {
								  'Accept': 'application/json',
								  'Content-Type': 'application/json'
							},
							body: JSON.stringify(body)
						})
					}}
				/>

				<Chip
					leftIcon={<ImageSVGIcon />}
					onClick={() => {
						setSettings({
							title: "Image settings",
							construct: (hideSettings) => {
								return (
									<FileInput
										id="quizImageInput"
										accept="image/*"
										onChange={(e) => {
											const body = new FormData()
											body.append("image", e.target.files[0])

											if(data.type === "answer")
											{
												body.append("answerIndex", data.answerIndex)
											}

											fetch("api/edit/image/" + ctx.quizId + "/" + ctx.getSelectedQuestion(), {
												method: "POST",
												body: body
											})
												.then((res) => res.text())
												.then((id) => {
													setImageValue(id)
													hideSettings()
												})
										}}
										multiple={false}
									>
										Upload an image
									</FileInput>
								)
							}
						})

						setSettingsVisible(true)
					}}
				>
					Image	
				</Chip>
				
				
			</MediaOverlay>

			
		</MediaContainer>
	)
}

export default QuizElement
