class ValidadorEcuacion {
    constructor(incognita = 'x') {
        this.incognita = incognita;
        this.regexCoeficientes = null;
        this.regexConstantes = null;
        this.construirRegex();
    }

    construirRegex() {
        // Regex para coeficientes de la incógnita (con lookahead positivo)
        const patronCoeficientes = `[+-]?\\d*\\.?\\d+(?=${this.incognita}(?!\\w))|` +  // Coeficientes numéricos
                                   `(?<![0-9.])${this.incognita}(?!\\w)`;            // Coeficiente implícito (1)
        
        // Regex para constantes (números sin incógnita)
        const patronConstantes = `[+-]?\\d+\\.?\\d*`;  // Números con/sin decimales
        
        this.regexCoeficientes = new RegExp(patronCoeficientes, 'g');
        this.regexConstantes = new RegExp(patronConstantes, 'g');
    }

    limpiarExpresion(expresion) {
        // Eliminar espacios y convertir a minúsculas
        return expresion
            .replace(/\s+/g, '')
            .toLowerCase()
            .replace(/--/g, '+')  // Doble negativo = positivo
            .replace(/\+\+/g, '+') // Doble positivo = positivo
            .replace(/\+\-/g, '-') // Positivo y negativo = negativo
            .replace(/\-\+/g, '-'); // Negativo y positivo = negativo
    }

    extraerTerminos(expresion) {
        const limpia = this.limpiarExpresion(expresion);
        
        // Extraer coeficientes
        const coeficientes = [];
        let match;
        
        while ((match = this.regexCoeficientes.exec(limpia)) !== null) {
            let coeficiente = match[0];
            
            // Si solo es la incógnita (sin número), coeficiente = 1
            if (coeficiente === this.incognita) {
                coeficientes.push(1);
            } else if (coeficiente === `+${this.incognita}`) {
                coeficientes.push(1);
            } else if (coeficiente === `-${this.incognita}`) {
                coeficientes.push(-1);
            } else {
                // Quitar la incógnita del string para obtener el número
                const numStr = coeficiente.replace(this.incognita, '');
                coeficientes.push(parseFloat(numStr));
            }
        }
        
        // Extraer constantes
        this.regexConstantes.lastIndex = 0; // Reiniciar regex
        const constantes = [];
        
        // Primero, crear una copia sin los términos con incógnita
        let sinIncognitas = limpia;
        const matchesCoef = [...limpia.matchAll(this.regexCoeficientes)];
        matchesCoef.forEach(match => {
            sinIncognitas = sinIncognitas.replace(match[0], '');
        });
        
        // Ahora extraer constantes de lo que queda
        while ((match = this.regexConstantes.exec(sinIncognitas)) !== null) {
            constantes.push(parseFloat(match[0]));
        }
        
        return { coeficientes, constantes, expresionLimpia: limpia };
    }

    validarEstructura(expresion) {
        const limpia = this.limpiarExpresion(expresion);
        
        // Verificar que tenga un solo signo igual
        const iguales = (limpia.match(/=/g) || []).length;
        if (iguales !== 1) {
            throw new Error(`Debe haber exactamente un signo "=". Encontrados: ${iguales}`);
        }
        
        // Dividir en lados
        const [ladoIzquierdo, ladoDerecho] = limpia.split('=');
        
        // Validar caracteres permitidos
        const caracteresPermitidos = new RegExp(`^[0-9${this.incognita}.+\\-=]+$`);
        if (!caracteresPermitidos.test(limpia)) {
            throw new Error('Caracteres no válidos en la expresión');
        }
        
        // Validar que no haya operadores duplicados o mal posicionados
        const patronOperadoresInvalidos = /[.][.]|^[*/]|[*/]$|[\+\-]{3,}/;
        if (patronOperadoresInvalidos.test(ladoIzquierdo) || 
            patronOperadoresInvalidos.test(ladoDerecho)) {
            throw new Error('Operadores mal posicionados');
        }
        
        // Validar uso correcto de la incógnita
        const patronIncognitaInvalida = new RegExp(`\\d${this.incognita}\\d|${this.incognita}{2,}`, 'g');
        if (patronIncognitaInvalida.test(limpia)) {
            throw new Error('Uso incorrecto de la incógnita');
        }
        
        return { ladoIzquierdo, ladoDerecho };
    }

