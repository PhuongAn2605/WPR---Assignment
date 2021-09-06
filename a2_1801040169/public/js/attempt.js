const body = document.querySelector('body');

const openQuiz = document.querySelector('#attempt-quiz');
const show_question = document.querySelector('#show-question');
const submit_btn = document.querySelector('#green-btn');
submit_btn.addEventListener('click', onClickConfirm);

const confirm = document.querySelector('#confirm');
const confirm_cancel = document.querySelector('.btn-cancel');
confirm_cancel.addEventListener('click', confirmForm);
const confirm_yes = document.querySelector('.btn-yes');
confirm_yes.addEventListener('click', onSubmit);

let wrap_question;
let progress_number;
let question_name;
let question_form;

let list_ques = {};

let question_input;
let question_label;

let list_attempt_id = [];


let id_qn_answer = {};
let correct_answers;
let attempt_id = null;

let count = 0;

let input_selected = null;
let div_selected = null;
let questions = null;
let json = {};


let temp_selected_answer ={};
let new_questions;
let new_attempt_id;
let temp_answers;
let temp_choice = null;

async function startQuiz(){
    temp_answers = {};
    //check local storage contains any id of attempt or not
    let id = JSON.parse(localStorage.getItem('list_attempt_id'));
    //if contains id of attempt, request the attempts again
    if(id !== null){
        attempt_id = id;
        const response = await fetch('/attempts/'+attempt_id,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(response.status === 200){
            json = await response.json();
            temp_answers = json.temp_selected_answers;
            //console.log(temp_answers);
            questions = json.attempt_questions_2;

        }else{
            await createNewAttempt();

        }
    //if not contain any id of attempt in local storage then create a new attempt
    }else{
        await createNewAttempt();
    }
    await createQuestion(questions);
    selectDivEvent();
}

//create a new attempt
async function createNewAttempt(){
    response = await fetch('/attempts',{
        method: 'GET'
    });

    let json = await response.json();

    questions = json.attempt_questions_2;
    attempt_id = json.index['id'];

    //add id of the attempt in local storage
    localStorage.setItem('list_attempt_id', JSON.stringify(attempt_id));  
    return json;

}

//Create question_name
function createQuestion(questions){
    //console.log(questions);
    for(let ques of questions){
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
}

//Create answers of questions
function createQuestionContent(ques, answers){
    let qn_id = ques._id;
    temp_choice = null;
    if(temp_answers !== null){
        for(let temp_qn_id in temp_answers){
            if(qn_id == temp_qn_id){
                temp_choice = temp_answers[temp_qn_id];
            }
        }
    }
    for(let i=0; i<answers.length; i++){
        wrap_question = document.createElement('div');
        question_input = document.createElement('input');
        question_label = document.createElement('label');
      
        question_input.type = 'radio';
        question_input.id = 'choice'+i+'qn'+count;
        question_input.value = i;
        question_input.name = ques._id;

        question_label.htmlFor = question_input.id;
        if(temp_choice !== null && i == temp_choice){
            question_input.checked = true;
            wrap_question.classList.add('isSelected');
        }else{
            wrap_question.classList.add('wrap-question');
        }
        

        wrap_question.appendChild(question_input);
        question_label.textContent = answers[i];
        wrap_question.appendChild(question_label);
        question_form.appendChild(wrap_question);
        
    }
}

//Add event for div containing answer: click, mouseover and mouseout
async function selectDivEvent(){
    const choices = document.querySelectorAll('.wrap-question');
    for(let choice of choices){
        choice.addEventListener('click', await onClickSelected);
        // choice.addEventListener('change', updateSessionStorage);
        choice.addEventListener('mouseover', MouseoverChangeBg);
        choice.addEventListener('mouseout', MouseoutChangeBg);
    } 
}


//change the style of selected div
async function onClickSelected(event){
    temp_selected_answer = {};
    let e = event.currentTarget;
    let div_beforeSelected;
    input_selected = e.firstChild;

    input_selected.checked = true;

    temp_selected_answer[input_selected.name] = input_selected.value;
    //save the selected answer immediately
    await updateAnswers(temp_selected_answer);

    //console.log(temp_selected_answer);
    div_selected = input_selected.parentNode;
    
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

//submit answers
async function onSubmit(event){
    temp_selected_answer = {};
    localStorage.removeItem('list_attempt_id');  

    const selected_ans = document.querySelectorAll('input[type="radio"]');
    for(const ans of selected_ans){
        if(ans.checked){
            id_qn_answer[ans.name] = ans.value;
        }
    }
    //send selected answers and the id of attempt to server
    let response = await fetch('/' + attempt_id + '/submit',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            selected_answers: id_qn_answer,
            attempt_id: attempt_id
        })
    });
    //console.log(response);
    // redirect to review page
    return window.location.replace('/review.html');
}

//save selected choices
async function updateAnswers(temp_selected_answer){
    let response = await fetch('/attempts/'+attempt_id,{
        method: 'PATCH',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            temp_selected_answer: temp_selected_answer
        })
    });
    return response;
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

startQuiz();