import { ExpansionList, ExpansionPanel, usePanels, } from "@react-md/expansion-panel"
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { CheckBox, Select, useSelectState } from "@react-md/form"
import { Divider} from "@react-md/divider"
import { Sheet } from "@react-md/sheet";
import { Chip } from "@react-md/chip"
import { Button } from "@react-md/button";
import { TextIconSpacing } from "@react-md/icon"
import { CreateSVGIcon, InsertPhotoSVGIcon } from "@react-md/material-icons"
import { useState, useEffect } from "react"
import QuizListing from "./QuizListing.js"
import "./QuizSelector.css"

const QuizSelector = ({setSelectedQuiz}) => {
	const [shouldUpdateListings, setShouldUpdateListings] = useState(false)
	const [categories, setCategories] = useState([])
	const [expanded, setExpanded] = useState([])

	const [editsVisible, setEditsVisible] = useState(false)
	const [currentEdits, setCurrentEdits] = useState([])

	const [infoVisible, setInfoVisible] = useState(false)
	const [currentInfo, setCurrentInfo] = useState({})

	const [revision, handleRevisionChange] = useSelectState("nii")
	const [revisionOptions, setRevisionOptions] = useState([])

	const showListingInfo = (id, name) => {
		setCurrentInfo({
			id: id,
			name: name
		})

		// TODO: Get this from the backend.
		setRevisionOptions([
			"Rev1", "Rev2", "Rev3"
		])

		setInfoVisible(true)
	}

	const hideListingInfo = () => {
		setInfoVisible(false)
	}

	const showCurrentEdits = () => {
		fetch("api/edit/listings")
			.then((res) => res.json())
			.then((arr) => {
				setCurrentEdits(arr)
				setEditsVisible(true)
			})
	}

	const startNewEdit = (revisionId) => {
		// If no revision is given, request an editing ID for a new quiz.
		if(revisionId === "")
		{
			fetch("api/edit/new", { method: "POST" })
				.then((res) => res.json())
				.then((json) => {
					if(!("id" in json))
					{
						// TODO: Show some error message.
						return
					}

					setSelectedQuiz({
						id: json.id,
						isEditing: true
					})
				})
		}

		else
		{
		}
	}

	useEffect(() => {
		setShouldUpdateListings(false)

		// Request the quiz listings.
		fetch("api/quiz/listings")
			.then((res) => res.json())
			.then((listingsData) => {
				const newCategories = []
				const newExpanded = []
				const categoryLookup = {}

				listingsData.forEach((listing) => {
					// If the given category doesn't exist, create it.
					if(!(listing.category in categoryLookup))
					{
						categoryLookup[listing.category] = newCategories.length

						newCategories.push({
							id: "category-" + newCategories.length,
							name: listing.category,
							index: newCategories.length,
							children: [],
							expanded: false
						})

						newExpanded.push(false)
					}

					newCategories[categoryLookup[listing.category]].children.push(listing)
				})

				setCategories(newCategories)
				setExpanded(newExpanded)
			})
	}, [shouldUpdateListings])

	return (
		<div>
			<Button
				themeType="contained"
				theme="primary"
				onClick={() => startNewEdit("")}
			>
				Create a new quiz
			</Button>

			<Button
				themeType="contained"
				theme="primary"
				onClick={() => showCurrentEdits()}
			>
				Resume an edit
			</Button>

			<ExpansionList>
				{categories.map((category) => {
					return (
						<ExpansionPanel
							key={category.id}
							header={category.name}
							expanded={expanded[category.index]}
							onExpandClick={() => {
								setExpanded(categories.map((entry) => {
									return entry.index === category.index
								}))
							}}
						>
						{category.children.map((listing) => {
							return (
								<QuizListing
									key={listing.id}
									name={listing.name}
									id={listing.id}
									showListingInfo={showListingInfo}
								/>
							)
						})}
						</ExpansionPanel>
					)
				})}
			</ExpansionList>

			<Dialog
				id="listing-dialog"
				role="alertdialog"
				modal={true}
				visible={infoVisible}
				aria-labelledby="listing-dialog-title"
			>
				<DialogContent>
					<h3>{currentInfo.name}</h3>

					<Select
						label="Select revision"
						name="selectRevision"
						value={revision}
						options={revisionOptions}
						onChange={handleRevisionChange}
					/>

					<div id="playButtons">
						<Button
							themeType="contained"
							theme="primary"
							onClick={() => setSelectedQuiz({
								id: currentInfo.id,
								revision: revision,
								isEditing: false
							})}
						>
							<TextIconSpacing icon={<CreateSVGIcon />}>
								Type
							</TextIconSpacing>
						</Button>

						<Button
							themeType="contained"
							theme="primary"
							onClick={() => setSelectedQuiz({
								id: currentInfo.id,
								revision: revision,
								isEditing: false
							})}
						>
							<TextIconSpacing icon={<InsertPhotoSVGIcon />}>
								Card
							</TextIconSpacing>
						</Button>
					</div>
				</DialogContent>

				<DialogFooter>
					<Button
						onClick={() => startNewEdit(currentInfo.revision)}
						theme="primary"
					>
						Edit quiz
					</Button>

					<Button
						onClick={hideListingInfo}
						theme="primary"
					>
						Close
					</Button>
					
				</DialogFooter>
			</Dialog>

			<Sheet
				aria-label="Edits"
				visible={editsVisible}
				onRequestClose={() => setEditsVisible(false)}
				position="bottom"
			>
				{currentEdits.map((entry) => {
					return (
						<Chip
							key={entry.id}
							onClick={() => setSelectedQuiz({
								id: entry.id,
								isEditing: true
							})}
						>
							{entry.name}
						</Chip>
					)
				})}
			</Sheet>
		</div>
		
	)
}

export default QuizSelector
