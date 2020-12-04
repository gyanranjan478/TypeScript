namespace App {
      // Autobind decorator ( a decorater is a function) : Method decorator
     export function autobind(
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

}