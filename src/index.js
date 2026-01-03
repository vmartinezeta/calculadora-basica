import rl from 'readline';

const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});


class SolucionarioEcuacion {
    constructor(incognita) {
        this.incognita = incognita;
        this.terminosIzq = new Set();
        this.terminosDer = new Set();
        this.terminos = this.terminosIzq;
        this.innerText = this.innerText.bind(this);
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
            return `${termino.valor === 1 ? '' : termino.valor}${this.incognita}`;
        } else if (!text && termino.tipo === 'numero' && termino.valor > 0) {
            return termino.valor;
        } else if (text && termino.tipo === 'variable' && termino.valor > 0) {
            return `${text}+${termino.valor === 1 ? '' : termino.valor}${this.incognita}`;
        } else if (text && termino.tipo === 'numero' && termino.valor > 0) {
            return `${text}+${termino.valor}`;
        } else if (termino.tipo === 'variable' && termino.valor < 0) {
            return `${text}${termino.valor === 1 ? '' : termino.valor}${this.incognita}`;
        }
        return `${text}${termino.valor}`;
    }

}

class SuperEcuacionLineal extends SolucionarioEcuacion {
    constructor(incognita) {
        super(incognita);
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

}

class EcuacionLineal extends SolucionarioEcuacion {
    constructor(expresion, variable) {
        super(variable);
        this.expresion = expresion;
        this.valido = false;
        this.regexLiteral = new RegExp(`([+-]?\\d*\\.?\\d+)${this.incognita}(?!\\w)`, 'g');
        this.regexConstanteBit = new RegExp(`\\d*(?<!\\d*\\.?\\d+)${this.incognita}(?!\\w)`, 'g');
        this.regexCoeficientes = new RegExp(`[+-]?\\d*\\.?\\d+(?=${this.incognita}(?!\\w))`, 'g');
        this.regexConstantes = /[+-]?\d*\.?\d+/g;

        this.validar(expresion);
        if (!this.valido) {
            return;
        }

        const [izq, der] = this.expresion.split(/=/);
        this.transformar(izq, this.terminosIzq);
        this.transformar(der, this.terminosDer);
        this.terminos = this.terminosDer;
    }

    validar(input) {
        const expresion = this.limpiarExpresion(input);
        if (/\=(?=\=+)/.test(expresion)) {
            this.valido = false;
            return;
        }
        const final = expresion.replace(this.regexLiteral, '')
            .replace(this.regexConstantes, '')
            .replace('=', '');
        if (final.length)  {
            this.valido = false;
            return;
        }
        this.valido = true
        this.expresion = expresion;
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
    constructor() {
        this.incognita = 'x';
    }

    menuPrincipal() {
        console.log('  1.- Ecuaciones lineales de primer grado');
        console.log('  2.- Ecuaciones lineales con dos incognitas');
        console.log('  3.- Ecuaciones cuadraticas');
        console.log('  4.- Ejemplos de prueba');
        console.log(`  5.- Cambiar variable(actual = ${this.incognita}) ecuaciones lineales de primer grado`);
        console.log('  6.- Salir');
    }

    async render() {
        console.log('Calculadora basica');
        this.menuPrincipal();
        const answer = await this.inputText('\n¿Inserte una opcion?: ');
        this.procesarOpcionMenu(answer);
    }

    async procesarOpcionMenu(answer) {
        switch (answer) {
            case '1':
                await this.resolverEcuacionesLineales();
                this.render();
                break;
            case '4':
                this.ejemplificar();
                this.render();
                break;
            case '5':
                await this.updateIncognita();
                this.render()
                break;
            case '6':
                readline.close();
                break;
            default:
                this.render();
        }
    }

    inputText(text) {
        return new Promise((resolve) => {
            readline.question(text, (answer) => {
                resolve(answer);
            });
        });
    }

    async resolverEcuacionesLineales() {
        const expresion = await this.inputText('\n¿Inserte una ecuacion lineal?:');
        const ecuacion = this.crearEcuacionLineal({expresion, variable:this.incognita});
        if (ecuacion.valido) {
            console.log('Ecuacion: ',ecuacion.toString())
            const result = ecuacion.resolver();
            console.log(result);
        } else {
            console.log("Ecuacion mal formada");
        }
    }

    ejemplificar() {
        const expresiones = [];

        expresiones.push(
            this.crearEcuacionLineal()
                .addVar(4)
                .addNumero(-5)
                .addSignoIgual()
                .addVar(2)
                .addNumero(1)
        );

        expresiones.push(
            this.crearEcuacionLineal()
                .addNumero(5)
                .addVar(-4)
                .addSignoIgual()
                .addNumero(7)
                .addVar(8)
                .addNumero(-6)
        );

        expresiones.push(
            this.crearEcuacionLineal()
                .addVar(7)
                .addVar(-2)
                .addNumero(4)
                .addSignoIgual()
                .addNumero(8)
                .addVar(3)
                .addNumero(2)
        );

        expresiones.push(
            this.crearEcuacionLineal({ expresion: '2y - 5 = 9', variable: 'y' })
        )

        console.log('Ejemplos de prueba');
        expresiones.forEach((exp, index) => {
            console.log('Ejemplo: ', index + 1);
            try {
                console.log(exp.toString());
                console.log(exp.resolver());
            } catch (error) {
                console.log(error);
            }
            console.log();
        });
    }

    async updateIncognita() {
        const answer = await this.inputText('\n ¿Ingrese la nueva variable?:');
        if (answer.length === 1 && /[a-z]/.test(answer)) {
            this.incognita = answer;
        }
    }

    crearEcuacionLineal(arg0 = 'x') {
        if (typeof arg0 === 'string') {
            return new SuperEcuacionLineal(arg0);
        }
        return new EcuacionLineal(arg0.expresion, arg0.variable);
    }

}


const calculadora = new Calculadora();
calculadora.render();