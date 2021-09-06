const openQuiz = document.querySelector('#attempt-quiz');
const show_question = document.querySelector('#show-question');

const result = document.querySelector('#review-quiz');
const try_again = document.querySelector('#try-again');
try_again.addEventListener('click', restartQuiz);
const total_score = document.querySelector('.score');
const scoreText = document.querySelector('.message');
const percent = document.querySelector('.percent');

let questions;
let selected_answers;
let your_choice;
let wrong_choice;
let correct_choice;

let score;
let score_text;



let wrap_question;
let progress_number;
let question_name;
let question_form;

let question_input;
let question_label;
count = 0;
let objectId;

checkAnswers();

//create a new list of questions
function createQuestion(questions){
    //onsole.log(questions);
    for(let index_ques in questions){
        const ques = questions[index_ques];
        count++;
        progress_number = document.createElement('h2');
        question_form = document.createElement('form');
        question_name = document.createElement('p');
        
        progress_number.textContent = 'Question ' + count + ' of 10';
        show_question.appendChild(progress_number)

        question_name.textContent = ques.text;
        show_question.appendChild(question_name);

        question_form.classList.add('ques-form');

        createQuestionContent(ques, ques.answers);
        show_question.appendChild(question_form);
    }
    displayResult();
}

//Create answers of questions
function createQuestionContent(ques, answers){
    objectId = ques._id;
    //console.log(answers);
    for(let i=0; i<answers.length; i++){
        wrap_question = document.createElement('div');
        question_input = document.createElement('input');
        question_label = document.createElement('label');

        wrap_question.classList.add('wrap-question');
      
        question_input.type = 'radio';
        question_input.id = 'choice'+i+'qn'+count;
        question_input.value = i;
        question_input.name = objectId;

        question_label.htmlFor = question_input.id;

        wrap_question.appendChild(question_input);
        question_label.textContent = answers[i];
        wrap_question.appendChild(question_label);
        question_form.appendChild(wrap_question);

        //remove event from all divs containing input and label of questions
        wrap_question.addEventListener('click', (event) =>{
            event.preventDefault();
        });

        //add event mouseover and mouseout for divs not checked
        wrap_question.addEventListener('mouseover', MouseoverChangeBg);
        wrap_question.addEventListener('mouseout', MouseoutChangeBg);

        //find selected answers
        if(objectId in selected_answers){
            if(i == selected_answers[objectId]){
                question_input.checked = true;
                question_input.disabled= true;
            }
        }

        //create correct answers style
        if(objectId in your_choice){
            if(i == your_choice[objectId]){
                create_div_correct_answer(wrap_question);
            }
        //create wrong answers style if it in wrong_choice
        //else style for correct answers not selected
        }else if(objectId in wrong_choice){
            if(i == wrong_choice[objectId]){
                create_div_wrong_answer(wrap_question);
            }
            if(i == correct_choice[objectId]){
                create_div_answer(wrap_question);
            }
        }
        //style for correct answers not selected
        else{
                if(i == correct_choice[objectId]){
                    create_div_answer(wrap_question);
                }
            }
        }
    }
    
//Change div answer(s) to wrong div answer(s)
function create_div_wrong_answer(wrap_question){
    wrap_question.removeEventListener('mouseover', MouseoverChangeBg);
    wrap_question.removeEventListener('mouseout', MouseoutChangeBg);
    let your_answer = document.createElement('span');
    your_answer.classList.add('wrong-answer');
    your_answer.textContent = 'Your answer';
    wrap_question.appendChild(your_answer);
    wrap_question.classList.add('wrap-question-wrong');
}

//Change div answer(s) to correct div answer(s)
function create_div_correct_answer(wrap_question){
    wrap_question.removeEventListener('mouseover', MouseoverChangeBg);
    wrap_question.removeEventListener('mouseout', MouseoutChangeBg);
    correct_ans_text = document.createElement('span');
    correct_ans_text.classList.add('correct-answer');
    correct_ans_text.textContent = 'Correct answer';
    wrap_question.appendChild(correct_ans_text);
    wrap_question.classList.add('wrap-question-correct');
}

//create div of correct answers not selected
function create_div_answer(wrap_question){
    correct_ans_text = document.createElement('span');
    correct_ans_text.classList.add('correct-answer');
    correct_ans_text.textContent = 'Correct answer';
    wrap_question.appendChild(correct_ans_text);
    wrap_question.classList.add('isSelected');
}

//Change style when user mouseover the div
function MouseoverChangeBg(event){
    let e = event.currentTarget;
    e.classList.add('hover');
}
//Change style when user mouseout the div
function MouseoutChangeBg(event){
    let e = event.currentTarget;
    e.classList.remove('hover');
}

//Show result
function displayResult(){
    total_score.textContent = `${score}/10`;
    percent.textContent = `${score * 10}%`;
    scoreText.textContent = score_text;
    
}

//restart quiz
async function restartQuiz(){
    total_score.innerHTML = '';
    percent.innerHTML = '';
    scoreText.innerHTML = '';

    show_question.innerHTML = '';

    count = 0;
    id_qn_answer = {};
    //create a new attempt
    await fetch('/attempts',{
        method: 'GET'
    });
    //redirect to introduction page
    return window.location.assign('/index.html');
    
}

//request results
async function checkAnswers(){
    const response = await fetch('/result',{
        method: 'GET'
    });
    const result = await response.json();
    //console.log(result);
    questions = result.attempt_questions;
    selected_answers = result.selected_answers;
    your_choice = result.your_choice;
    wrong_choice = result.wrong_choice;
    correct_choice = result.correct_choice;
    score = result.score;
    score_text = result.scoreText;

    //console.log(result);
    await createQuestion(questions);
}

