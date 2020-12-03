// Drag and Drop interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// Project status
enum ProjectStatus { 
    Active,
    Finished
}

// Project
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {

    }
}

// Function type - function that receives itme ( project ) and we do not care of any value that it returns
type Listener = (items: Project[]) => void;

// Project State Management
class ProjectState {
    
private listeners: Listener[] = [];             // Subscription to the state of project list (stores list of function)
private projects: Project[] = [];               // Holda the project item
    private static instance: ProjectState;      // Static implementation of the class

    // For singleton implementation
    private constructor() {}

    // Get instance of the class
    static getInstance() {
        if(this.instance) {
            return this.instance;
        }

        this.instance = new ProjectState();
        return this.instance;
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }


    addProject(title: string, description: string, numberOfPeople: number) {

        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numberOfPeople,
            ProjectStatus.Active
        );

        this.projects.push(newProject);

        this.updateListeners();
    }


    @autobind
    moveProject(projectId: string, newStatus: ProjectStatus) {
        let project = this.projects.find(project =>  project.id === projectId);
        if(projectId){
            project!.status = newStatus;
            this.updateListeners();
        }

    }

    private updateListeners() {
        // Whenever something changes in project than execute the listener
        for ( const listernFn of this.listeners) {

            // Slice it to return the copy of array and not orignial array
            listernFn(this.projects.slice());
        }
    }
}

// Global singleton instance of project state. Can be used anywhere in the file
const projectState = ProjectState.getInstance();

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


// Autobind decorator ( a decorater is a function) : Method decorator
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

// Component Base Class : Make it abstract class so that it can not be instantiated but only inherited
abstract class Component<T extends HTMLElement, U extends HTMLElement> { // When we inherit we set the concrete types

    templateElement: HTMLTemplateElement;
    hostElement: T; // HtmlElement;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {

        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!; // Type Casting
        this.hostElement = document.getElementById(hostElementId)! as T; // Type Casting


        // importNode from document takes pointer of a template content which exists on templateEmlement
        // Second argument is for deep clone or not
        const importedNode = document.importNode(this.templateElement.content, true);

        // Get the form in the project-input div
        this.element = importedNode.firstElementChild as U;

        if (newElementId) {
            // Set the id of the form to trigger the css
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtBegining: boolean ) {
        this.hostElement.insertAdjacentElement(insertAtBegining ? 'afterbegin':'beforeend', this.element);
    }

    abstract configure():void; // The concrete implement is missing and we can force any class inheriting to implement it
    abstract renderContent(): void;
}

// Interface  can not only be used to define custom object type but also can be used to define contract for a class
class ProjectItem extends Component<HTMLDivElement, HTMLElement>  
implements Draggable{
    
    private project: Project;

    get persons() {
        if(this.project.people === 1){
            return "1 person";
        }else{
            return `${this.project.people} persons` 
        }
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @autobind // Sets the scope of this
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData ('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    @autobind
    dragEndHandler(_: DragEvent) {} // Let typescript know we are not using it


    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned.';
        this.element.querySelector('p')!.textContent = this.project.description;
    }


}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> 
implements DragTarget{
    
    assignedProjects: Project [];

    constructor(private type : 'active' | 'finished') {

        super('project-list', 'app', false, `${type}-projects`)
        this.assignedProjects =[];
        
        // Subscribe to the listener
        projectState.addListener((projects: Project[]) => {
            const relevantProject = projects.filter(prj => {
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active; 
                }else{
                    return prj.status === ProjectStatus.Finished;
                }
            })

            this.assignedProjects = relevantProject;
            this.configure();
            this.renderProjects();
        })

       
        this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {

            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
        
    }

    @autobind
    dropHandler(event: DragEvent) {
        const projectId = event.dataTransfer?.getData('text/plain');
        if(projectId){
            projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active  : ProjectStatus.Finished)
        }        
    }

    @autobind
    dragLeaveHandler(event: DragEvent) {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-project-list`)!;

        // Clear all list-item before re-rendering
        listEl.innerHTML = '';

        for ( const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }

    // Need to implment as its part of base class ( can omit if we make configure method as an optional )
    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
    } 

    renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }    
}


// ProjectInput Class
class ProjectInput extends Component< HTMLDivElement, HTMLFormElement>{

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

const newProjectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');

