const btnStorageSurvey = document.getElementById('save-survey');
const URL_POST = `${location.origin}/api/survey/storage`;
const idSurvey = sessionStorage.getItem('idSurvey');
if (idSurvey) {
    btnStorageSurvey.disabled = true;
    btnStorageSurvey.style.cursor = 'not-allowed';
}

if (btnStorageSurvey === null) {
    throw new Error("The element doesn't exists");
}

async function storageSurvey() {

    const surveyData = sessionStorage.getItem('surveyData');
    const surveyDataDecode = JSON.parse(surveyData);
   
    const body = JSON.stringify({
        //Generar cuerpo del json
        data: {
            title: surveyDataDecode.title,
            description: surveyDataDecode.description,
            type: surveyDataDecode.surveyType,
        },
        questions: surveyDataDecode.questions,
    });

    //Para descargar el archivo
    var blob = new Blob([body], { type: "application/json" });

    // Crea un enlace de descarga
    var enlaceDescarga = document.createElement("a");
    enlaceDescarga.href = window.URL.createObjectURL(blob);
    enlaceDescarga.download = surveyDataDecode.title+".json";

    // Añade el enlace al documento y simula un clic para iniciar la descarga
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
}


//Metodo para validar el formulario
function validateForm() {
    const selector = document.getElementById('survey-type');
    var selected = selector.options[selector.selectedIndex].value;

    if (!selected) {

        //Quitar clase original
        selector.classList.remove('input-text');
        //Agregar clase de error
        selector.classList.add('input-text-error');

        alert("Por favor, selecciona una opción");
        return false;
    }

    return true;
}


btnStorageSurvey.addEventListener('click', (ev) => {

    //Validar campos preguntas
    const surveyData = sessionStorage.getItem('surveyData');
    const surveyDataDecode = JSON.parse(surveyData);

    surveyDataDecode.questions.forEach((question) => {

        if (!question.questionAnswer) {
            const questionElement = document.getElementById("questionType-"+question.idQuestion);

            //Quitar clase original
            questionElement.classList.remove('input-text');
            //Agregar clase de error
            questionElement.classList.add('input-text-error');

            questionElement.addEventListener('change', () => {
                questionElement.classList.remove('input-text-error');
                questionElement.classList.add('input-text');
            });

            alert("Por favor, selecciona una opción en la pregunta: " + question.questionTitle);
            return false;
        }
        else{
            ev.stopPropagation();
            storageSurvey().then((data) => {
                sessionStorage.removeItem('surveyData');
                location.reload();
            }).catch((e) => {
                console.error(e);
            });
        }
    });
});
