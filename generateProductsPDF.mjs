/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Datos de productos (extraídos del CSV)
const productos = [
  {
    nombre: "OMNIPLUS",
    necesidad: "Multivitamínico integral, fortalecimiento del sistema inmunológico, base nutricional completa",
    modo: "1 sobre (20g) diluir en 200-250 mL de agua",
    beneficios: "Fortalece sistema inmunológico; limpia sangre, hígado y piel; regenera huesos y dientes; produce colágeno; evita deterioro celular"
  },
  {
    nombre: "MAGNUS",
    necesidad: "Energía y rendimiento físico, combate cansancio y fatiga",
    modo: "1 sobre (10g) diluir en 150-200 mL de agua",
    beneficios: "Produce energía de 6-8 horas; aumenta vigor y resistencia física; mejora rendimiento deportivo; disminuye fatiga y cansancio"
  },
  {
    nombre: "POWER MAKER",
    necesidad: "Regeneración celular, construcción de masa muscular, fortalecimiento cardiovascular",
    modo: "1 sobre (10g) diluir en 200-250 mL de agua, 30 min antes de ejercicio",
    beneficios: "Regenerador celular potente; aumenta y fortalece masa muscular; mejora sistema cardiovascular; estimula hormona del crecimiento"
  },
  {
    nombre: "DOLCE VITA",
    necesidad: "Regulación de glucosa en sangre, control de peso, diabetes",
    modo: "1 sobre (25g) diluir en 200-250 mL de agua, 1 hora antes de alimentos",
    beneficios: "Reduce niveles de azúcar en sangre; ideal para diabéticos; favorece utilización de grasa como energía; ayuda control del peso"
  },
  {
    nombre: "FIBER'N PLUS",
    necesidad: "Regulación del tránsito intestinal, estreñimiento, desinflamación del colon",
    modo: "1 sobre (25g) diluir en agua, 30 min antes de alimentos",
    beneficios: "Favorece tránsito intestinal; indicado para estreñimiento; desinfla colon; ideal para hemorroides; efectos probióticos"
  },
  {
    nombre: "ALOE BETA",
    necesidad: "Desinflamación del sistema digestivo, retención de líquidos, infecciones urinarias",
    modo: "1-3 botellas (240mL c/u) diarias, frío o a temperatura ambiente",
    beneficios: "Desinfecta y cicatriza rápidamente; gel de aloe vera antiinflamatorio; desinfla gastrointestinal; eliminador de toxinas"
  },
  {
    nombre: "PROBIOTIC",
    necesidad: "Mejora de digestión, equilibrio de flora intestinal, reducción de inflamación",
    modo: "1 sobre (10g) diluir en 150-200 mL de agua",
    beneficios: "Contiene probióticos vivos; mejora digestión; promueve equilibrio de flora intestinal; disminuye inflamación y dolor"
  },
  {
    nombre: "ONE C MIX PLUS",
    necesidad: "Fortalecimiento del sistema respiratorio e inmunológico, limpieza de sangre",
    modo: "1 sobre (15g) diluir en 150-200 mL de agua",
    beneficios: "Fortalece sistema inmunológico; fortalece sistema respiratorio; limpia sangre, hígado y piel; ideal para gripe y resfrio"
  },
  {
    nombre: "HOMO PLUS",
    necesidad: "Potencia sexual, inflamación de próstata, infecciones urinarias",
    modo: "1 sobre (15g) diluir en 150-200 mL de agua",
    beneficios: "Favorece potencia sexual; desinfla próstata; ideal para infecciones urinarias; disminuye riesgo de cáncer de próstata"
  },
  {
    nombre: "FEM PLUS SUPREME",
    necesidad: "Equilibrio hormonal, cólicos menstruales, quistes, miomas, menopausia",
    modo: "1 sobre (15g) diluir en 150-200 mL de agua, 2-3 veces al día",
    beneficios: "Equilibrio hormonal completo; elimina cólicos, quistes y miomas; reduce sofocos; ideal para todas las etapas de la mujer"
  },
  {
    nombre: "OPTIMUS",
    necesidad: "Nutrición cerebral, concentración, memoria, funciones cognitivas",
    modo: "1 sobre (10g) diluir en 150-200 mL de agua",
    beneficios: "Mejora concentración y memoria; favorece funciones cognitivas; optimiza sistema nervioso; ideal para migrañas"
  },
  {
    nombre: "UNDÚ",
    necesidad: "Regeneración de cartílagos, tendones, articulaciones, artritis, artrosis",
    modo: "1 sobre (15g) diluir en 200-250 mL de agua",
    beneficios: "Regenera cartílagos, tendones y ligamentos; repara articulaciones; auxiliar contra artritis, artrosis, osteoporosis"
  },
  {
    nombre: "ESTOP PLUS",
    necesidad: "Reducción de colesterol y triglicéridos, función cardiovascular",
    modo: "1 sobre (15g) diluir en 150-200 mL de agua",
    beneficios: "Reduce colesterol y triglicéridos; mejora función cardiovascular; mejora circulación sanguínea; previene infartos"
  },
  {
    nombre: "SUPER MIX SUPREME",
    necesidad: "Suplemento completo, anemia, mala nutrición, embarazo, lactancia",
    modo: "1 porción (30g) diluir en 300 mL de agua",
    beneficios: "Suplemento multivitamínico completo; ideal para anemia; indicado en embarazo y lactancia; ayuda subir plaquetas y defensas"
  },
  {
    nombre: "V KIDS SUPREME",
    necesidad: "Nutrición infantil, desarrollo neurológico, sistema inmunológico",
    modo: "1 porción (25g) diluir en 250 mL de agua",
    beneficios: "Favorece desarrollo neurológico y visual; fortalece sistema inmunológico; mejora vista y lenguaje; estimula inteligencia"
  }
];

