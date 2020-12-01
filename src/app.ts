// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    // undefined and ? both means same in the above snippet
}


function validate(validatableInput: Validatable) {
    let isValid = true;

    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }

    if(validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }

    if(validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length > validatableInput.maxLength;
    }

    if(validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }

    if(validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }

    return isValid;
}


// autobind decorator ( a decorater is a function) : Method decorator
function autobind(
    _: any, 
    _2: string, 
    descriptor: PropertyDescriptor
){
    const orginalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = orginalMethod.bind(this);
            return boundFn;
        }
    }

    return adjustedDescriptor;
}


// ProjectInput Class
class ProjectInput{

    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement; // HtmlElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!; // Type Casting
        this.hostElement = document.getElementById('app')! as HTMLDivElement; // Type Casting

        // importNode from document takes pointer of a template content which exists on templateEmlement
        // Second argument is for deep clone or not
        const importedNode = document.importNode(this.templateElement.content, true);

        // Get the form in the project-input div
        this.element = importedNode.firstElementChild as HTMLFormElement;
        // Set the id of the form to trigger the css
        this.element.id = 'user-input';


        // Get other input elements of the form as properties
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;


        this.configure();
        this.attach();
    }

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
            console.log(title,desc, people);
        }

        this.clearInput();
    }

    // Setup an event listener
    private configure() {

        // Bind the handler to event
        //this.element.addEventListener('submit', this.submitHandler.bind(this))

        // Below line is for decorator implementation where as above line is a workaround for this
        this.element.addEventListener('submit', this.submitHandler)
    }
    private attach() {

        // insertAdjacentElement : default method provided by javascript to insert an html element.
        // first argument - where to insert the element
        // second argument - htmlDocumentFragment
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const newProjectInput = new ProjectInput()