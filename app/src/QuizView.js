import { useState, useEffect } from "react"
import { TextField } from "@react-md/form"
import { Button } from "@react-md/button"
import { Chip } from "@react-md/chip"
import { Sheet } from "@react-md/sheet";
import { TextIconSpacing } from "@react-md/icon"
import { TocSVGIcon, ChevronLeftSVGIcon, ChevronRightSVGIcon } from "@react-md/material-icons"
import { MediaContainer } from "@react-md/media"
import { Overlay } from "@react-md/overlay";

const QuizView = ({selected}) => {
	const [quizName, setQuizName] = useState(selected.name)
	const [questionIds, setQuestionIds] = useState([])
	const [currentQuestion, setCurrentQuestion] = useState({})
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [selectorsVisible, setSelectorsVisible] = useState(false)
	const [imageOverlayVisible, setImageOverlayVisible] = useState(false)
	const [focusedImage, setFocusedImage] = useState("")

	useEffect(() => {
		// TODO: Get revision from QuizSelector.
		fetch("api/quiz/questionids/" + selected.id + "/XXXX")
			.then((res) => res.json())
			.then((ids) => {
				setQuestionIds(ids)
				showQuestion(ids[0])
			})
	}, [])

	const showQuestion = (id) => {
		fetch("api/quiz/question/" + id)
			.then((res) => res.json())
			.then((json) => {
				setCurrentQuestion(json)
			})
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

			<p>{currentQuestion.question}</p>
			{currentQuestion.image !== "" ?
				(
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
				) :
				null
			}
			
			<Overlay
				visible={imageOverlayVisible}
				onRequestClose={() => setImageOverlayVisible(false)}
			>
				<MediaContainer>
					<img src={focusedImage}></img>
				</MediaContainer>
			</Overlay>

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
