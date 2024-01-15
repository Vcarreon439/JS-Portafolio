/**
 * Create a placeholder to a proxy object
 */
function createProxySurveyDataObject() {
    return {
        title: 'Mi encuesta',
        description: 'Mi descripción',
        questions: [],
        surveyType: '',
    }
}

/**
 * Create in the DOM a question section
 */
function createQuestionElement({
    idQuestion,
    questionTitle,
    inputType,
    isOptional,
}) {
    const questionContainer = document.createElement('div');
    const questionHeader = document.createElement('div');
    const questionContent = document.createElement('div');
    const questionFooter = document.createElement('div');
    const previewResponse = document.createElement('div');
    questionContainer.appendChild(questionHeader);
    questionContainer.appendChild(questionContent);
    questionContainer.appendChild(questionFooter);
    questionContainer.classList.add(
        'question-element',
        'flex',
        'w-full',
        'flex-col',
        'gap-4',
        'hover:selected'
    );
    questionHeader.classList.add('w-full', 'flex', 'flex-row', 'gap-2', 'items-center', 'header-question');
    previewResponse.classList.add('preview');
    questionContent.classList.add('w-full', 'flex', 'flex-col-reverse', 'gap-2')
    questionFooter.classList.add('w-full', 'flex', 'flex-row', 'items-center', 'justify-between');
    questionList?.appendChild(questionContainer);
    setHeaderQuestion(questionHeader, idQuestion, questionTitle);
    questionContent.appendChild(previewResponse);
    setInputResponseForm(questionContent, { inputType, idQuestion });
    setDeleteButton(questionFooter, idQuestion);

    //Aqui se define el tagify
    setInputQuestionType(questionContent, { idQuestion });
    setOptionalSwitch(questionFooter, { isOptional, idQuestion });
}

/**
 * Set the header of the question section
 * @param {HTMLElement} element The HTMLElement where is located
 * @param {number | undefined} idQuestion The number of the question with the array index
 * @param {string | undefined} questionTitle The title of the question
 */
function setHeaderQuestion(element, idQuestion = undefined, questionTitle = undefined) {
    const header = document.createElement('span');
    const changeInputHeader = document.createElement('input');
    const questionIndicator = document.createElement('div');
    header.textContent = questionTitle ?? proxySurveyData.questions[proxySurveyData.questions.length - 1]?.questionTitle;
    header.classList.add(
        'w-full',
        'font-semibold',
        'text-gray-900',
        'text-sm',
        'rounded-corners',
        'cursor-pointer',
        'hover:bg-gray-200',
        'px-2',
        'py-1',
    );
    questionIndicator.textContent = idQuestion ?? proxySurveyData.questions.length;
    questionIndicator.classList.add('question-indicator', 'text-sm');
    element.classList.add('flex', 'w-full', 'justify-between', 'items-center');
    element.appendChild(header);
    element.appendChild(changeInputHeader);
    element.appendChild(questionIndicator);
    changeInputHeader.type = 'text';
    changeInputHeader.classList.add('invisible', 'input-text', 'w-full');
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!Number.isNaN(activeInputIdx)) {
            saveInputValuesOnChange();
        }
        changeInputHeader.value = header.textContent;
        header.classList.add('invisible');
        changeInputHeader.classList.remove('invisible');
        changeInputHeader.focus();
        activeInputIdx = idQuestion - 1;
    });
    changeInputHeader.addEventListener('keyup', (e) => {
        if (e.key !== 'Enter') return;
        header.textContent = e.target.value;
        console.log(proxySurveyData.questions, e.target.value);
        proxySurveyData.questions[idQuestion - 1].questionTitle = e.target.value;
        header.classList.remove('invisible');
        changeInputHeader.classList.add('invisible');
        saveChangesOnSession();
    });
}

/**
 * Set the question type input in the question container
 * @param {HTMLDivElement} element
 */
