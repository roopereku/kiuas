import { useState, useEffect } from "react"
import { Button } from "@react-md/button"
import { Chip } from "@react-md/chip"
import { Sheet } from "@react-md/sheet";
import { TextField } from "@react-md/form"
import { TextIconSpacing } from "@react-md/icon"
import { MediaContainer } from "@react-md/media"
import { Overlay } from "@react-md/overlay"
import { Typography } from "@react-md/typography"
import { AppBar, AppBarAction, AppBarTitle } from "@react-md/app-bar"
import { Dialog, DialogContent, DialogHeader } from "@react-md/dialog"
import { DropdownMenu, MenuItem } from "@react-md/menu"

import QuizContext from "./QuizContext.js"
import EditOnly from "./EditOnly.js"
import PlayOnly from "./PlayOnly.js"
import QuizElement from "./QuizElement.js"
import "./QuizView.css"

import
{
	TocSVGIcon,
	PublishSVGIcon,
	ChevronLeftSVGIcon,
	ChevronRightSVGIcon,
	AddCircleSVGIcon,
	RemoveCircleSVGIcon,
	SettingsSVGIcon,
	EditSVGIcon,
	HomeSVGIcon
}

from "@react-md/material-icons"

const QuizView = ({selected, goHome}) => {
	const [quizName, setQuizName] = useState(selected.name)
	const [quizCategory, setQuizCategory] = useState(selected.category)
	const [questionIds, setQuestionIds] = useState([])
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [selectorsVisible, setSelectorsVisible] = useState(false)

	const [quizElements, setQuizElements] = useState([])
	const [settingsVisible, setSettingsVisible] = useState(false)
	const [settings, setSettings] = useState({ construct: () => {} })

	useEffect(() => {
		const path = selected.isEditing ? "api/edit/quizdata/" : "api/quiz/quizdata/"
		fetch(path + selected.id)
			.then((res) => res.json())
			.then((json) => {
				console.log(json)
				setQuizName(json.name)
				setQuizCategory(json.category)

				if(json.questions.length > 0)
				{
					setQuestionIds(json.questions)
					showQuestion(json.questions[0])
				}
			})
	}, [])

	const showQuestion = (id) => {
		const updateData = (json) => {
			console.log("Got data", json)

			// Only if the user is editing a quiz, show the answers by default.
			// TODO: Backend should send complete elements.
			if(selected.isEditing)
			{
				let data = [{
						type: "question",
						value: json.question,
						image: json.image
				}]

				data = data.concat(
					json.answers.map((answer, answerIndex) => {
						return {
							type: "answer",
							value: answer.answer,
							answerIndex: answerIndex,
							image: answer.image
						}
					})
				)

				setQuizElements(data)
			}

			else
			{
				setQuizElements(json)
			}
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
			<AppBar
				id="quizBar"
				fixed
			>
				<AppBarAction
					id="quizGoHome"
					aria-label="Go to home"
					onClick={() => goHome()}
				>
					<HomeSVGIcon />
				</AppBarAction>

				<AppBarAction
					id="quizPrevQuestion"
					className="quizNavButton"
					aria-label="Previous question"
					onClick={() => {
						if(selectedIndex - 1 >= 0)
						{
							showQuestion(questionIds[selectedIndex - 1])
							setSelectedIndex(selectedIndex - 1)
						}
					}}
				>
					<ChevronLeftSVGIcon />
				</AppBarAction>

				<AppBarTitle id="quizTitle">
					{quizName}
				</AppBarTitle>

				<AppBarAction
					id="quizNextQuestion"
					className="quizNavButton"
					aria-label="Next question"
					onClick={() => {
						if(selectedIndex + 1 < questionIds.length)
						{
							showQuestion(questionIds[selectedIndex + 1])
							setSelectedIndex(selectedIndex + 1)
						}
					}}
				>
					<ChevronRightSVGIcon />
				</AppBarAction>

				<AppBarAction
					id="quizConfigAction"
					aria-label="Quiz settings"
					onClick={() => {
						setSettings({
							title: "Quiz settings",
							construct: (hideSettings) => {
								return (
									<div id="quizConfig">
										<TextField
											defaultValue={quizName}
											label="Quiz name"
											onChange={(e) => {
												setQuizName(e.target.value)
												fetch("api/edit/quiz/location/" + selected.id, {
													method: "POST",
													headers: {
														  'Accept': 'application/json',
														  'Content-Type': 'application/json'
													},
													body: JSON.stringify({
														name: e.target.value
													})
												})

											}}
										/>

										<TextField
											defaultValue={quizCategory}
											label="Quiz category"
											onChange={(e) => {
												setQuizCategory(e.target.value)
												fetch("api/edit/quiz/location/" + selected.id, {
													method: "POST",
													headers: {
														  'Accept': 'application/json',
														  'Content-Type': 'application/json'
													},
													body: JSON.stringify({
														category: e.target.value
													})
												})
											}}
										/>

										<Button
											themeType="contained"
											theme="primary"
											onClick={() => {
												fetch("api/edit/quiz/publish/" + selected.id, {
													method: "POST"
												})
													.then((res) => {
														// TODO: Check for error codes?
														// TODO: Show a notification?
														goHome()
													})
											}}
										>
											<TextIconSpacing icon={<PublishSVGIcon />}>
												Publish
											</TextIconSpacing>
										</Button>
									</div>
								)
							}
						})

						setSettingsVisible(true)
					}}
				>
					<SettingsSVGIcon />
				</AppBarAction>
			</AppBar>

			<EditOnly>
				<DropdownMenu
					id="quizEditMenu"
					floating="bottom-right"
					buttonChildren={<EditSVGIcon />}
					theme="primary"
				>
					<MenuItem
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
							Add a question
						</TextIconSpacing>
					</MenuItem>

					<MenuItem
						onClick={() => {
							fetch("api/edit/question/newanswer/" + selected.id + "/" + questionIds[selectedIndex], {
								method: "POST",
							})
								.then((_) => showQuestion(questionIds[selectedIndex]))
						}}
					>
						<TextIconSpacing icon={<AddCircleSVGIcon />}>
							Add an answer
						</TextIconSpacing>
					</MenuItem>

					<MenuItem
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
							Remove question
						</TextIconSpacing>
					</MenuItem>
				</DropdownMenu>
			</EditOnly>

			<Button
				themeType="contained"
				floating="bottom-right"
				theme="primary"
				onClick={() => setSelectorsVisible(true)}
			>
				<TextIconSpacing icon={<TocSVGIcon />}>
				</TextIconSpacing>
			</Button>

			{questionIds.length === 0 ? 
				(
					<p>Nothing to show</p>
				) :
				(
					<div>
						<div id="elementContainer">
							{
								quizElements.map((e, index) => (
									<QuizElement
										key={"quizElement" + index}
										data={e}
										setSettings={setSettings}
										setSettingsVisible={setSettingsVisible}
									/>
								))
							}
						</div>

						<PlayOnly>
							<Button
								themeType="contained"
								theme="primary"
								onClick={() => {}}
							>
								Submit
							</Button>
						</PlayOnly>
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
