/// <reference path="base-component.ts"/>

namespace App {
    // ProjectInput Class
    export class ProjectInput extends Component< HTMLDivElement, HTMLFormElement>{

        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;

        constructor(){

            super('project-input', 'app', true,  'user-input');
            
            // Get other input elements of the form as properties
            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
            
            this.configure();       
        }

        // Setup an event listener
        configure() {

            // Bind the handler to event
            //this.element.addEventListener('submit', this.submitHandler.bind(this))

            // Below line is for decorator implementation where as above line is a workaround for this
            this.element.addEventListener('submit', this.submitHandler)
        }

        renderContent(){}

        // Collect user input and validate and return a tuple
        private gatherUserInput(): [string, string, number] | void {
            const enteredTitle  = this.titleInputElement.value;
            const enteredDescription  = this.descriptionInputElement.value;
            const enteredPeople  = this.peopleInputElement.value;

            const titleValidatatble: Validatable = {
                value: enteredTitle,
                required: true,            
            }

            const descriptionValidatatble: Validatable = {
                value: enteredDescription,
                required: true, 
                minLength: 5           
            }

            const peopleValidatatble: Validatable = {
                value: enteredPeople,
                required: true,
                min: 1,
                max: 5            
            }

            if (
                !validate(titleValidatatble) ||
                !validate(descriptionValidatatble) ||
                !validate(peopleValidatatble)
                ) {
                    alert("Invalid input. Please try again");
                    return;
            }else{
                return [enteredTitle, enteredDescription, +enteredPeople]
            }
        }

        private clearInput() {
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
            this.peopleInputElement.value = ''
        }

        // The autobind decorator is used to manage the context of this keyword
        @autobind
        private submitHandler(event:Event){

            // Stop event propagation
            event.preventDefault();
            //console.log(this.ttileInputElement.value);

            const userInput = this.gatherUserInput();

            // Tuple is a kind of array
            if (Array.isArray(userInput)) {
                const [title, desc, people] = userInput;
                projectState.addProject(title, desc, people);
            }

            this.clearInput();
        }
    }
}