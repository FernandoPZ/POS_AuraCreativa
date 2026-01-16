import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const cargarImagen = (src) => {
    return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => { resolve(null); };
    });
};

export const generarTicketPDF = async (ventaId, usuarioNombre, carrito, total, logoTopSrc, watermarkSrc, redSocialSrc, configTienda, nombreCliente, linkMaps, fechaEntrega) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
    });
    const centerX = 40;
    let yPos = 5;
    const [imgTop, imgWatermark, imgRedSocial] = await Promise.all([
        cargarImagen(logoTopSrc),
        cargarImagen(watermarkSrc),
        cargarImagen(redSocialSrc)
    ]);
    // --- MARCA DE AGUA ---
    if (imgWatermark) {
        try {
            const wAncho = 60; 
            const wAlto = (imgWatermark.height * wAncho) / imgWatermark.width; 
            const wX = (80 - wAncho) / 2;
            doc.setGState(new doc.GState({ opacity: 0.10 }));
            doc.addImage(imgWatermark, 'PNG', wX, 60, wAncho, wAlto);
            doc.setGState(new doc.GState({ opacity: 1.0 }));
        } catch (e) { console.error(e); }
    }
    // --- LOGO SUPERIOR ---
    if (imgTop) {
        try {
            const lAncho = 30; 
            const lAlto = (imgTop.height * lAncho) / imgTop.width; 
            const lX = (80 - lAncho) / 2;
            doc.addImage(imgTop, 'PNG', lX, yPos, lAncho, lAlto);
            yPos += lAlto + 5; 
        } catch (e) { console.error(e); }
    }
    // --- CABECERA TIENDA ---
    if (!imgTop) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(configTienda?.NombreTienda || "Mi Tienda", centerX, yPos, { align: "center" });
        yPos += 5;
    }
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    // Dirección
    if (configTienda?.Direccion) {
        const direLines = doc.splitTextToSize(configTienda.Direccion, 70);
        doc.text(direLines, centerX, yPos, { align: "center" });
        yPos += (direLines.length * 4); 
    }
    // Red Social
    if (configTienda?.RedSocial) {
        const textoRed = configTienda.RedSocial;
        if (imgRedSocial) {
            const iconSize = 4;
            const textWidth = doc.getTextWidth(textoRed);
            const totalWidth = iconSize + 1 + textWidth;
            const startX = (80 - totalWidth) / 2;
            doc.addImage(imgRedSocial, 'PNG', startX, yPos - 3, iconSize, iconSize);
            doc.text(textoRed, startX + iconSize + 1, yPos);
        } else {
            doc.text(textoRed, centerX, yPos, { align: "center" });
        }
        yPos += 5;
    }
    // Teléfono
    if (configTienda?.Telefono) {
        doc.text(`Tel: ${configTienda.Telefono}`, centerX, yPos, { align: "center" });
        yPos += 4;
    }
    doc.text("--------------------------------", centerX, yPos, { align: "center" });
    yPos += 5;
    // --- DATOS VENTA ---
    doc.text(`Folio: #${ventaId}`, 5, yPos);
    yPos += 4;
    // 1. FECHA DE EMISIÓN (Hoy)
    const fechaEmision = new Date().toLocaleString(); // Fecha y hora actual
    doc.text(`Emisión: ${fechaEmision}`, 5, yPos);
    yPos += 4;
    // 2. FECHA DE ENTREGA (La que seleccionaste)
    if (fechaEntrega) {
        // Formatear un poco la fecha (AAAA-MM-DD -> DD/MM/AAAA)
        const [anio, mes, dia] = fechaEntrega.split('-');
        doc.setFont("helvetica", "bold"); // Negrita para resaltar
        doc.text(`Entrega: ${dia}/${mes}/${anio}`, 5, yPos);
        doc.setFont("helvetica", "normal"); // Volver a normal
        yPos += 4;
    }
    doc.text(`Cliente: ${nombreCliente || 'Público General'}`, 5, yPos);
    yPos += 4;
    doc.text(`Le atendió: ${usuarioNombre}`, 5, yPos);
    yPos += 2;
    // --- TABLA DE PRODUCTOS ---
    const columnas = ["Cant", "Prod", "P.U.", "Total"];
    const filas = carrito.map(item => [
        item.cantidad,
        item.tipo === 'COMBO' ? `[KIT] ${item.nombre}` : item.nombre || item.NomArticulo,
        `$${Number(item.precio).toFixed(2)}`,
        `$${(item.cantidad * item.precio).toFixed(2)}`
    ]);
    autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: yPos,
        theme: 'plain',
        styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak' },
        headStyles: { fontStyle: 'bold', halign: 'center' },
        columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 13, halign: 'right' },
            3: { cellWidth: 15, halign: 'right' }
        },
        margin: { left: 4, right: 4 }
    });
    const finalY = doc.lastAutoTable.finalY + 5;
    // --- TOTALES ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: $${total.toFixed(2)}`, 76, finalY, { align: "right" });
    let yPie = finalY + 15;
    // --- CÓDIGO QR ---
    if (linkMaps) {
        try {
            const qrDataUrl = await QRCode.toDataURL(linkMaps, { margin: 1 });
            const qrSize = 25;
            const qrX = (80 - qrSize) / 2;

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("Escanea para ver ubicación de entrega:", centerX, yPie, { align: "center" });
            
            doc.addImage(qrDataUrl, 'PNG', qrX, yPie + 2, qrSize, qrSize);
            yPie += qrSize + 5; 
        } catch (err) { console.error(err); }
    }
    // --- MENSAJE FINAL ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(configTienda?.MensajeTicket || "¡Gracias!", centerX, yPie, { align: "center" });
    doc.save(`Ticket_${ventaId}.pdf`);
    window.open(doc.output('bloburl'), '_blank');
};