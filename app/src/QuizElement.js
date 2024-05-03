import { useContext, useState, useEffect } from "react"
import { MediaContainer, MediaOverlay } from "@react-md/media"
import { TextArea, FileInput } from "@react-md/form"
import { ImageSVGIcon, RemoveCircleOutlineSVGIcon } from "@react-md/material-icons"
import { TextIconSpacing } from "@react-md/icon"
import { Button } from "@react-md/button"
import { Chip } from "@react-md/chip"

import QuizContext from "./QuizContext.js"
import EditOnly from "./EditOnly.js"
import "./QuizElement.css"

const QuizElement = ({data, setSettings, setSettingsVisible}) => {
	const ctx = useContext(QuizContext)
	const [ textValue, setTextValue ] = useState("")
	const [ imageValue, setImageValue ] = useState("")

	const getTextStyling = () => {
		// Hide outlines and hover animations for questions
		// when outside editing mode.
		if(!ctx.isEditing && data.type === "question")
		{
			return "unstyled"
		}

		return "outline"
	}

	const isReadOnly = () => {
		if(ctx.isEditing || data.type === "answer")
		{
			return false
		}

		return true
	}

	useEffect(() => {
		setTextValue(data.value)
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
					theme={getTextStyling()}
					resize="none"
					value={textValue}
					readOnly={isReadOnly()}
					onChange={(e) => {
						setTextValue(e.target.value)
						data.value = e.target.value

						if(ctx.isEditing)
						{
							fetch("api/edit/question/" + ctx.quizId + "/" + ctx.getSelectedQuestion(), {
								method: "POST",
								headers: {
									  'Accept': 'application/json',
									  'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									value: e.target.value,
									index: data.index
								})
							})
						}
					}}
				/>

				<EditOnly>
					<Chip
						leftIcon={<ImageSVGIcon />}
						onClick={() => {
							setSettings({
								title: "Image settings",
								construct: (hideSettings) => {
									return (
										<div>
											<FileInput
												id="quizImageInput"
												accept="image/*"
												onChange={(e) => {
													const body = new FormData()
													body.append("image", e.target.files[0])
													body.append("index", data.index)

													fetch("api/edit/image/add/" + ctx.quizId + "/" + ctx.getSelectedQuestion(), {
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

											<Button
												themeType="contained"
												theme="primary"
												onClick={() => {
													fetch("api/edit/image/remove/" + ctx.quizId + "/" + ctx.getSelectedQuestion(), {
														method: "POST",
														headers: {
															  'Accept': 'application/json',
															  'Content-Type': 'application/json'
														},
														body: JSON.stringify({
															index: data.index
														})
													})
														.then((res) => {
															setImageValue("")
															hideSettings()
														})
												}}
											>
												<TextIconSpacing icon={<RemoveCircleOutlineSVGIcon />}>
													Remove image
												</TextIconSpacing>
											</Button>
										</div>
									)
								}
							})

							setSettingsVisible(true)
						}}
					>
						Image	
					</Chip>
				</EditOnly>				
			</MediaOverlay>

			
		</MediaContainer>
	)
}

export default QuizElement
