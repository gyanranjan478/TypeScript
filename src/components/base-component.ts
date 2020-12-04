namespace App {
    // Component Base Class : Make it abstract class so that it can not be instantiated but only inherited
    export abstract class Component<T extends HTMLElement, U extends HTMLElement> { // When we inherit we set the concrete types

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
}