export class Queue<T> {
    private elements: Array<T> = [];

    enqueue(element: T): void {
        this.elements.push(element);
    }

    dequeue(): T | undefined {
        return this.elements.shift();
    }

    removeElement(predicate: (Element : T) => boolean): void {
        const index = this.elements.findIndex(predicate);
        if(index !== -1){
            this.elements.splice(index,1);
        }
    }

    isEmpty(): boolean {
        return this.elements.length === 0;
    }

    peek(): T | undefined {
        return !this.isEmpty() ? this.elements[0] : undefined;
    }

    length(): number {
        return this.elements.length;
    }

    snag(): Array<T>{
        return this.elements;
    }
}