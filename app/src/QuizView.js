import { useState, useEffect } from "react"
import { Button } from "@react-md/button"
import { Chip } from "@react-md/chip"
import { Sheet } from "@react-md/sheet";
import { TextIconSpacing } from "@react-md/icon"
import { MediaContainer } from "@react-md/media"
import { Overlay } from "@react-md/overlay";
import { AppBar } from "@react-md/app-bar";
import { Typography } from "@react-md/typography";
import { Dialog, DialogContent, DialogHeader } from "@react-md/dialog";

import QuizContext from "./QuizContext.js"
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

	const [quizElements, setQuizElements] = useState([])
	const [settingsVisible, setSettingsVisible] = useState(false)
	const [settings, setSettings] = useState({ construct: () => {} })

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
					initialValue: json.question,
					image: json.image
			}]
			.concat(
				json.answers.map((answer, answerIndex) => {
					return {
						type: "answer",
						initialValue: answer.answer,
						answerIndex: answerIndex,
						image: answer.image
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
		<QuizContext.Provider value={{
			getSelectedQuestion: () => questionIds[selectedIndex],
			quizId: selected.id,
			isEditing: selected.isEditing
		}}>
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
			</AppBar>

			{questionIds.length === 0 ? 
				(
					<p>Nothing to show</p>
				) :
				(
					<div id="elementContainer">
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

									onImageUpload={(imageUrl, onUploaded) => {
										const data = new FormData()
										data.append("image", imageUrl)

										if(e.type === "answer")
										{
											data.append("answerIndex", e.answerIndex)
										}

										fetch("api/edit/image/" + selected.id + "/" + questionIds[selectedIndex], {
											method: "POST",
											body: data
										})
											.then((res) => res.text())
											.then((id) => {
												onUploaded(id)
											})
									}}
									setSettings={setSettings}
									setSettingsVisible={setSettingsVisible}
								/>
							))
						}
					</div>
				)
			}

			<Dialog
				role="alertdialog"
				modal={false}
				visible={settingsVisible}
				onRequestClose={() => setSettingsVisible(false)}
			>
				<DialogHeader>
					<Typography type="headline-4">
						{settings.title}
					</Typography>
				</DialogHeader>

				<DialogContent>
					{settings.construct(() => setSettingsVisible(false))}
				</DialogContent>
			</Dialog>

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
		</QuizContext.Provider>
	)
}

export default QuizView
