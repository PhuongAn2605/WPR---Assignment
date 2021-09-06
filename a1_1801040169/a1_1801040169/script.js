const url = 'https://wpr-quiz-api.herokuapp.com/attempts';

const body = document.querySelector('body');
const question_btn = document.querySelector('#start-quiz');
question_btn.addEventListener('click', onButtonClickOpenQuiz);

const openQuiz = document.querySelector('#attempt-quiz');
const intro = document.querySelector('#introduction');
const div_btn_submit = document.querySelector('#form');
const show_question = document.querySelector('#show-question');

const submit_btn = document.querySelector('#green-btn');
submit_btn.addEventListener('click', onClickConfirm);

const confirm = document.querySelector('#confirm');
const confirm_cancel = document.querySelector('.btn-cancel');
confirm_cancel.addEventListener('click', confirmForm);
const confirm_yes = document.querySelector('.btn-yes');
confirm_yes.addEventListener('click', onClickCheckAnswer);

const result = document.querySelector('#review-quiz');
const try_again = document.querySelector('#try-again');
try_again.addEventListener('click', restartQuiz);
const total_score = document.querySelector('.score');
const scoreText = document.querySelector('.message');
const percent = document.querySelector('.percent');

let wrap_question;
let progress_number;
let question_name;
let question_form;
let question_input;
let question_label;


let id_qn_answer = {};
let correct_answers;
let attempt_id;

let count = 0;

//Show question
function onButtonClickOpenQuiz(){
    openQuiz.classList.remove('hidden');
    intro.classList.add('hidden');
    if(div_btn_submit.classList.contains('hidden')){
        div_btn_submit.classList.remove('hidden');
    }
    body.scrollIntoView(true);
 }

 //Get questions, correct_answers, id of the attempt and create questions 
 //then add event for the div containing the answer for each question
function openQuestion(json){
    const questions = json.questions;
    correct_answers = json.correctAnswers;
    attempt_id = json._id;

    createQuestion(questions);
    selectDivEvent();
}

//Create question_name
function createQuestion(questions){
    for(let ques of questions){
        count++;
        progress_number = document.createElement('h2');
        question_form = document.createElement('form');
        question_name = document.createElement('p');
        
        progress_number.textContent = 'Question ' + count + ' of 10'
        show_question.appendChild(progress_number)

        question_name.textContent = ques.text;
        show_question.appendChild(question_name);

        question_form.classList.add('ques-form');

        createQuestionContent(ques, ques.answers);
        show_question.appendChild(question_form);
    }
}

//Create answers of questions
function createQuestionContent(ques, answers){
    for(let i=0; i<answers.length; i++){
        wrap_question = document.createElement('div');
        question_input = document.createElement('input');
        question_label = document.createElement('label');

        wrap_question.classList.add('wrap-question');
      
        question_input.type = 'radio';
        question_input.id = 'choice'+i+'qn'+count;
        question_input.value = i;
        question_input.name = ques._id;

        question_label.htmlFor = question_input.id;

        wrap_question.appendChild(question_input);
        question_label.textContent = answers[i];
        wrap_question.appendChild(question_label);
        question_form.appendChild(wrap_question);
        
    }
}

//Add event for div containing answer: click, mouseover and mouseout
function selectDivEvent(){
    const choices = document.querySelectorAll('.wrap-question');
    for(let choice of choices){
        choice.addEventListener('click', onClickSelected);
        choice.addEventListener('mouseover', MouseoverChangeBg);
        choice.addEventListener('mouseout', MouseoutChangeBg);
    } 
}

//disable the div containing answer after submitting answers
function disableSelect(){
    const input_list = document.querySelectorAll('input');
    let div_input;

    for(const input of input_list){
        input.disabled = true;
        div_input = input.parentNode;
        div_input.removeEventListener('click', onClickSelected);
    }
}

