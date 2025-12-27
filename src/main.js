class EcuacionLineal {
    constructor(incognita) {
        this.incognita = incognita ?? 'x';
        this.terminosIzq = new Set();
        this.terminosDer = new Set();
        this.terminos = this.terminosIzq;
        this.estaSignoIgual = false;
    }

    addVar(numero) {
        this.terminos.add({
            tipo: 'variable',
            valor: numero
        });
        return this;
    }

    addNumero(numero) {
        this.terminos.add({
            tipo: 'numero',
            valor:numero
        });
        return this;
    }

    addSignoIgual() {
        if (this.terminosIzq.size === 0 ) {
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

        if(this.terminosIzq.size === 0) {
            return false;
        }
        return true;
    }

    resolver() {
        if (!this.isValid()) {
            throw new TypeError('Expresion mal formada');
        }

        this.transponerTerminos();

        const totalDer = [...this.terminosDer].reduce((result, termino) => {
            return result + termino.valor;
        }, 0);

        const totalIzq = [...this.terminosIzq].reduce((result, termino) => {
            return result + termino.valor;
        }, 0);
        const incognita = this.incognita;
        if ([-1, 1].includes(totalIzq)) {
            if (totalIzq<0) totalDer *=-1;
            return {
                incognita,
                valor:totalDer
            };
        } else {
            return {
                incognita,
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
            .forEach((termino) => {
                if (termino.tipo === 'numero') {
                    this.terminosIzq.delete(termino);
                    termino.valor *=-1;
                    this.terminosDer.add(termino);
                }
            });        
    }

    pasarDerIzq() {
            this.terminosDer
            .forEach((termino) => {
                if (termino.tipo === 'variable') {
                    this.terminosDer.delete(termino);
                    termino.valor *= -1; 
                    this.terminosIzq.add(termino);
                }
            });        

    }

    toString() {
        let ecuacion = [...this.terminosIzq].reduce((text, termino) => {
            return this.innerText(text, termino);
        },'');
        ecuacion += '=';
        ecuacion += [...this.terminosDer].reduce((text, termino) => {
            return this.innerText(text, termino);
        }, '');
        return ecuacion;
    }

    innerText(text, termino) {
            if (!text && termino.tipo==='variable' && termino.valor>0) {
                return termino.valor + this.incognita;
            } else if (!text && termino.tipo==='numero' && termino.valor>0) {
                return termino.valor;
            } else if (text && termino.tipo==='variable' && termino.valor>0) {
                return text + '+' + termino.valor + this.incognita;
            } else if (text && termino.tipo==='numero' && termino.valor>0) {
                return text + '+' + termino.valor;
            } else if (termino.tipo === 'variable' && termino.valor<0) {
                return text + termino.valor + this.incognita;
            }
            return text + termino.valor;
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
