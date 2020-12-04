/// <reference path="base-component.ts"/>
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop-interface.ts" />
namespace App{
     // Interface  can not only be used to define custom object type but also can be used to define contract for a class
     export class ProjectItem extends Component<HTMLDivElement, HTMLElement>  
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
 
}