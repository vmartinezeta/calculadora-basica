class EcuacionLineal {
    constructor() {
        this.terminosIzq = [];
        this.terminosDer = [];
        this.terminos = this.terminosIzq;
        this.estaSignoIgual = false;
    }

    addVar(numero) {
        this.terminos.push({
            tipo: 'variable',
            valor: numero
        });
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
        if (this.terminosIzq.length === 0 ) {
            throw new TypeError('No es una ecuacion');
        }
        if (this.estaSignoIgual) {
            throw new TypeError('No puede duplicar el signo =');
        }
        this.estaSignoIgual = true;
        this.terminos = this.terminosDer;
        return this;
    }

    isValid() {
        if (!this.estaSignoIgual) {
            return false;            
        }

        if(this.terminosIzq.length === 0) {
            return false;
        }
        return true;
    }

    resolver() {
        if (!this.isValid()) {
            throw new TypeError('Expresion mal formada');
        }

        this.transponerTerminos();

        const totalDer = this.terminosDer.reduce((result, termino) => {
            return result + termino.valor;
        }, 0);

        const totalIzq = this.terminosIzq.reduce((result, termino) => {
            return result + termino.valor;
        }, 0);

        if ([-1, 1].includes(totalIzq)) {
            if (totalIzq<0) totalDer *=-1;
            return {
                incognita: 'x',
                valor:totalDer
            };
        } else {
            return {incognita:'x',
                valor:totalDer / totalIzq
            };
        }
    }

    transponerTerminos() {
        this.pasarIzqDer();
        this.pasarDerIzq();
    }

    pasarIzqDer() {
            this.terminosIzq
            .map((termino, index)=> ({termino, index}))
            .filter(({termino}) => termino.tipo === 'numero')
            .forEach(({termino, index}) => {
                this.terminosIzq.splice(index, 1);
                termino.valor *=-1;
                this.terminosDer.push(termino);
            });        
    }

    pasarDerIzq() {
            this.terminosDer
            .map((termino, index)=> ({termino, index}))
            .filter(({termino}) => termino.tipo === 'variable')
            .forEach(({termino, index}) => {
                this.terminosDer.splice(index, 1);
                termino.valor *= -1; 
                this.terminosIzq.push(termino);
            });        

    }

    toString() {
        const terminos = [...this.terminosIzq, {tipo:'signo', valor:'='}, ...this.terminosDer];
        return terminos.reduce((text, termino, index) => {
            if (!text && termino.tipo==='variable' && termino.valor>0) {
                return this.output(termino, 'x');
            } else if (!text && termino.tipo==='numero' && termino.valor>0) {
                return this.output(termino);
            } else if (text && termino.tipo==='variable' && termino.valor>0) {
                return text + '+' + this.output(termino, 'x');
            } else if (text && termino.tipo==='numero' && termino.valor>0 && index===this.terminosIzq.length+1) {
                return text + this.output(termino);
            }  else if (text && termino.tipo==='numero' && termino.valor>0) {
                return text + '+' + this.output(termino);
            }
            return `${text}${this.output(termino, 'x')}`;
        },'');
    }

    output(termino, nombre) {
        if (termino.tipo === 'variable') {
            return termino.valor + nombre
        }
        return termino.valor;
    }
}


class Calculadora {
    constructor(expresion) {
        this.expresion = expresion;
    }

    resolver() {
        try {
            console.log(expresion.toString())
            const result = expresion.resolver();
            console.log(result);
        } catch (error) {
            console.log(error);
        }
    }
}

const crearEcuacionLineal = () => new EcuacionLineal();

const expresion  = crearEcuacionLineal()
.addVar(7)
.addVar(-2)
.addNumero(4)
.addSignoIgual()
.addNumero(8)
.addVar(3)
.addNumero(2);

const calc = new Calculadora(expresion);
calc.resolver();