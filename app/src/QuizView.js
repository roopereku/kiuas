import { useState, useEffect } from "react"
import { Button } from "@react-md/button"
import { Chip } from "@react-md/chip"
import { Sheet } from "@react-md/sheet";
import { TextIconSpacing } from "@react-md/icon"
import { MediaContainer } from "@react-md/media"
import { Overlay } from "@react-md/overlay";
import { TextField, FileInput, } from "@react-md/form";
import { AppBar } from "@react-md/app-bar";

import EditContext from "./EditContext.js"
import EditOnly from "./EditOnly.js"
import QuizElement from "./QuizElement.js"
import "./QuizView.css"

import
{
	TocSVGIcon,
	ChevronLeftSVGIcon,
	ChevronRightSVGIcon,
	AddCircleSVGIcon,
	RemoveCircleSVGIcon,
}

from "@react-md/material-icons"

const QuizView = ({selected}) => {
	const [quizName, setQuizName] = useState(selected.name)
	const [questionIds, setQuestionIds] = useState([])
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [selectorsVisible, setSelectorsVisible] = useState(false)
	const [imageOverlayVisible, setImageOverlayVisible] = useState(false)
	const [focusedImage, setFocusedImage] = useState("")

	const [quizElements, setQuizElements] = useState([])

	useEffect(() => {
		if(selected.isNew)
		{
			return
		}

		else if(selected.isEditing)
		{
			console.log("Get edit from " + selected.id)
			fetch("api/edit/questionids/" + selected.id)
				.then((res) => res.json())
				.then((ids) => {
					setQuestionIds(ids)
					showQuestion(ids[0])
				})
		}

		else
		{
			// TODO: Get revision from QuizSelector.
			fetch("api/quiz/questionids/" + selected.id + "/XXXX")
				.then((res) => res.json())
				.then((ids) => {
					setQuestionIds(ids)
					showQuestion(ids[0])
				})
		}
	}, [])

	const showQuestion = (id) => {
		const updateData = (json) => {
			console.log("Show", json)
			setQuizElements([{
					type: "question",
					initialValue: json.question
			}]
			.concat(
				json.answer.map((answer, answerIndex) => {
					return {
						type: "answer",
						initialValue: answer,
						answerIndex: answerIndex
					}
				})
			))
		}

		if(selected.isEditing)
		{
			// Get question data from the given editing context.
			fetch("api/edit/question/" + selected.id + "/" + id)
				.then((res) => res.json())
				.then((json) => {
					updateData(json)		
				})
		}

		else
		{
			fetch("api/quiz/question/" + id)
				.then((res) => res.json())
				.then((json) => {
					updateData(json)		
				})
		}
	}

	return (
		<EditContext.Provider value={selected.isEditing}>
			<AppBar fixed>
				<Button
					themeType="contained"
					theme="primary"
					onClick={() => {
						if(selectedIndex - 1 >= 0)
						{
							showQuestion(questionIds[selectedIndex - 1])
							setSelectedIndex(selectedIndex - 1)
						}
					}}

				>
					<TextIconSpacing icon={<ChevronLeftSVGIcon />}>
					</TextIconSpacing>
				</Button>

				<Button
					themeType="contained"
					theme="primary"
					onClick={() => setSelectorsVisible(true)}
				>
					<TextIconSpacing icon={<TocSVGIcon />}>
					</TextIconSpacing>
				</Button>

				<Button
					themeType="contained"
					theme="primary"
					onClick={() => {
						if(selectedIndex + 1 < questionIds.length)
						{
							showQuestion(questionIds[selectedIndex + 1])
							setSelectedIndex(selectedIndex + 1)
						}
					}}

				>
					<TextIconSpacing icon={<ChevronRightSVGIcon />}>
					</TextIconSpacing>
				</Button>

				<EditOnly>
					<Button
						themeType="contained"
						theme="primary"
						onClick={() => {
							fetch("api/edit/question/remove", {
								method: "POST",
							})
								.then((res) => res.json())
								.then((json) =>  {
									console.log("After remove", json)
								})
						}}
					>
						<TextIconSpacing icon={<RemoveCircleSVGIcon />}>
							Remove
						</TextIconSpacing>
					</Button>

					<Button
						themeType="contained"
						theme="primary"
						onClick={() => {
							fetch("api/edit/question/add/" + selected.id, {
								method: "POST",
							})
								.then((res) => res.json())
								.then((json) =>  {
									questionIds.push(json.id)
									showQuestion(json.id)
								})
						}}

					>
						<TextIconSpacing icon={<AddCircleSVGIcon />}>
							Add
						</TextIconSpacing>
					</Button>
				</EditOnly>
			</AppBar>

			{questionIds.length === 0 ? 
				(
					<p>Nothing to show</p>
				) :
				(
					<div>
						{
							quizElements.map((e, index) => (
								<QuizElement
									key={"quizElement" + index}
									data={e}
									onEdit={(value) => {
										const body = {}
										body[e.type] = value

										if(e.type === "answer")
										{
											body["answerIndex"] = e.answerIndex
										}

										fetch("api/edit/question/" + selected.id + "/" + questionIds[selectedIndex], {
											method: "POST",
											headers: {
												  'Accept': 'application/json',
												  'Content-Type': 'application/json'
											},
											body: JSON.stringify(body)
										})
									}}
								/>
							))
						}

						{/* TODO: Integrate images to QuizElement.
						<MediaContainer
							width={1}
							height={1}
							onClick={() => {
								setFocusedImage(currentImage)
								setImageOverlayVisible(true)
							}}
						>
							<img src={"api/images/" + currentImage}></img>
						</MediaContainer>
						*/}

						{/*
						<FileInput
							id="questionImageInput"
							accept="image/*"
							onChange={(e) => {
								console.log("Send new image")

								const data = new FormData()
								data.append("image", e.target.files[0])

								fetch("api/edit/image/" + selected.id + "/" + questionIds[selectedIndex], {
									method: "POST",
									body: data
								})
									.then((res) => res.text())
									.then((id) => {
										setCurrentImage(id)
									})
							}}
							multiple={false}
						>
							Upload an image
						</FileInput>
						*/}
						
						<Overlay
							visible={imageOverlayVisible}
							onRequestClose={() => setImageOverlayVisible(false)}
						>
							<MediaContainer>
								<img src={focusedImage}></img>
							</MediaContainer>
						</Overlay>

						<EditOnly>
							<Button
								themeType="contained"
								theme="primary"
								onClick={() => {
									fetch("api/edit/question/newanswer/" + selected.id + "/" + questionIds[selectedIndex], {
										method: "POST",
									})
										.then((_) => showQuestion(questionIds[selectedIndex]))
								}}

							>
								<TextIconSpacing icon={<AddCircleSVGIcon />}>
									New answer
								</TextIconSpacing>
							</Button>
						</EditOnly>
					</div>
				)
			}

			<Sheet
				aria-label="Question selectors"
				visible={selectorsVisible}
				onRequestClose={() => setSelectorsVisible(false)}
				position="bottom"
			>
				{questionIds.map((_, index) => {
					return (
						<Chip
							key={"Selector" + index.toString()}
							onClick={() => {
								showQuestion(questionIds[index])
								setSelectedIndex(index)
							}}
							selected={index === selectedIndex}
							selectedThemed
						>
							{index + 1}
						</Chip>
					)
				})}
			</Sheet>
		</EditContext.Provider>
	)
}

export default QuizView
