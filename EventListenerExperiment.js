class EventListener {
    constructor(type, listener) {
        this.type = type;
        this.listener = listener;
    }
}

class A {
    constructor() {
        this.count = 0;
        this.eventListener = new EventListener("addition", this.set.bind(this));
    }

    set(detail) {
        this.count = detail.value;
        console.log(this.count);
    }

}

class B {
    constructor() {
        this.value = 0;
        this.eventListeners = []
    }

    addEventListener(eventListener) {
        this.eventListeners.push(eventListener);
    }

    dispatch(event) { 
        this.eventListeners.forEach((eventListener) => {
            if(eventListener.type === event.type) {
                eventListener.listener(event.detail); 
            }
        }); 
    }

    add(x) {
        this.value += x;
        console.log(this.count);
        let addEevnt = new CustomEvent("addition", {
            detail: {
                value: this.value
            }
        });
        this.dispatch(addEevnt);
    }

}

/*
let A = {};
A.countIncreased = function(count) { console.log('count:' + count); };
A.countIncreased(3);

let B = {};
B.count = 0;
B.listeners = [];
B.addListener = function(listener) { this.listeners.push(listener); };
B.notify = function(count) { this.listeners.forEach((l) => { l.countIncreased(count); }); };
B.business = function() { this.count += 1; this.notify(this.count); };

B.addListener(A);
B.notify(13);

B.business();
*/

let a = new A();
let c = new A();


let b = new B();


b.addEventListener(a.eventListener);
b.addEventListener(c.eventListener);

b.add(1);