    resolverEcuacion(expresion) {
        try {
            // 1. Validar estructura básica
            const { ladoIzquierdo, ladoDerecho } = this.validarEstructura(expresion);
            
            // 2. Extraer términos de ambos lados
            const izq = this.extraerTerminos(ladoIzquierdo);
            const der = this.extraerTerminos(ladoDerecho);
            
            // 3. Verificar si quedan caracteres sin procesar
            const verificarResiduos = (terminos, lado) => {
                let residuo = lado;
                
                // Eliminar todos los coeficientes encontrados
                const matches = [...lado.matchAll(this.regexCoeficientes)];
                matches.forEach(match => {
                    residuo = residuo.replace(match[0], '');
                });
                
                // Eliminar todas las constantes encontradas
                const constantesEncontradas = residuo.match(this.regexConstantes) || [];
                constantesEncontradas.forEach(constante => {
                    residuo = residuo.replace(constante, '');
                });
                
                // Quitar operadores válidos que quedaron
                residuo = residuo.replace(/[+-]/g, '');
                residuo = residuo.replace(/=/g, '');
                
                if (residuo.length > 0) {
                    throw new Error(`Caracteres no reconocidos en: ${lado}. Residuo: "${residuo}"`);
                }
            };
            
            verificarResiduos(izq, ladoIzquierdo);
            verificarResiduos(der, ladoDerecho);
            
            // 4. Calcular sumas
            const sumaCoefIzq = izq.coeficientes.reduce((a, b) => a + b, 0);
            const sumaConstIzq = izq.constantes.reduce((a, b) => a + b, 0);
            
            const sumaCoefDer = der.coeficientes.reduce((a, b) => a + b, 0);
            const sumaConstDer = der.constantes.reduce((a, b) => a + b, 0);
            
            // 5. Resolver ecuación: ax + b = cx + d
            const a = sumaCoefIzq - sumaCoefDer;  // Coeficientes de x
            const b = sumaConstDer - sumaConstIzq; // Constantes
            
            if (a === 0) {
                if (b === 0) {
                    return { solucion: 'Infinitas soluciones (identidad)' };
                } else {
                    return { solucion: 'Sin solución (contradicción)' };
                }
            }
            
            const x = b / a;
            
            return {
                solucion: x,
                pasos: {
                    ecuacionOriginal: expresion,
                    ecuacionSimplificada: `${sumaCoefIzq !== 0 ? `${sumaCoefIzq}${this.incognita}` : ''} ${sumaConstIzq >= 0 ? '+' : ''}${sumaConstIzq} = ${sumaCoefDer !== 0 ? `${sumaCoefDer}${this.incognita}` : ''} ${sumaConstDer >= 0 ? '+' : ''}${sumaConstDer}`,
                    ecuacionAgrupada: `${a}${this.incognita} = ${b}`,
                    resultado: `x = ${x}`
                }
            };
            
        } catch (error) {
            throw new Error(`Error al resolver ecuación: ${error.message}`);
        }
    }
}

// USO DEL VALIDADOR/RESOLVEDOR
const validador = new ValidadorEcuacion('x');

// Ejemplos de uso:
const ecuaciones = [
    "2x + 3 = 7",
    "3x - 5 = x + 7",
    "x = 4",
    "5 - 2x = 3x + 10",
    "2(x+3) = 4"  // Este fallará por los paréntesis
];

ecuaciones.forEach(ecuacion => {
    console.log(`\nResolviendo: ${ecuacion}`);
    try {
        const resultado = validador.resolverEcuacion(ecuacion);
        console.log(`Solución: ${resultado.solucion}`);
        if (typeof resultado.solucion === 'number') {
            console.log(`Resultado: x = ${resultado.solucion}`);
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
});

// Para usar en tu proyecto:
function resolverEcuacionLineal(expresion, incognita = 'x') {
    const validador = new ValidadorEcuacion(incognita);
    return validador.resolverEcuacion(expresion);
}

// Ejemplo específico:
// try {
//     const resultado = resolverEcuacionLineal("3x + 5 = 2x - 7", 'x');
//     console.log("\nResultado final:", resultado);
// } catch (error) {
//     console.error("Error:", error.message);
// }
const incognita = 'x';
const expresion = "-x+10+3x=20";
const varsRegex = new RegExp(`([+-]?\\d*\\.?\\d*)${incognita}(?!\\w)`, 'g');
const constanteRegex = /([+-]?\d+\.?\d*)/g;
const array = expresion.match(varsRegex) ?? [];
console.log(array)