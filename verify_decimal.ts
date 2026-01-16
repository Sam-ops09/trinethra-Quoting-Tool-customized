
import Decimal from 'decimal.js';
import { toDecimal } from './server/utils/financial';

try {
    console.log('Testing Decimal.js directly...');
    const d1 = new Decimal("1000.00");
    console.log(`new Decimal("1000.00") = ${d1.toString()}`);

    console.log('Testing toDecimal...');
    const d2 = toDecimal("1000.00");
    console.log(`toDecimal("1000.00") = ${d2.toString()}`);

    const totalStr = "1000.00";
    const d3 = toDecimal(totalStr);
    console.log(`toDecimal(var "${totalStr}") = ${d3.toString()}`);

} catch (e) {
    console.error('Decimal Error:', e);
}
