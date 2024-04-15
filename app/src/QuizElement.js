import { useContext, useState, useEffect } from "react"
import { MediaContainer, MediaOverlay } from "@react-md/media"
import { TextArea, FileInput } from "@react-md/form"
import { ImageSVGIcon } from "@react-md/material-icons"
import { Chip } from "@react-md/chip"

import EditContext from "./EditContext.js"
import EditOnly from "./EditOnly.js"
import "./QuizElement.css"

const QuizElement = ({data, onEdit, setSettings, onImageUpload, setSettingsVisible}) => {
	const isEditing = useContext(EditContext)
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
					readOnly={!isEditing}
					onChange={(e) => {
						setTextValue(e.target.value)
						onEdit(e.target.value)
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
											onImageUpload(e.target.files[0], (resultId) => {
												setImageValue(resultId)
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
