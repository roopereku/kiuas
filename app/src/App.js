import { useState } from "react"
import "./App.css"
import "./App.scss"

import LoginChecker from "./Login.js"
import QuizSelector from "./QuizSelector.js"
import QuizView from "./QuizView.js"

const navItems = {};

function App()
{
	const [ loginDone, setLoginDone ] = useState(false)
	const [ selectedQuiz, setSelectedQuiz ] = useState({})

	return (
		<div className="App">
			<header className="App-header">
				{!loginDone ?
					(<LoginChecker setLoginDone={setLoginDone} />) :
					Object.keys(selectedQuiz).length === 0 ?
						(<QuizSelector setSelectedQuiz={setSelectedQuiz} />) :
						(
							<QuizView
								selected={selectedQuiz}
								goHome={() => setSelectedQuiz({})}
							/>
						)
				}
			</header>
		</div>
	);
}

export default App
