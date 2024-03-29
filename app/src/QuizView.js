import { useState, useEffect } from "react"
import { TextField } from "@react-md/form"
import { Button } from "@react-md/button"
import { Chip } from "@react-md/chip"
import { Sheet } from "@react-md/sheet";
import { TextIconSpacing } from "@react-md/icon"
import { MediaContainer } from "@react-md/media"
import { Overlay } from "@react-md/overlay";
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
	const [currentQuestion, setCurrentQuestion] = useState({})
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [selectorsVisible, setSelectorsVisible] = useState(false)
	const [imageOverlayVisible, setImageOverlayVisible] = useState(false)
	const [focusedImage, setFocusedImage] = useState("")

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
		if(selected.isEditing)
		{
			// Get question data from the given editing context.
			fetch("api/edit/question/" + selected.id + "/" + id)
				.then((res) => res.json())
				.then((json) => {
					setCurrentQuestion(json)
				})

		}

		else
		{
			fetch("api/quiz/question/" + id)
				.then((res) => res.json())
				.then((json) => {
					setCurrentQuestion(json)
				})
		}
	}

	return (
		<div>
			{selected.isEditing ?
				(
					<TextField value={quizName} onChange={(e) => setQuizName(e.target.value)} />
				) :
				(
					<p>
						{selected.name}
					</p>
				)
			}

			{questionIds.length === 0 ? 
				(
					<p>Nothing to show</p>
				) :
				(
					<div>
						<p>{currentQuestion.question}</p>
						<MediaContainer
							width={1}
							height={1}
							onClick={() => {
								setFocusedImage(currentQuestion.image)
								setImageOverlayVisible(true)
							}}
						>
							<img src={currentQuestion.image}></img>
						</MediaContainer>
						
						<Overlay
							visible={imageOverlayVisible}
							onRequestClose={() => setImageOverlayVisible(false)}
						>
							<MediaContainer>
								<img src={focusedImage}></img>
							</MediaContainer>
						</Overlay>
					</div>
				)
			}

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
					Prev
				</TextIconSpacing>
			</Button>

			<Button
				themeType="contained"
				theme="primary"
				onClick={() => setSelectorsVisible(true)}
			>
				<TextIconSpacing icon={<TocSVGIcon />}>
					Show
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
					Next
				</TextIconSpacing>
			</Button>

			{selected.isEditing ?
				(
					<div id="editButtons">
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
					</div>
				) : null
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
		</div>
	)
}

export default QuizView