//change the style of selected div
function onClickSelected(event){
    let e = event.currentTarget;
    let div_beforeSelected;
    let input_selected = e.firstChild;

    input_selected.checked = true;
    let form_selected = e.parentNode;

    for(let input of form_selected){
        if(input !== input_selected){
            div_beforeSelected = input.parentNode;
            div_beforeSelected.classList.add('wrap-question');
            div_beforeSelected.classList.remove('isSelected');
        }
    }
    e.classList.remove('wrap-question');
    e.classList.add('isSelected');
}

//Create confirm form
function onClickConfirm(){ 
    document.body.classList.add('no-scroll');
    confirm.style.top = window.pageYOffset + 'px';  
    confirm.classList.remove('hidden');
}

//Event for cancel
function confirmForm(){  
    show_question.scrollIntoView();
    document.body.classList.remove('no-scroll');  
    confirm.classList.add('hidden');
}

//Style all correct answers then compare user's answers with corresponding correct answers
//and submit the user's answers
function onClickCheckAnswer(){
    div_btn_submit.classList.add('hidden');

    disableSelect();
    confirmForm();

    let correct_div;
    const selected_ans = document.querySelectorAll('input[type="radio"]');
    for(const ans of selected_ans){
        for(let correct_ans in correct_answers){
            if(ans.name == correct_ans && ans.value == correct_answers[correct_ans]){
                correct_div = ans.parentNode;
                correct_ans_text = document.createElement('span');
                correct_ans_text.classList.add('correct-answer');
                correct_ans_text.textContent = 'Correct answer';
                correct_div.appendChild(correct_ans_text);
                correct_div.classList.add('isSelected');
            }
        }
        compareAnswer(ans);
    }  
        submitAnswer(attempt_id, id_qn_answer);
}

//Compare answers of user and style the correct div answer(s) and wrong div answer(s)
function compareAnswer(ans){
    if(ans.checked){ 
        selected_div = ans.parentNode;
        selected_div.removeEventListener('mouseover', MouseoverChangeBg);
        selected_div.removeEventListener('mouseover', MouseoutChangeBg);
        id_qn_answer[ans.name] = ans.value;
        for(let correct_ans in correct_answers){
            if(correct_ans == ans.name){
                 if(correct_answers[correct_ans] == ans.value){
                    create_div_correct_answer(correct_ans, ans, correct_answers);
                }else{
                    create_div_wrong_answer(selected_div);
                }
            }
        }
    }
}

//Change div answer(s) to wrong div answer(s)
function create_div_wrong_answer(){
    your_answer = document.createElement('span');
    your_answer.classList.add('wrong-answer');
    your_answer.textContent = 'Your answer';
    selected_div.appendChild(your_answer);
    selected_div.classList.add('wrap-question-wrong');
}

//Change div answer(s) to correct div answer(s)
function create_div_correct_answer(){
    selected_div.classList.add('wrap-question-correct');
}

//Show result
function displayResult(json){

    console.log(json);
    
    const score = json.score;
    total_score.textContent = `${score}/10`;
    percent.textContent = `${score * 10}%`;
    scoreText.textContent = json.scoreText;
    result.classList.remove('hidden');
    //result.scrollIntoView();
}

//restart the quiz
function restartQuiz(){
    total_score.innerHTML = '';
    percent.innerHTML = '';
    scoreText.innerHTML = '';

    intro.classList.remove('hidden');
    show_question.innerHTML = '';
    openQuiz.classList.add('hidden');
    result.classList.add('hidden');

    count = 0;
    id_qn_answer = {};
    fetch(url, {
    method: 'POST'
    }).then(onResponse).then(openQuestion);
    body.scrollIntoView(true);
    
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

function onResponse(response){
    console.log('status ' + response.status);
    console.log(response);
    return response.json();
}

fetch(url, {
    method: 'POST'
}).then(onResponse).then(openQuestion);

function submitAnswer(attempt_id, id_qn_answer){
    fetch(url + '/' + attempt_id + '/submit',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            answers: id_qn_answer
        })
    }).then(onResponse).then(displayResult);
}