
class EcuacionLineal {
    constructor(incognita) {
        this.incognita = incognita ?? 'x';
        this.terminosIzq = new Set();
        this.terminosDer = new Set();
        this.terminos = this.terminosIzq;
        this.estaSignoIgual = false;
        this.innerText = this.innerText.bind(this);
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
            valor: numero
        });
        return this;
    }

    addSignoIgual() {
        if (this.terminos === this.terminosDer) {
            throw new TypeError('No se puede duplicar el signo =');
        }
        this.estaSignoIgual = true;
        this.terminos = this.terminosDer;
        return this;
    }

    isValid() {
        if (this.terminosIzq.size === 0) return false;

        if (!this.estaSignoIgual) return false;

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
            return `${termino.valor}${this.incognita}`;
        } else if (!text && termino.tipo === 'numero' && termino.valor > 0) {
            return termino.valor;
        } else if (text && termino.tipo === 'variable' && termino.valor > 0) {
            return `${text}+${termino.valor}${this.incognita}`;
        } else if (text && termino.tipo === 'numero' && termino.valor > 0) {
            return `${text}+${termino.valor}`;
        } else if (termino.tipo === 'variable' && termino.valor < 0) {
            // return text + termino.valor + this.incognita;
            return `${text}${termino.valor}${this.incognita}`;
        }
        return `${text}${termino.valor}`;
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

const crearEcuacionLineal = () => new EcuacionLineal();


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

    expresiones.forEach((exp, index) => {
        console.log('Ejemplo: ', index + 1);
        const calculadora = new Calculadora(exp);
        calculadora.resolver();
        console.log();
    });
}


main();