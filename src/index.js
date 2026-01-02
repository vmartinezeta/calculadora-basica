
class SuperEcuacionLineal {
    constructor(incognita) {
        this.incognita = incognita;
        this.regexLiteral = new RegExp(`([+-]?\\d*\\.?\\d+)${this.incognita}(?!\\w)`, 'g');
        this.regexConstanteBit = new RegExp(`\\d*(?<!\\d*\\.?\\d+)${this.incognita}(?!\\w)`, 'g');
        this.regexCoeficientes = new RegExp(`[+-]?\\d*\\.?\\d+(?=${this.incognita}(?!\\w))`, 'g');
        this.regexConstantes = /[+-]?\d*\.?\d+/g;
        this.terminosIzq = new Set();
        this.terminosDer = new Set();
        this.terminos = this.terminosIzq;
        this.innerText = this.innerText.bind(this);
    }

    addVar(numero) {
        if (this instanceof EcuacionLineal) {
            throw new TypeError('No existe el metodo');
        }

        this.terminos.add({
            tipo: 'variable',
            valor: numero
        });
        return this;
    }

    addNumero(numero) {
        if (this instanceof EcuacionLineal) {
            throw new TypeError('No existe el metodo');
        }

        this.terminos.add({
            tipo: 'numero',
            valor: numero
        });
        return this;
    }

    addSignoIgual() {
        if (this instanceof EcuacionLineal) {
            throw new TypeError('No existe el metodo');
        }
        
        if (this.terminos === this.terminosDer) {
            throw new TypeError('No se puede duplicar el signo =');
        }
        this.terminos = this.terminosDer;
        return this;
    }

    isValid() {
        if (this.terminosIzq.size === 0) return false;

        if (!this.terminos === this.terminosIzq) return false;

        if (this.terminosDer.size === 0) return false;

        return true;
    }

    resolver() {
        if (!this.isValid()) {
            throw new TypeError('Ecuacion mal formada');
        }

        const [izq, der] = this.transponerTerminos(this.terminosIzq, this.terminosDer);
        const totalIzq = izq.reduce((result, termino) => result + termino.valor, 0);
        let totalDer = der.reduce((result, termino) => result + termino.valor, 0);

        const incognita = this.incognita;
        return {
            incognita,
            valor: totalDer / totalIzq
        };
    }

    transponerTerminos(izq, der) {
        izq.forEach(termino => {
            if (termino.tipo === 'numero') {
                izq.delete(termino);
                termino.valor *= -1;
                der.add(termino);
            }
        });

        der.forEach(termino => {
            if (termino.tipo === 'variable') {
                der.delete(termino);
                termino.valor *= -1;
                izq.add(termino);
            }
        });

        return [Array.from(izq), Array.from(der)];
    }

    toString() {
        return [...this.terminosIzq].reduce(this.innerText, '') + '=' + [...this.terminosDer].reduce(this.innerText, '');
    }

    innerText(text, termino) {
        if (!text && termino.tipo === 'variable' && termino.valor > 0) {
            return `${termino.valor===1?'':termino.valor}${this.incognita}`;
        } else if (!text && termino.tipo === 'numero' && termino.valor > 0) {
            return termino.valor;
        } else if (text && termino.tipo === 'variable' && termino.valor > 0) {
            return `${text}+${termino.valor===1?'':termino.valor}${this.incognita}`;
        } else if (text && termino.tipo === 'numero' && termino.valor > 0) {
            return `${text}+${termino.valor}`;
        } else if (termino.tipo === 'variable' && termino.valor < 0) {
            return `${text}${termino.valor===1?'':termino.valor}${this.incognita}`;
        }
        return `${text}${termino.valor}`;
    }

}


class EcuacionLineal extends SuperEcuacionLineal{

    constructor(expresion, variable) {
        super(variable);
        if (!this._isValid(expresion)) {
            throw new TypeError('No es valida la expresion');
        }

        if (this.terminos === this.terminosDer) {
            throw new TypeError('No se puede duplicar el metodo evaluate(texto)');
        }

        const exp = this.limpiarExpresion(expresion);
        const [izq, der] = exp.split(/=/);
        this.transformar(izq, this.terminosIzq);
        this.transformar(der, this.terminosDer);        
        this.terminos = this.terminosDer;
    }

    _isValid(expresion) {
        let exp = this.limpiarExpresion(expresion);
        if (/\=(?=\=+)/.test(exp)) return false;
        exp = exp.replace(this.regexLiteral, '')
        .replace(this.regexConstantes, '')
        .replace('=', '');
        if (exp.length) return false;
        return true;
    }

    limpiarExpresion(expresion) {
        // Eliminar espacios y convertir a minúsculas
        return expresion
            .replace(/\s+/g, '')
            .toLowerCase()
            .replace(/--/g, '+')  // Doble negativo = positivo
            .replace(/\+\+/g, '+') // Doble positivo = positivo
            .replace(/\+\-/g, '-') // Positivo y negativo = negativo
            .replace(/\-\+/g, '-') // Negativo y positivo = negativo
            .replace(this.regexConstanteBit, `1${this.incognita}`);
    }

    transformar(text, miembro) {
        const variables = text.match(this.regexCoeficientes) ?? [];
        variables.map(Number).forEach(valor => {
            miembro.add({
                tipo: 'variable',
                valor
            });
        });
        const nuevoText = text.replace(this.regexLiteral, '');
        const constantes = nuevoText.match(this.regexConstantes) ?? [];
        constantes.map(Number).forEach(valor => {
            miembro.add({
                tipo: 'numero',
                valor
            });
        });
    }    
}


class Calculadora {
    constructor(expresion) {
        this.expresion = expresion;
    }

    resolver() {
        try {
            console.log(this.expresion.toString())
            const result = this.expresion.resolver();
            console.log(result);
        } catch (error) {
            console.log(error);
        }
    }
}


function crearEcuacionLineal(arg0='x') {
    if (typeof arg0 === 'string') {
        return new SuperEcuacionLineal(arg0);
    }
    return new EcuacionLineal(arg0.expresion, arg0.variable);
} 


function main() {
    const expresiones = [];

    expresiones.push(
        crearEcuacionLineal()
            .addVar(4)
            .addNumero(-5)
            .addSignoIgual()
            .addVar(2)
            .addNumero(1)
    );

    expresiones.push(
        crearEcuacionLineal()
            .addNumero(5)
            .addVar(-4)
            .addSignoIgual()
            .addNumero(7)
            .addVar(8)
            .addNumero(-6)
    );

    expresiones.push(
        crearEcuacionLineal()
            .addVar(7)
            .addVar(-2)
            .addNumero(4)
            .addSignoIgual()
            .addNumero(8)
            .addVar(3)
            .addNumero(2)
    );

    expresiones.push(
        crearEcuacionLineal({expresion:'2y - 5 = 9', variable:'y'})
    )

    expresiones.forEach((exp, index) => {
        console.log('Ejemplo: ', index + 1);
        const calculadora = new Calculadora(exp);
        calculadora.resolver();
        console.log();
    });
}


main();