function setInputQuestionType(element, { idQuestion }) {
    const inputType = document.createElement('input');
    inputType.type = 'text';
    inputType.classList.add('p-0', 'input-text', 'w-full');
    inputType.placeholder = 'Tipo de pregunta';
    element.appendChild(inputType);
    const inputTag = new Tagify(inputType, {
        //Aqui se pueden agregar los tags que se pueden agregar
        whitelist: ['Académico', 'Social', 'Económico'],
        dropdown: {
            maxItmes: 10,
            classname: 'tag-dropdown',
            enabled: 0,
            closeOnSelect: false,
        },
    })
    //Apuntar al elemento del proxy
    inputTag.on('change', (e) => {

        //Imprimimos el valor del elemento
        console.log(e.detail.value);

        // Mapeamos y convertimos el valor del proxy a un array
        proxySurveyData.questions[idQuestion - 1].selectedOptions = JSON.parse(e.detail.value).map(option => option.value.toLowerCase());
        
        // Guarda los cambios
        saveChangesOnSession();
    });

}

/**
 * Append the input to select the form to respond
 * @param {HTMLDivElement} element The element to insert the input
 */
function setInputResponseForm(element, { inputType, idQuestion }) {
    const inputQuestion = document.createElement('select');
    const defaultOption = document.createElement('option');
    const inputOption = document.createElement('option');
    const rangeOption = document.createElement('option');
    inputQuestion.classList.add('input-text', 'w-full');
    //
    inputQuestion.id = `questionType-${idQuestion}`;
    defaultOption.value = '';
    defaultOption.textContent = '---Seleccione una opción---';
    inputOption.value = 'texto';
    inputOption.textContent = 'Texto/Numero';
    rangeOption.value = 'rango';
    rangeOption.textContent = 'Rango';
    inputQuestion.appendChild(defaultOption);
    inputQuestion.appendChild(inputOption);
    inputQuestion.appendChild(rangeOption);
    element.appendChild(inputQuestion);


    //Aqui podemos agregar el listado de etiquetas que se pueden agregar
    inputQuestion.addEventListener('change', (e) => {
        e.preventDefault();
        const value = inputQuestion.value;
        const previewResponseContainer = e.target.parentElement; //document.querySelector('.preview');
        console.log(previewResponseContainer);
        const previewInput = previewResponseContainer.querySelector('.preview-input');
        const switchInput = {
            texto() {
                if (previewInput !== null) {
                    previewResponseContainer.removeChild(previewInput);
                }
                const newInput = createInputPreview();
                previewResponseContainer.appendChild(newInput);
            },
            rango() {
                if (previewInput !== null) {
                    previewResponseContainer.removeChild(previewInput);
                }
                const newInput = createRangePreview();
                previewResponseContainer.appendChild(newInput);
            }
        }
        switchInput[value]();
        debugger;
        const [, idInputQuestion] = e.target.id.split('-');
        proxySurveyData.questions[idInputQuestion - 1].questionAnswer = e.target.value;
        saveChangesOnSession();


    });
    if (inputType !== '' && inputType !== undefined) {
        const previewContainer = element.querySelector('.preview');
        const switchInput = {
            texto: createInputPreview(),
            rango: createRangePreview(),
        };
        previewContainer.appendChild(switchInput[inputType] ?? createInputPreview());
    }
    inputQuestion.value = inputType ?? '';
}

/**
 * Create and insert a delete button on the new question section
 * @param {HTMLDivElement} element
 * @param {any} id
 */
function setDeleteButton(element, id){
    const buttonContainer = document.createElement('div');
    const buttonElement = document.createElement('button');
    const imgDelete = document.createElement('img');
    imgDelete.src = './src/trash.svg';
    imgDelete.title = 'Eliminar pregunta';
    buttonContainer.classList.add('border-raduis-sm', 'overflow-hidden');
    buttonElement.classList.add(
        'icon-button',
        'border-none',
        'hover:bg-gray-200',
        'flex',
        'items-center',
        'justify-center',
    );
    buttonElement.id = id;
    imgDelete.classList.add('img-button')
    buttonElement.appendChild(imgDelete);
    buttonContainer.appendChild(buttonElement);
    element.appendChild(buttonContainer);
    buttonElement.addEventListener('click', (e) => {
        debugger;
        console.log(e);
        const idElement = e.target.id;
        console.log(idElement);
        proxySurveyData.questions.splice(Number(idElement) - 1, 1);
        const questionsContainer = document.querySelectorAll('.question-element');
        questionsContainer.forEach((questionContainer) => {
            questionList.removeChild(questionContainer);
        });
        proxySurveyData.questions.forEach((question, index) => {
            console.log(question);
            createQuestionElement({
                idQuestion: index + 1,
                questionTitle: question.questionTitle,
            });
        });
        saveChangesOnSession();
    });
}

