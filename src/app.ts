class ProjectInput{

    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement; // HtmlElement;
    element: HTMLFormElement;

    constructor(){
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!; // Type Casting
        this.hostElement = document.getElementById('app')! as HTMLDivElement; // Type Casting

        // importNode from document takes pointer of a template content which exists on templateEmlement
        // Second argument is for deep clone or not
        const importedNode = document.importNode(this.templateElement.content, true);

        // Get the form in the project-input div
        this.element = importedNode.firstElementChild as HTMLFormElement;

        this.attach();
    }

    private attach() {

        // insertAdjacentElement : default method provided by javascript to insert an html element.
        // first argument - where to insert the element
        // second argument - htmlDocumentFragment
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const newProjectInput = new ProjectInput()