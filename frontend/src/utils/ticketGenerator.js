import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const cargarImagen = (src) => {
    return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.src = src;
        img.crossOrigin = "Anonymous"; 
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
    });
};

export const generarTicketPDF = async (
    ventaId, usuarioNombre, carrito, total, 
    logoTopSrc, watermarkSrc, redSocialImg, configTienda, 
    nombreCliente, LinkGoogleMaps, fechaEntrega
) => {

    console.log("Generando Ticket. LinkGoogleMaps:", LinkGoogleMaps);
    // --- 1. CÁLCULO DE ALTURA DINÁMICA ---
    let estimatedHeight = 60; // Base
    carrito.forEach(item => {
        estimatedHeight += 5;
        if (item.esCombo && item.ingredientes?.length > 0) {
            estimatedHeight += (item.ingredientes.length * 5);
        }
    });

    if (configTienda?.Direccion) estimatedHeight += 15;
    estimatedHeight += 25; 
    // --- 2. INICIALIZAR PDF ---
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, estimatedHeight]
    });
    const centerX = 40;
    let yPos = 3;
    // Cargar Logo
    const imgTop = await cargarImagen(logoTopSrc);
    // --- 3. LOGO / CABECERA ---
    if (imgTop) {
        const imgWidth = 20; 
        const imgHeight = (imgTop.height * imgWidth) / imgTop.width;
        doc.addImage(imgTop, 'PNG', (80 - imgWidth)/2, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 5;
    } else {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(configTienda?.NombreTienda || "Tu Tienda", centerX, yPos + 5, { align: "center" });
        yPos += 10;
    }
    // --- 4. DATOS DE LA TIENDA ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    if (configTienda?.Direccion) {
        const splitDir = doc.splitTextToSize(configTienda.Direccion, 70);
        doc.text(splitDir, centerX, yPos, { align: "center" });
        yPos += (splitDir.length * 4) + 2;
    }
    if (configTienda?.Telefono) {
        doc.text(`Tel: ${configTienda.Telefono}`, centerX, yPos, { align: "center" });
        yPos += 5;
    }

    doc.text("- - - - - - - - - - - - - - - - - - - - - -", centerX, yPos, { align: "center" });
    yPos += 5;

    // --- 5. INFO VENTA ---
    doc.setFontSize(8);
    doc.text(`Folio: #${ventaId}`, 5, yPos);
    doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 75, yPos, { align: "right" });
    yPos += 5;
    
    if (fechaEntrega) {
         doc.setFont("helvetica", "bold");
         doc.text(`ENTREGA: ${fechaEntrega}`, 5, yPos);
         doc.setFont("helvetica", "normal");
         yPos += 5;
    }

    doc.text(`Cliente: ${nombreCliente || 'General'}`, 5, yPos);
    yPos += 5;
    doc.text(`Atendió: ${usuarioNombre}`, 5, yPos);
    yPos += 2;

    // --- 6. TABLA ---
    const tableBody = [];
    carrito.forEach(item => {
        tableBody.push([
            item.cantidad,
            item.nombre || item.NomArticulo, 
            `$${Number(item.precio).toFixed(2)}`,
            `$${(item.cantidad * item.precio).toFixed(2)}`
        ]);
        if (item.esCombo && item.ingredientes?.length > 0) {
            item.ingredientes.forEach(ing => {
                tableBody.push([
                    '', 
                    `  • ${ing.NomArticulo} (${ing.Cantidad})`, 
                    '', 
                    '' 
                ]);
            });
        }
    });

    autoTable(doc, {
        startY: yPos,
        head: [['Cant', 'Concepto', 'P.U.', 'Total']],
        body: tableBody,
        theme: 'plain',
        styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak' },
        headStyles: { fontStyle: 'bold', halign: 'center', borderBottomWidth: 0.1 },
        columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 12, halign: 'right' },
            3: { cellWidth: 15, halign: 'right' }
        },
        margin: { left: 2, right: 2 },
        didParseCell: (data) => {
            if (data.section === 'body' && data.cell.raw && data.cell.raw.toString().includes('•')) {
                data.cell.styles.fontStyle = 'italic';
                data.cell.styles.textColor = [100, 100, 100];
                data.cell.styles.fontSize = 6;
            }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 5;

    // --- 7. TOTALES ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: $${Number(total).toFixed(2)}`, 75, finalY, { align: "right" });
    
    // --- 8. FOOTER (QR + MENSAJE LADO A LADO) ---
    const footerY = finalY + 8;
    
    // A. MENSAJE (Izquierda) - Ancho aprox 45mm
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    const msg = configTienda?.MensajeTicket || "¡Gracias por su compra!";
    const msgSplit = doc.splitTextToSize(msg, 45); // Ajustar texto a 45mm de ancho
    doc.text(msgSplit, 5, footerY + 3); // Margen izquierdo 5mm

    // B. QR (Derecha) - Si existe link
    if (LinkGoogleMaps) {
        try {
            const qrUrl = await QRCode.toDataURL(LinkGoogleMaps, { margin: 0 });
            const qrSize = 18; // Tamaño pequeño (18mm)
            const qrX = 58;    // Posición X (cerca del borde derecho)
            
            // Texto "Ubicación" encima del QR (opcional)
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6);
            doc.text("Ubicación:", qrX + (qrSize/2), footerY, { align: "center" });
            
            // Imagen QR
            doc.addImage(qrUrl, 'PNG', qrX, footerY + 2, qrSize, qrSize);
        } catch (e) {
            console.error("Error generando QR", e);
        }
    }

    // ABRIR PDF
    window.open(doc.output('bloburl'), '_blank');
};