/**
 * Create the optional switch button on each question
 * @param {HTMLElement} element The parent to insert the switch
 * @param isOptional If the question to answer need the value
 * @param idQuestion The number of the question
 */
function setOptionalSwitch(element, { isOptional, idQuestion }) {
    const switchContainer = document.createElement('div');
    const switchButton = document.createElement('input');
    const labelSwitch = document.createElement('label');
    switchContainer.classList.add('form-check', 'form-switch');
    switchButton.type = 'checkbox';
    switchButton.classList.add('form-check-input');
    labelSwitch.textContent = 'Obligatorio';
    labelSwitch.classList.add('form-check-label', 'font-semibold', 'text-sm');
    switchContainer.appendChild(switchButton);
    switchContainer.appendChild(labelSwitch);
    switchButton.addEventListener('change', (e) => {
       proxySurveyData.questions[idQuestion - 1].isOptional = e.target.checked;
       saveChangesOnSession();
    });
    switchButton.checked = isOptional ?? true;
    element.appendChild(switchContainer);
}

/**
 * Create an input preview
 */
function createInputPreview() {
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.placeholder = 'Así se vera para contestar la pregunta';
    newInput.disabled = true;
    newInput.classList.add('input-text', 'w-full', 'preview-input', 'cursor-disabled');
    return newInput;
}

/**
 * Create a range input preview
 */
function createRangePreview() {
    const newInput = document.createElement('input');
    newInput.type = 'range';
    newInput.classList.add('input-text', 'w-full', 'preview-input');
    return newInput;
}

/**
 * If sessionStorage exists, set the values found in the object
 * to the document
 */
function prepareSurveyData() {
    console.log(proxySurveyData);
    surveyTitle.textContent = proxySurveyData.title;
    surveyDescription.textContent = proxySurveyData.description;
    changeSurveyTitle.textContent = proxySurveyData.title;
    changeSurveyDescription.textContent = proxySurveyData.description;
    selectSurveyType.selectedIndex = proxySurveyData.surveyType - 1;
    proxySurveyData.questions.forEach(
        ({ questionTitle, isOptional, questionAnswer, ...question }, idx) => {
            createQuestionElement({
                idQuestion: idx + 1,
                questionTitle,
                isOptional,
                inputType: questionAnswer
            });
        }
    );
}

function saveChangesOnSession() {
    const jsonData = JSON.stringify(proxySurveyData);
    sessionStorage.setItem('surveyData', jsonData);
}

function saveInputValuesOnChange() {
    const htmlDivActiveElement = document.querySelectorAll('.header-question').item(activeInputIdx);
    const spanActiveElement = htmlDivActiveElement.querySelector('span');
    const inputActiveElement = htmlDivActiveElement.querySelector('input');
    proxySurveyData.questions[activeInputIdx].questionTitle = inputActiveElement.value;
    inputActiveElement.classList.add('invisible');
    spanActiveElement.classList.remove('invisible');
    spanActiveElement.textContent = inputActiveElement.value;
    saveChangesOnSession();
}

const cacheSurveyData = JSON.parse(sessionStorage.getItem('surveyData'));


const objectSurveyData = cacheSurveyData !== null
  ? cacheSurveyData
  : createProxySurveyDataObject();

const proxySurveyData = new Proxy(objectSurveyData, {
    get(target, key) {
        return key in target ? target[key] : undefined;
    },
    set(target, key, value) {
        if (typeof target[key] === 'number') {
            if (value <= 0) {
                throw new Error(`Invalid value of a number. Given: ${value}`);
            }
            return target[key] = value;
        }
        if (typeof target[key] === 'string') {
            if (value === '' || value.trim().length === 0) {
                throw new Error(`Invalid string given`);
            }
            return target[key] = value;
        }
        return { ...target, ...value };
    }
});