function generatePDF() {
  const doc = new PDFDocument({ bufferPages: true, margin: 40 });
  const outputPath = path.join(__dirname, 'documents', 'Omnilife-Productos-y-Beneficios.pdf');

  // Crear el stream
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Título
  doc.fontSize(24).font('Helvetica-Bold').text('OMNILIFE', { align: 'center' });
  doc.fontSize(18).font('Helvetica-Bold').text('PRODUCTOS Y BENEFICIOS', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('Guía Completa de Suplementos Nutricionales', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  // Tabla de contenidos
  doc.fontSize(14).font('Helvetica-Bold').text('TABLA DE CONTENIDOS', { underline: true });
  doc.fontSize(10).font('Helvetica');
  productos.forEach((prod, idx) => {
    doc.text(`${idx + 1}. ${prod.nombre}`, { indent: 20 });
  });
  doc.addPage();

  // Detalle de cada producto
  productos.forEach((prod, idx) => {
    // Número y nombre del producto
    doc.fontSize(13).font('Helvetica-Bold').text(`${idx + 1}. ${prod.nombre}`, { color: '#0066CC' });
    doc.fontSize(10).font('Helvetica');
    
    // Necesidad/Solución
    doc.text('NECESIDAD O SOLUCIÓN:', { bold: true });
    doc.fontSize(9).text(prod.necesidad, { indent: 20, align: 'left' });
    doc.moveDown(0.3);

    // Modo de uso
    doc.fontSize(10).text('MODO DE USO/CONSUMO:', { bold: true });
    doc.fontSize(9).text(prod.modo, { indent: 20 });
    doc.moveDown(0.3);

    // Beneficios
    doc.fontSize(10).text('BENEFICIOS PRINCIPALES:', { bold: true });
    doc.fontSize(9).text(prod.beneficios, { indent: 20 });
    doc.moveDown(0.5);

    // Línea separadora
    if (idx < productos.length - 1) {
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke({ color: '#CCCCCC' });
      doc.moveDown(0.3);
    }

    // Agregar página nueva cada 3-4 productos
    if ((idx + 1) % 3 === 0 && idx < productos.length - 1) {
      doc.addPage();
    }
  });

  // Página final - Información adicional
  doc.addPage();
  doc.fontSize(14).font('Helvetica-Bold').text('INFORMACIÓN IMPORTANTE', { underline: true });
  doc.fontSize(10).font('Helvetica').moveDown();
  doc.text('FORMAS DE CONSUMO:', { bold: true });
  doc.fontSize(9).text('• La mayoría de productos se consumen diluyendo en agua (a temperatura ambiente o caliente)', { indent: 20 });
  doc.text('• Se pueden consumir a cualquier hora del día', { indent: 20 });
  doc.text('• Algunos productos son especiales para horarios específicos (pre/post ejercicio, antes de alimentos)', { indent: 20 });
  doc.moveDown();

  doc.fontSize(10).text('BENEFICIOS GENERALES:', { bold: true });
  doc.fontSize(9).text('• Todos los productos están formulados con ingredientes naturales', { indent: 20 });
  doc.text('• Contienen vitaminas, minerales y extractos herbales de alta calidad', { indent: 20 });
  doc.text('• Están diseñados para complementar la nutrición y mejorar la salud integral', { indent: 20 });
  doc.text('• No contienen químicos dañinos ni efectos secundarios graves reportados', { indent: 20 });
  doc.moveDown();

  doc.fontSize(10).text('RECOMENDACIONES:', { bold: true });
  doc.fontSize(9).text('• Consulte con un profesional de salud antes de iniciar cualquier suplemento', { indent: 20 });
  doc.text('• Siga las instrucciones de dosificación indicadas en cada producto', { indent: 20 });
  doc.text('• Mantenga los productos en lugar fresco y seco', { indent: 20 });
  doc.text('• Para mejores resultados, combine con una dieta equilibrada y ejercicio regular', { indent: 20 });

  doc.moveDown(1);
  doc.fontSize(9).font('Helvetica-Oblique').text('Este documento es una guía informativa de los productos Omnilife SN360.', { align: 'center' });
  doc.text('Para más información, visite www.omnilife.com', { align: 'center' });

  // Finalizar documento
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log(`✅ PDF creado exitosamente: ${outputPath}`);
      resolve(outputPath);
    });
    stream.on('error', reject);
  });
}

// Ejecutar
generatePDF().catch(err => {
  console.error('Error generando PDF:', err);
  process.exit(1);
});
