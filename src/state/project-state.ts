namespace App {

      // Function type - function that receives itme ( project ) and we do not care of any value that it returns
      type Listener = (items: Project[]) => void;

     // Project State Management
     export class ProjectState {
        
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

                // Check if project is available or not
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
    export const projectState = ProjectState.getInstance();
    
}