const surveyTitle = document.querySelector('#survey-title');
const surveyDescription = document.querySelector('#survey-description');
const changeSurveyTitle = document.querySelector('#change-survey-title');
const changeSurveyDescription = document.querySelector('#change-survey-description');
const addQuestion = document.getElementById('add-question');
const questionList = document.getElementById('questions');
const selectSurveyType = document.getElementById('survey-type');
const noAny = !surveyTitle || !surveyDescription;
let activeInputIdx = NaN;
saveChangesOnSession();
if(noAny) {
    throw new TypeError('Undefined HTML Elements');
}
if (addQuestion === null) {
    throw new TypeError('Unexpected HTML DOM Element');
}
if (questionList === null) {
    throw new TypeError('No container for questions detected');
}
if (cacheSurveyData !== null) {
    prepareSurveyData();
}

changeSurveyTitle.value = surveyTitle.textContent;
changeSurveyDescription.value = surveyDescription.textContent;

document.body.addEventListener('click', (e) => {
    console.log(e);
    const htmlDivActiveElement = document.querySelectorAll('.header-question').item(activeInputIdx);
    const spanActiveElement = htmlDivActiveElement.querySelector('span');
    const inputActiveElement = htmlDivActiveElement.querySelector('input');
    console.log(spanActiveElement, inputActiveElement);
    if (e.currentTarget.contains(changeSurveyTitle)) {
        surveyTitle.textContent = changeSurveyTitle.value;
        proxySurveyData.title = changeSurveyTitle.value;
        changeSurveyTitle.classList.add('invisible');
        surveyTitle.classList.remove('invisible');
        saveChangesOnSession();
    }
    if (e.currentTarget.contains(changeSurveyDescription)) {
        surveyDescription.textContent = changeSurveyDescription.value;
        proxySurveyData.description = changeSurveyDescription.value;
        changeSurveyDescription.classList.add('invisible');
        surveyDescription.classList.remove('invisible');
        saveChangesOnSession();
    }
    if (e.currentTarget.contains(inputActiveElement)) {
        saveInputValuesOnChange();
    }
})

surveyTitle.addEventListener('click', (e) => {
    e.stopPropagation();
    const surveyTitleIsNotActivated = changeSurveyTitle.classList.contains('invisible');
    const surveyDescriptionIsActivated = !changeSurveyDescription.classList.contains('invisible');
    const validation = surveyDescriptionIsActivated && surveyTitleIsNotActivated;
    if (validation) {
        changeSurveyDescription.classList.add('invisible');
        surveyDescription.classList.remove('invisible');

    }
    surveyTitle.classList.add('invisible');
    changeSurveyTitle.classList.remove('invisible');
    changeSurveyTitle.focus();
});

surveyDescription.addEventListener('click', (e) => {
    e.stopPropagation();
    const surveyTitleIsActivated = !changeSurveyTitle.classList.contains('invisible');
    const surveyDescriptionIsNotActivated = changeSurveyDescription.classList.contains('invisible');
    const validation = surveyDescriptionIsNotActivated && surveyTitleIsActivated;
    if (validation) {
        changeSurveyTitle.classList.add('invisible');
        surveyTitle.classList.remove('invisible');
    }
    surveyDescription.classList.add('invisible');
    changeSurveyDescription.classList.remove('invisible');
    changeSurveyDescription.focus();
});

changeSurveyTitle.addEventListener('keyup', (e) => {
    if (e.key !== 'Enter') return;
    surveyTitle.textContent = e.target.value;
    proxySurveyData.title = e.target.value;
    changeSurveyTitle.classList.add('invisible');
    surveyTitle.classList.remove('invisible');
    saveChangesOnSession();
});

changeSurveyDescription.addEventListener('keyup', (e) => {
    if (e.key !== 'Enter') return;
    surveyDescription.textContent = e.target.value;
    proxySurveyData.description = e.target.value;
    changeSurveyDescription.classList.add('invisible');
    surveyDescription.classList.remove('invisible');
    saveChangesOnSession();
});


//Seccion para agregar preguntas
addQuestion.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const idQuestion = proxySurveyData.questions.push({
        idQuestion: proxySurveyData.questions.length + 1,
        questionTitle: `Mi pregunta ${proxySurveyData.questions.length + 1}`,
        selectedOptions: [],
        questionAnswer: NaN,
        isOptional: true,
        jsonParams: '',
    });
    createQuestionElement({ idQuestion });
    saveChangesOnSession();
});

selectSurveyType.addEventListener('change', (e) => {
    proxySurveyData.surveyType = e.target.value;
    saveChangesOnSession();
});