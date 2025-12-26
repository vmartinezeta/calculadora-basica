class EcuacionLineal {
    constructor() {
        this.terminos = [];
    }

    addVar(numero) {
        this.terminos.push({
            tipo: 'variable',
            valor: numero
        })
        return this;
    }

    addNumero(numero) {
        this.terminos.push({
            tipo: 'numero',
            valor:numero
        });
        return this;
    }

    addSignoIgual() {
        if (this.terminos.length === 0) {
            throw new TypeError('No hay un miembro izquierdo');
        }
        if (this.terminos.some(t => t.tipo === 'signo')) {
            throw new TypeError('Ya existe un signo en la expresion');
        }
        this.terminos.push({
            tipo:'signo',
            valor: '='
        });
        return this;
    }

    isValid() {
        if (this.terminos.every(t => t.tipo !== 'signo')) {
            return false;            
        }
        const index = this.terminos.findIndex(t => t.tipo === 'signo');
        if(!this.terminos[index+1]) {
            return false;
        }
        return true;
    }

    resolver() {
        if (!this.isValid()) {
            throw new TypeError('Expresion mal formada');
        }

        this.transponerTerminos();

        const totalDer = this.getMiembro('derecho').map(t => t.termino).reduce((result, termino) => {
            return result + termino.valor;
        }, 0);

        const totalIzq = this.getMiembro('izquierdo').map(t => t.termino).reduce((result, termino) => {
            return result + termino.valor;
        }, 0);
        if ([-1, 1].includes(totalIzq)) {
            if (totalIzq<0) totalDer *=-1;
            return totalDer;
        } else {
            const result = totalDer / totalIzq;
            return result;
        }
    }

    getMiembro(tipo) {
        const index = this.terminos.findIndex(t => t.tipo === 'signo');
        if (tipo === 'izquierdo') {
            return this.terminos.filter((_, i)=> i<index)
                .map((termino, index) => ({termino, index}));
        } else if (tipo === 'derecho') {
            return this.terminos.filter((_, i)=> i>index)
                .map((termino, index) => ({termino, index}));
        }
        throw new TypeError('No es una ecuacion');
    }

    transponerTerminos() {
        this.pasarIzqDer();
        this.pasarDerIzq();
    }

    pasarIzqDer() {
            const array = this.getMiembro('izquierdo')
            .filter(({termino}) => termino.tipo === 'numero')
            array.forEach(({termino, index}) => {
                this.terminos.splice(index, 1);
                termino.valor *=-1;
                this.terminos.push(termino);
            });        
    }

    pasarDerIzq() {
            const array = this.getMiembro('derecho')
            .filter(({termino}) => termino.tipo === 'variable');

            array.forEach(({termino, index}) => {
                this.terminos.splice(index, 1);
                termino.valor *= -1; 
                this.terminos.unshift(termino);
            });        

    }
}


class Calculadora {
    constructor(expresion) {
        this.expresion = expresion;
    }

    resolver() {
        try {
            console.log(expresion.resolver());
        } catch (error) {
            console.log(error);
        }
    }
}

const crearExpresion = () => new EcuacionLineal();

const expresion  = crearExpresion()
.addVar(2)
.addNumero(5)
.addSignoIgual()
.addNumero(10);

const calc = new Calculadora(expresion);
calc.resolver();