// const person = {
//     name: 'Cesaro Section',
//     age: 40
// };

// export default person;

class Wrestler {
    constructor(nm, age) {
        this.name = nm;
        this.age = age;
    }

    signature() {
        console.log(`My name is ${this.name} and I am ${this.age}`)
    }
}

export default Wrestler