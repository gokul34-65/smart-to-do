let tasks = JSON.parse(localStorage.getItem('tasks'))||[];

const toDoList = document.querySelector('.to-do-list');
const toDoInput = document.querySelector('.to-do-input');
const toDoDescription = document.querySelector('.to-do-description');
const addToButton = document.querySelector('.add-to-do-button');
const generateToDoButton = document.querySelector('.generate-to-do-button');
const aiPrompt = document.querySelector('.prompt');

if(tasks){
     renderTasks();
}

function renderTasks(){
     toDoList.innerHTML = "";
     let taskContentsHtml = ``;
     tasks.forEach((task, index) => {
          taskContentsHtml += `<li>
               <input class="task-status-checkbox" type="checkbox" data-task-id="${task.id}">
               <p class="task-name unfinished" data-task-id="${task.id}">${task.name}</p>
               <div class="task-buttons">
                    ${index > 0 ? `<button class="move-up-button" data-task-id="${task.id}">↑</button>` : ''}
                    ${index < tasks.length - 1 ? `<button class="move-down-button" data-task-id="${task.id}">↓</button>` : ''}
                    <button class="delete-task-button" data-task-id="${task.id}">delete</button>
               </div>
          </li>`;
     });

     toDoList.innerHTML = taskContentsHtml;
     addNecessariesToNewElements();
     restorePreviousStates();
}

function restorePreviousStates(){
     //restoring the checkboxes
     document.querySelectorAll('.task-status-checkbox').forEach((checkbox)=>{
          const taskId = parseInt(checkbox.dataset.taskId);
          tasks.forEach((task)=>{
               if(task.id === taskId){
                    checkbox.checked = task.finished;
               }
          })
     })
     //restoring to-do name strikeouts
     document.querySelectorAll('.task-name').forEach((taskName)=>{
          const taskId = parseInt(taskName.dataset.taskId);
          let finishedFlag;
          tasks.forEach((task)=>{
               if(task.id === taskId){
                    if(task.finished){
                         if(taskName.classList.contains("unfinished")){
                              taskName.classList.remove("unfinished");
                         }
                         taskName.classList.add("finished");
                    }
                    else{
                         if(taskName.classList.contains("finished")){
                              taskName.classList.remove("finished");
                         }
                         taskName.classList.add("unfinished");
                    }
               }
          })
     })
}

function addNecessariesToNewElements(){
     //event listeners for delete buttons
     document.querySelectorAll('.delete-task-button').forEach((deleteButton)=>{
          deleteButton.addEventListener('click',()=>{
               const taskId = parseInt(deleteButton.dataset.taskId);
               console.log(taskId);
               deleteTask(taskId);
          });
     })

     document.querySelectorAll('.task-status-checkbox').forEach((checkBox)=>{
          checkBox.addEventListener('change',()=>{
               const taskId = parseInt(checkBox.dataset.taskId);
               if(checkBox.checked){
                    finishTask(taskId);
                    console.log("Checked");
               }
               else{
                    unFinishTask(taskId);
                    console.log("Unchecked");
               }
          })
     })

     // Event listeners for up/down buttons
     document.querySelectorAll('.move-up-button').forEach((upButton) => {
          upButton.addEventListener('click', () => {
               const taskId = parseInt(upButton.dataset.taskId);
               moveTaskUp(taskId);
          });
     });

     document.querySelectorAll('.move-down-button').forEach((downButton) => {
          downButton.addEventListener('click', () => {
               const taskId = parseInt(downButton.dataset.taskId);
               moveTaskDown(taskId);
          });
     });
}

function moveTaskUp(taskId) {
     const taskIndex = tasks.findIndex(task => task.id === taskId);
     if (taskIndex > 0) {
          // Swap with the task above
          [tasks[taskIndex], tasks[taskIndex - 1]] = [tasks[taskIndex - 1], tasks[taskIndex]];
          saveToLocalStorage();
          renderTasks();
     }
}

function moveTaskDown(taskId) {
     const taskIndex = tasks.findIndex(task => task.id === taskId);
     if (taskIndex < tasks.length - 1) {
          // Swap with the task below
          [tasks[taskIndex], tasks[taskIndex + 1]] = [tasks[taskIndex + 1], tasks[taskIndex]];
          saveToLocalStorage();
          renderTasks();
     }
}

function addTask(){
     const inputName = toDoInput.value;
     if(!inputName){
          return;
     }
     toDoInput.value = "";
     const inputDescription = toDoDescription.value;
     const taskObject = {
          id:Date.now(),
          name:inputName,
          description:inputDescription,
          finished:false
     };
     tasks.push(taskObject);
     renderTasks();
     saveToLocalStorage();
}

function finishTask(taskId){
     tasks.forEach((task)=>{
          if(task.id === taskId){
               task.finished = true;
               renderTasks();
               saveToLocalStorage();
               return true;
          }
     })
     return false;
}

function unFinishTask(taskId){
     tasks.forEach((task)=>{
          if(task.id === taskId){
               task.finished = false;
               renderTasks();
               saveToLocalStorage();
               return true;
          }
     })
     return false;
}

function deleteTask(taskId){
     const tempList = [];
     tasks.forEach((task)=>{
          if(task.id != taskId){
               tempList.push(task);
          }
     })
     tasks = tempList;
     saveToLocalStorage();
     renderTasks();
}

function saveToLocalStorage(){
     const data = JSON.stringify(tasks);
     localStorage.setItem('tasks',data);
}

async function generateFromAI(){
     const inputPrompt =  aiPrompt.value
     if(!inputPrompt){
          return;
     }
     //styling of the button
     generateToDoButton.disabled = true;
     generateToDoButton.innerHTML = "Loading..";
     generateToDoButton.classList.add('blocked');

     const response = await processApiRequest(inputPrompt);

     const isEmpty = (json) => Object.keys(json).length === 0;

     if(isEmpty(response)){
          //bad response
          alert('Cannot create a to-do list with the given prompt');
     }
     else{
          //good response
     }

     populateTasks(response);
     renderTasks();
     //styling of the button
     generateToDoButton.disabled = false;
     generateToDoButton.innerHTML = "generate&#10024;";
     generateToDoButton.classList.remove('blocked');
}

function populateTasks(jsonData){
     let counter = 1;//used for generating unique id
     jsonData.forEach((data)=>{
          const name = data.name;
          const description = data.description;
          const finished = false;
          
          tasks.push(
               {
                    id:Date.now()+counter++,
                    name:name,
                    description:description,
                    finished:finished
               }
          )
     })
}

async function processApiRequest(prompt){
     try{
          const response = await fetch('https://appsail-50025049875.development.catalystappsail.in/generateResponse', {
               method: 'POST',
               headers: {
                 'Content-Type': 'text/plain' 
               },
               body: prompt 
             });
             return response.json();
     }
     catch(error){
          const problem = 'error inside ProcessApiRequest';
          return problem;
     }
}

addToButton.addEventListener('click',addTask);
generateToDoButton.addEventListener('click',generateFromAI);
