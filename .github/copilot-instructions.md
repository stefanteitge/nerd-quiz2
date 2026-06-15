# Nerd Quiz

It shall be a web application for hosting quizzes.
It shall be hosted as a GitHub page.
The quiz is in English.

## Rules

It is played in a room with 20+ participants and one quiz master.
Each player has a physical green or red sheet of paper.
The quiz master asks a question and the players have to answer by holding up their sheet of paper.
Each question can be answered by holding up the green or red paper card simultaneously.
All players are requested to show their answer at the same time.
Optionally a third answer can be holding up both papers.
Scoring is not part of the application.

## UI Design

It shall have general look of the 80ies. Dark backgrounds and color UI elements.
Synthwave shall be the keyword here. All pages are styled that way.

### Pages

* Title page
* How it's played page
* Start page containing GitHub URL for question library source
* Question page

#### Title page

Has the title Nerd Quiz in Retro font filling the page.
Clicking anywhere shows the How it's played page.

#### How it's played page

It shows the basic rules.
It shall start with the following bullet points:
* It's unfair
* The idea is stolen
* The implementation is flawed

Clicking anywhere leads to the start page.

#### Start page

Has a button starting the default quiz, that is in `default-quiz` folder.
Has an input for the quiz source URL.

#### Question page

Show a random question from the question library.
It also shows the possible answers and the descriptions.
It has a button vote which shows a countdown from 3, then waits 5 seconds and shows the correct answer.
It also shows the solution explanation and the optional solution image.
Then there is a next button which show the next question.
Questions are never repeated during a session. When all questions are shown, the quiz is finished and the start page is shown again.

## Question library

Questions usually have title and a description that can have multiple lines..
They can have the green card answer.
They can have the red card answer.
They can have both cards (red and greed) answers.
Alternatively an image for question can be provided.
Each question has a solution explanation.
Each question has a optional solution image.

### Question library loading

When starting quiz an URL to a GitHub repo is provided.
This must contain a quiz.json with the questions.
This file lists the questions as JSON.
It also contains the right answer.
The question images are all stored in the images sub folder.

## Technology

It is located in `frontend` folder of the repository.
It shall use Angular. For styling it should use SCSS and no additional framework.
It should use TypeScript as the programming language.
It should use a library to reset browser styles.
It is deployoed as a GitHub page. Initally this is privae, but in future public.
The default quiz is located in `default-quiz` folder of the repository and shall be also retrievable from GitHub URL.